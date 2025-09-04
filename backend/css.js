const mssql = require('mssql');
const path = require('path');
const config = require('./sql');
const { v4: uuidv4 } = require('uuid');

let pool;

async function getConnection() {
  if (!pool) {
    pool = new mssql.ConnectionPool(config);
    pool.on('error', err => {
      console.error('SQL Pool Error:', err);
      pool = null;
    });
  }
  
  if (!pool.connected) {
    await pool.connect();
  }
  
  return pool;
}

async function executeQueryWithTimeout(query, params = [], timeout = 60000) {
  const pool = await getConnection();
  const request = pool.request();

  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }

  const queryPromise = request.query(query);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Query timeout')), timeout)
  );

  try {
    const result = await Promise.race([queryPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error('SQL Query Error:', error);
    if (error.message === 'Query timeout') {
      const retryTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 30000)
      );
      return await Promise.race([request.query(query), retryTimeoutPromise]);
    }
    throw error;
  }
}

// Tạo queue để xử lý các request
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject
      });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      this.process(); // Xử lý request tiếp theo trong queue
    }
  }
}

const requestQueue = new RequestQueue();

exports.getCSS = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;
    const searchTerm = req.query.search || '';
    const offset = (page - 1) * pageSize;

    const searchCondition = searchTerm 
      ? `WHERE (BrandName LIKE @searchTerm OR ResCode LIKE @searchTerm OR Fullname LIKE @searchTerm OR FormName LIKE @searchTerm)` 
      : '';

    const countQuery = `
      SELECT COUNT(DISTINCT keys) as total 
      FROM databaseCSS WITH (NOLOCK)
      ${searchCondition}
      OPTION (RECOMPILE)
    `;

    const countResult = await executeQueryWithTimeout(countQuery, {
      searchTerm: searchTerm ? `%${searchTerm}%` : ''
    });

    if (!countResult?.recordset?.[0]?.total || countResult.recordset[0].total === 0) {
      return res.json({ 
        data: [],
        current: page,
        pageSize,
        total: 0
      });
    }

    const mainQuery = `
      WITH RankedData AS (
        SELECT 
          keys, Fullname, BrandName, Date, ResCode, FormName,
          ROW_NUMBER() OVER (PARTITION BY keys ORDER BY Date DESC) as rn
        FROM databaseCSS WITH (NOLOCK)
        ${searchCondition}
      )
      SELECT 
        keys, Fullname, BrandName, Date, ResCode, FormName,
        ROW_NUMBER() OVER (ORDER BY Date DESC) as RowNum
      FROM RankedData
      WHERE rn = 1
      ORDER BY Date DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
      OPTION (RECOMPILE)
    `;

    const params = {
      offset: offset,
      pageSize: pageSize,
      searchTerm: searchTerm ? `%${searchTerm}%` : ''
    };

    const result = await executeQueryWithTimeout(mainQuery, params);

    const total = countResult.recordset[0].total;
    const keys = result.recordset?.map(row => row.keys) || [];

    if (keys.length > 0) {
      const detailsQuery = `
        SELECT keys, Question, Replly, FormName
        FROM databaseCSS WITH (NOLOCK)
        WHERE keys IN (${keys.map(k => `'${k}'`).join(',')})
        OPTION (RECOMPILE)
      `;

      const detailsResult = await executeQueryWithTimeout(detailsQuery);

      const data = result.recordset.map(row => ({
        ...row,
        items: detailsResult.recordset
          .filter(detail => detail.keys === row.keys)
          .map(({ Question, Replly, FormName }) => ({ Question, Replly, FormName }))
      }));

      res.json({
        data,
        current: page,
        pageSize,
        total
      });
    }
  } catch (error) {
    console.error('Error in getCSS:', error);
    res.status(500).json({ 
      message: 'Lỗi khi truy vấn dữ liệu',
      error: error.message,
      data: [],
      current: 1,
      pageSize: 5,
      total: 0
    });
  }
};

exports.postCSS = async (req, res) => {
  try {
    const result = await requestQueue.add(async () => {
      const { Fullname, BrandName, Date, ResCode, items, FormName } = req.body;
      const uuid = uuidv4();

      // Validate input data
      if (!Fullname || !BrandName || !Date || !items || !Array.isArray(items)) {
        throw new Error('Dữ liệu không hợp lệ');
      }

      // Xử lý và lưu từng câu hỏi/câu trả lời
      for (const item of items) {
        if (!item.Question) continue;

        // Xử lý câu trả lời rate
        if (Array.isArray(item.Replly)) {
          // Với câu hỏi rate, tạo nhiều dòng riêng biệt
          for (let i = 0; i < item.Replly.length; i++) {
            const rateValue = item.Replly[i];
            const rateQuestion = `${item.Question}`;
            
            await executeQueryWithTimeout(
              `INSERT INTO databaseCSS (keys, Question, Replly, Fullname, BrandName, Date, ResCode, FormName)
               VALUES (@keys, @Question, @Replly, @Fullname, @BrandName, @Date, @ResCode, @FormName)`,
              {
                keys: uuid,
                Question: rateQuestion,
                Replly: rateValue.toString(), 
                Fullname: Fullname,
                BrandName: BrandName,
                Date: Date,
                ResCode: ResCode || '',
                FormName: FormName || ''
              }
            );
          }
        } else {
          // Xử lý các loại câu hỏi khác (text, choice, textarea)
          let replyValue = '';
          if (item.Replly !== null && item.Replly !== undefined) {
            replyValue = String(item.Replly);
          }

          if (replyValue.length > 4000) {
            replyValue = replyValue.substring(0, 4000);
          }

          await executeQueryWithTimeout(
            `INSERT INTO databaseCSS (keys, Question, Replly, Fullname, BrandName, Date, ResCode, FormName)
             VALUES (@keys, @Question, @Replly, @Fullname, @BrandName, @Date, @ResCode, @FormName)`,
            {
              keys: uuid,
              Question: item.Question,
              Replly: replyValue,
              Fullname: Fullname,
              BrandName: BrandName,
              Date: Date,
              ResCode: ResCode || '',
              FormName: FormName || ''
            }
          );
        }
      }

      return {
        success: true,
        message: 'Dữ liệu đã được lưu thành công'
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lưu dữ liệu',
      error: error.message
    });
  }
};

exports.getQueueStatus = (req, res) => {
  res.json({
    queueLength: requestQueue.queue.length,
    isProcessing: requestQueue.processing
  });
};
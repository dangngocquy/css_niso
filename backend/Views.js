// Views.js
const { connectDB } = require('./mongo');
const { v4: uuidv4 } = require('uuid');

// Thêm bản ghi view mới
exports.postViewsAdd = async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      userId,
      brandName,
      rating = 0,
      Fullname,
      viewDate,
      items,
      ResCode = '',
      TieuDe = '',
      Title = '',
      qt1 = '',
      qt2 = '',
    } = req.body;

    // Validate items
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: !items ? 'Thiếu trường items trong payload' : 'Trường items phải là một mảng',
        itemsType: typeof items,
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mảng items không được rỗng',
      });
    }

    // Validate all items at once
    const invalidItem = items.find(
      (item) =>
        !item.id ||
        !item.type ||
        !item.question ||
        (item.type === 'rate' && item.dapan !== undefined && !Array.isArray(item.dapan))
    );

    const viewData = {
      id: uuidv4(),
      userId,
      brandName,
      rating: parseFloat(rating),
      Fullname,
      viewDate,
      items,
      ResCode,
      TieuDe,
      Title,
      qt1,
      qt2,
      createdAt: new Date().toISOString(),
    };

    const collection = await connectDB('VIEW');

    // Kiểm tra trùng lặp ID (hiếm nhưng để đảm bảo an toàn)
    let maxAttempts = 3;
    while (maxAttempts > 0) {
      const existingView = await collection.findOne({ id: viewData.id });
      if (!existingView) break;
      viewData.id = uuidv4(); // Tạo ID mới nếu trùng
      maxAttempts--;
    }
    if (maxAttempts === 0) {
      throw new Error('Không thể tạo ID duy nhất sau nhiều lần thử');
    }

    await collection.insertOne(viewData);

    res.json({
      success: true,
      message: 'Đã ghi nhận dữ liệu thành công',
      data: viewData,
    });
  } catch (error) {
    console.error(`postViewsAdd failed after ${Date.now() - startTime}ms:`, error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message,
    });
  }
};

// Lấy tất cả bản ghi view với lọc và phân trang
exports.getAllViews = async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      page = 1,
      limit = 5,
      brandName = '',
      startDate,
      endDate,
      search = '',
      ResCode = '',
    } = req.query;

    // Validate input
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 5));

    if ((startDate && !endDate) || (!startDate && endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Cả startDate và endDate phải được cung cấp cùng nhau',
      });
    }

    const collection = await connectDB('VIEW');

    // Build the query
    let query = {};
    
    // Lấy thông tin user từ header
    const userInfo = req.headers['user-info'];
    let userPhanQuyen = false;
    let userResCode = '';

    if (userInfo) {
        try {
            const decodedUserInfo = decodeURIComponent(userInfo);
            const userData = JSON.parse(decodedUserInfo);
            userPhanQuyen = userData.PhanQuyen;
            userResCode = userData.ResCode;
        } catch (error) {
            console.error('Lỗi khi parse user info:', error);
            console.error('Raw user info:', userInfo);
        }
    }

    // Nếu không có quyền admin, chỉ lọc theo ResCode của user
    if (!userPhanQuyen && userResCode) {
        query.ResCode = userResCode;
    } else {
        // Nếu có quyền admin
        if (brandName) {
            query.brandName = brandName;
        }
        // Thêm điều kiện lọc theo ResCode nếu được cung cấp
        if (ResCode) {
            query.ResCode = ResCode;
        }
    }

    // Thêm điều kiện tìm kiếm
    if (search) {
        query.$or = [
            { Fullname: { $regex: search, $options: 'i' } },
            { ResCode: { $regex: search, $options: 'i' } },
            { 'items.question': { $regex: search, $options: 'i' } },
            { 'items.dapan': { $regex: search, $options: 'i' } }
        ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'startDate hoặc endDate không hợp lệ',
        });
      }

      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: start.toISOString(),
        $lte: end.toISOString(),
      };
    }

    // Projection để chỉ lấy các trường cần thiết
    const projection = {
      id: 1,
      brandName: 1,
      Fullname: 1,
      createdAt: 1,
      ResCode: 1,
    };

    // Pagination
    const skip = (pageNum - 1) * limitNum;

    // Fetch data with filters, projection, and pagination
    const views = await collection
      .find(query, { projection })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Get total count for pagination
    const total = await collection.countDocuments(query);

    res.json({
      success: true,
      data: views,
      current: pageNum,
      pageSize: limitNum,
      total,
    });
  } catch (error) {
    console.error(`getAllViews failed after ${Date.now() - startTime}ms:`, error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message,
    });
  }
};

// Lấy view theo ID
exports.getViewById = async (req, res) => {
    const startTime = Date.now();
    try {
      const { id } = req.params;
  
      const collection = await connectDB('VIEW');
      const view = await collection.findOne(
        { id },
        {
          projection: {
            id: 1,
            userId: 1,
            brandName: 1,
            rating: 1,
            Fullname: 1,
            viewDate: 1,
            createdAt: 1,
            items: 1,
            TieuDe: 1,
            Title: 1,
            qt1: 1,
            qt2: 1,
            ResCode: 1,
          },
        }
      );
  
      if (!view) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy view với ID này',
        });
      }
  
      res.json({
        success: true,
        data: view,
      });
    } catch (error) {
      console.error(`getViewById failed after ${Date.now() - startTime}ms:`, error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
      });
    }
  };

// Xóa view theo ID
exports.deleteViewById = async (req, res) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;

    // Lấy thông tin user từ header
    const userInfo = req.headers['user-info'];
    let userPhanQuyen = false;

    if (userInfo) {
      try {
        const decodedUserInfo = decodeURIComponent(userInfo);
        const userData = JSON.parse(decodedUserInfo);
        userPhanQuyen = userData.PhanQuyen;
      } catch (error) {
        console.error('Lỗi khi parse user info:', error);
      }
    }

    // Kiểm tra quyền admin
    if (!userPhanQuyen) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa view',
      });
    }

    const collection = await connectDB('VIEW');
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy view với ID này',
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa view thành công',
    });
  } catch (error) {
    console.error(`deleteViewById failed after ${Date.now() - startTime}ms:`, error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message,
    });
  }
};
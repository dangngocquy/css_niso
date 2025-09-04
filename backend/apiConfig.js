const fs = require('fs').promises;
const path = require('path');

// Đường dẫn đến file lưu trữ cấu hình
const CONFIG_FILE_PATH = path.join(__dirname, '../src/data/apiConfig.json');

// Đảm bảo thư mục tồn tại
const ensureDirectoryExists = async () => {
  try {
    // Tạo thư mục data nếu chưa tồn tại
    await fs.mkdir(path.dirname(CONFIG_FILE_PATH), { recursive: true });
    try {
      await fs.access(CONFIG_FILE_PATH);
    } catch {
      await fs.writeFile(
        CONFIG_FILE_PATH,
        JSON.stringify({ 
          apiConfigs: [], 
          drafts: [], 
          currentConfig: null 
        }, null, 2)
      );
    }
  } catch (error) {
    console.error('Lỗi khi tạo thư mục/file:', error);
    throw error;
  }
};

// Lưu cấu hình API
const saveApiConfig = async (req, res) => {
  try {
    // Đảm bảo thư mục và file tồn tại trước
    await ensureDirectoryExists();

    const { apiConfig, fields } = req.body;
    let currentData;

    try {
      // Đọc file hiện tại
      const fileContent = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
      currentData = JSON.parse(fileContent);
    } catch (error) {
      // Nếu có lỗi khi đọc file, khởi tạo dữ liệu mới
      currentData = {
        apiConfigs: [],
        currentConfig: null
      };
    }

    // Đảm bảo apiConfigs là một mảng
    if (!Array.isArray(currentData.apiConfigs)) {
      currentData.apiConfigs = [];
    }

    // Tạo cấu hình API mới
    const newApiConfig = {
      id: Date.now().toString(),
      ...apiConfig,
      fields,
      lastUpdated: new Date().toISOString()
    };

    // Thêm vào mảng apiConfigs
    currentData.apiConfigs.push(newApiConfig);
    currentData.currentConfig = newApiConfig;

    // Ghi file
    await fs.writeFile(
      CONFIG_FILE_PATH,
      JSON.stringify(currentData, null, 2)
    );

    // Trả về response thành công
    res.json({
      message: 'Đã lưu cấu hình API thành công',
      config: newApiConfig
    });

  } catch (error) {
    console.error('Lỗi khi lưu cấu hình:', error);
    res.status(500).json({
      error: 'Lỗi khi lưu cấu hình API',
      details: error.message
    });
  }
};

// Lấy danh sách API
const getApiList = async (req, res) => {
  try {
    const configData = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    const data = JSON.parse(configData);
    res.json({ apiConfigs: data.apiConfigs || [] });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ apiConfigs: [] });
    } else {
      res.status(500).json({ error: 'Lỗi khi đọc danh sách API' });
    }
  }
};

// Lưu dữ liệu nháp
const saveDraftApiConfig = async (req, res) => {
  try {
    await ensureDirectoryExists();
    const { apiConfig, fields } = req.body;
    
    let currentData = { apiConfigs: [], drafts: [], currentConfig: null };
    try {
      const existingData = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
      currentData = JSON.parse(existingData);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    // Thêm vào danh sách nháp
    const newDraft = {
      id: Date.now().toString(),
      ...apiConfig,
      fields,
      lastUpdated: new Date().toISOString(),
      isDraft: true
    };

    // Thay vì thêm vào mảng drafts, ghi đè toàn bộ dữ liệu
    await fs.writeFile(
      CONFIG_FILE_PATH, 
      JSON.stringify(newDraft, null, 2)
    );

    res.json({ 
      message: 'Đã lưu dữ liệu nháp thành công',
      draft: newDraft
    });
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu nháp:', error);
    res.status(500).json({ error: 'Lỗi khi lưu dữ liệu nháp' });
  }
};

// Xóa cấu hình API
const deleteApiConfig = async (req, res) => {
  try {
    await ensureDirectoryExists();
    
    const { id } = req.params;
    const fileContent = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    const data = JSON.parse(fileContent);

    // Lọc ra các cấu hình không có id trùng với id cần xóa
    data.apiConfigs = data.apiConfigs.filter(config => config.id !== id);
    
    // Nếu config đang xóa là current config thì set về null
    if (data.currentConfig && data.currentConfig.id === id) {
      data.currentConfig = null;
    }

    // Ghi lại file
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(data, null, 2));

    res.json({ message: 'Đã xóa cấu hình API thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa cấu hình API:', error);
    res.status(500).json({ error: 'Lỗi khi xóa cấu hình API' });
  }
};

// Lấy cấu hình API hiện tại
const getApiConfig = async (req, res) => {
  try {
    const configData = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    const data = JSON.parse(configData);
    
    if (data.currentConfig) {
      res.json(data.currentConfig);
    } else {
      res.json(null);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json(null);
    } else {
      console.error('Lỗi khi đọc cấu hình API:', error);
      res.status(500).json({ error: 'Lỗi khi đọc cấu hình API' });
    }
  }
};

// Cập nhật cấu hình API
const updateApiConfig = async (req, res) => {
  try {
    await ensureDirectoryExists();
    
    const { id } = req.params;
    const { apiConfig, fields } = req.body;
    
    const fileContent = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    const currentData = JSON.parse(fileContent);
    
    const configIndex = currentData.apiConfigs.findIndex(config => config.id === id);
    
    if (configIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy cấu hình API' });
    }
    
    // Cập nhật cấu hình
    currentData.apiConfigs[configIndex] = {
      ...currentData.apiConfigs[configIndex],
      ...apiConfig,
      fields,
      lastUpdated: new Date().toISOString()
    };
    
    // Nếu đang là current config thì cập nhật luôn
    if (currentData.currentConfig && currentData.currentConfig.id === id) {
      currentData.currentConfig = currentData.apiConfigs[configIndex];
    }
    
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(currentData, null, 2));
    
    res.json({ 
      message: 'Đã cập nhật cấu hình API thành công',
      config: currentData.apiConfigs[configIndex]
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật cấu hình:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật cấu hình API' });
  }
};

// Thêm hàm để đọc file question.json
const getQuestionsByBrand = async (req, res) => {
  try {
    const { brandName } = req.params;
    const questionFilePath = path.join(__dirname, '../src/data/question.json');
    
    const fileContent = await fs.readFile(questionFilePath, 'utf8');
    const questions = JSON.parse(fileContent);
    
    // Lọc câu hỏi theo tên thương hiệu
    const brandQuestions = questions.filter(
      q => q.BrandName === brandName || q.brandName === brandName
    );
    
    res.json({
      questions: brandQuestions
    });
  } catch (error) {
    console.error('Lỗi khi đọc danh sách câu hỏi:', error);
    res.status(500).json({ 
      error: 'Không thể tải danh sách câu hỏi',
      details: error.message 
    });
  }
};

// Thêm route mới để gửi dữ liệu từ API
const postDataToApi = async (req, res) => {
  try {
    const { apiConfig, selectedQuestions, formData } = req.body;
    
    // Validate input
    if (!apiConfig || !apiConfig.url || !selectedQuestions) {
      return res.status(400).json({ error: 'Thiếu thông tin cấu hình' });
    }

    // Chuẩn bị dữ liệu để gửi
    const payload = selectedQuestions.map(question => ({
      questionId: question.id,
      questionName: question.name,
      questionType: question.type,
      value: formData[question.name] || null
    }));

    // Gửi request đến API đích
    const axios = require('axios');
    const response = await axios({
      method: apiConfig.method,
      url: apiConfig.url,
      headers: apiConfig.username && apiConfig.password 
        ? { 
            'Authorization': `Basic ${Buffer.from(`${apiConfig.username}:${apiConfig.password}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        : { 'Content-Type': 'application/json' },
      data: payload
    });

    res.json({
      message: 'Gửi dữ liệu thành công',
      responseData: response.data
    });
  } catch (error) {
    console.error('Lỗi khi gửi dữ liệu:', error);
    res.status(500).json({ 
      error: 'Không thể gửi dữ liệu',
      details: error.message 
    });
  }
};

module.exports = {
  getApiConfig,
  getApiList,
  saveApiConfig,
  saveDraftApiConfig,
  deleteApiConfig,
  updateApiConfig,
  getQuestionsByBrand,
  postDataToApi
}; 
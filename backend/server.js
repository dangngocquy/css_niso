const cors = require('cors');
const express = require('express');
const forge = require('node-forge');
const https = require('https');
const fs = require('fs');
const path = require('path');
const loginUser = require('./loginUser');
const usersAccount = require('./usersAccount');
const CSS = require('./css');
const Chinhanh = require('./rescode');
const Question = require('./question');
const apiConfig = require('./apiConfig');
const Views = require('./Views');

const port = 3009;
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Replaces bodyParser.json()

// SSL Certificate Setup
const pfxFile = fs.readFileSync(path.resolve(__dirname, '../SSL/star-niso-com-vn.pfx'));
const p12Asn1 = forge.asn1.fromDer(pfxFile.toString('binary'), false);
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, '123456');

let cert, key;
for (const safeContents of p12.safeContents) {
  for (const safeBag of safeContents.safeBags) {
    if (safeBag.cert) {
      cert = forge.pki.certificateToPem(safeBag.cert);
    } else if (safeBag.key) {
      key = forge.pki.privateKeyToPem(safeBag.key);
    }
  }
}

// Basic Authentication Middleware
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Tính hack hay gì ? ! 😈' });
  }
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const [username, password] = auth;
  if (username === 'Niso' && password === 'Niso@123') {
    next();
  } else {
    res.status(401).json({ message: 'Thông tin đăng nhập không chính xác' });
  }
};

// Routes
app.post('/login/dashboard', basicAuth, loginUser.postLoginUser);
app.get('/users/all', basicAuth, usersAccount.getusersAccount);
app.post('/users/add', basicAuth, usersAccount.postusersAccount);
app.put('/users/update/:keys', basicAuth, usersAccount.putusersAccount);
app.delete('/users/delete/:keys', basicAuth, usersAccount.deleteusersAccount);
app.get('/users/download', basicAuth, usersAccount.downloadUsers);
app.post('/users/upload', basicAuth, usersAccount.uploadUsers);
app.put('/usersAccount/updateFormName', basicAuth, usersAccount.updateFormName);

app.post('/views/add', basicAuth, Views.postViewsAdd);
app.get('/views/all', basicAuth, Views.getAllViews);
app.get('/views/:id', basicAuth, Views.getViewById);
app.delete('/views/:id', basicAuth, Views.deleteViewById);

app.post('/css/add', basicAuth, CSS.postCSS);
app.get('/css/all', basicAuth, CSS.getCSS);

app.get('/chinhanh/all', basicAuth, Chinhanh.getChinhanh);
app.post('/chinhanh/add', basicAuth, Chinhanh.postChinhanh);
app.put('/chinhanh/update/:id', basicAuth, Chinhanh.putChinhanh);
app.delete('/chinhanh/delete/:id', basicAuth, Chinhanh.deleteChinhanh);
app.post('/chinhanh/upload', basicAuth, Chinhanh.uploadChinhanh);
app.get('/chinhanh/download', basicAuth, Chinhanh.downloadChinhanh);

app.post('/question/custom/add', basicAuth, Question.postCustomQuestion);
app.put('/question/edit/:id', basicAuth, Question.putQuestions);
app.get('/question/all', basicAuth, Question.getQuestions);
app.get('/question/brand/:brandName/step/:step', basicAuth, Question.getQuestionsByBrand);
app.get('/question/brand/:brandName', basicAuth, Question.getQuestionsByBrand);
app.delete('/question/brand/:brandName/:id', basicAuth, Question.deleteQuestionsByBrand);
app.put('/question/custom/:id', basicAuth, Question.updateCustomQuestion);

// Thêm route mới cho API kết hợp
app.get('/question/combined', basicAuth, Question.getCombinedQuestions);

// Thêm các route mới cho form lưu trữ
app.get('/question/storage/list', basicAuth, Question.getFormStorage);
app.get('/question/storage/list/brand-branch', basicAuth, Question.getFormStorageByBrandAndBranch);
app.post('/question/storage/add', basicAuth, Question.addFormStorage);
app.delete('/question/storage/:id', basicAuth, Question.deleteFormStorage);
app.put('/question/storage/:id', basicAuth, Question.updateFormStorage);
app.get('/question/steps/:questionId', basicAuth, Question.getQuestionFromSteps);
app.put('/question/steps/:questionId', basicAuth, Question.updateQuestionInSteps);
app.post('/question/storage/copy-steps', basicAuth, Question.copyStep);

app.get('/question/thankyou', basicAuth, Question.getThankYouContent);
app.post('/question/thankyou', basicAuth, Question.saveThankYouContent);

app.get('/api-config/get', basicAuth, apiConfig.getApiConfig);
app.get('/api-config/list', basicAuth, apiConfig.getApiList);
app.post('/api-config/save', basicAuth, apiConfig.saveApiConfig);
app.post('/api-config/save-draft', basicAuth, apiConfig.saveDraftApiConfig);
app.put('/api-config/:id', basicAuth, apiConfig.updateApiConfig);
app.delete('/api-config/:id', basicAuth, apiConfig.deleteApiConfig);

app.get('/questions/:brandName', basicAuth, apiConfig.getQuestionsByBrand);
app.post('/api-config/post-data', basicAuth, apiConfig.postDataToApi);

// HTTPS Server Setup
const httpsOptions = { key, cert };
const server = https.createServer(httpsOptions, app);
server.setMaxListeners(0); // Adjust based on your needs
server.setTimeout(60000); // 1 minute
server.keepAliveTimeout = 30000; // 30 seconds
server.headersTimeout = 35000; // 35 seconds

// Debug listener count
console.log('Initial close listeners:', server.listeners('close').length);

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

server.listen(port, () => {
  console.log(`HTTPS server khởi chạy thành công tại port: ${port}`);
});
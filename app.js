const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const forge = require('node-forge');
const fs = require('fs');
const https = require('https');

const app = express();

const backendServer = spawn('node', ['backend/server.js'], {
    stdio: 'inherit'
});

backendServer.on('close', (code) => {
    console.log(`Backend server đã đóng với lỗi ${code}`);
});

process.on('SIGTERM', () => {
    backendServer.kill();
    process.exit();
});

const baseProxyConfig = {
    target: 'https://localhost:3009',
    changeOrigin: true,
    secure: false,
    timeout: 60000,
    proxyTimeout: 60000,
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
    }
};

const routes = [
    { method: 'POST', path: '/login/dashboard' },
    { method: 'GET', path: '/users/all' },
    { method: 'POST', path: '/users/upload' },
    { method: 'GET', path: '/users/download' },
    { method: 'POST', path: '/question/custom/add' },
    { method: 'POST', path: '/users/add' },
    { method: 'PUT', path: '/users/update/:keys' },
    { method: 'DELETE', path: '/users/delete/:keys' },
    { method: 'POST', path: '/css/add' },
    { method: 'GET', path: '/css/all' },
    { method: 'GET', path: '/chinhanh/all' },
    { method: 'POST', path: '/chinhanh/add' },
    { method: 'PUT', path: '/chinhanh/update/:id' },
    { method: 'DELETE', path: '/chinhanh/delete/:id' },
    { method: 'POST', path: '/chinhanh/upload' },
    { method: 'GET', path: '/chinhanh/download' },
    { method: 'PUT', path: '/question/edit/:id' },
    { method: 'GET', path: '/question/all' },
    { method: 'GET', path: '/question/download' },
    { method: 'POST', path: '/question/upload' },
    { method: 'GET', path: '/question/brand/:brandName/step/:step' },
    { method: 'GET', path: '/question/brand/:brandName' },
    { method: 'DELETE', path: '/question/brand/:brandName/:id' },
    { method: 'GET', path: '/question/thankyou' },
    { method: 'POST', path: '/question/thankyou' },
    { method: 'GET', path: '/visit/check/:ip' },
    { method: 'POST', path: '/visit/add' },
    { method: 'GET', path: '/visit/count' },
    { method: 'PUT', path: '/question/custom/:id' },
    { method: 'GET', path: '/question/translations' },
    { method: 'GET', path: '/api-config/get' },
    { method: 'GET', path: '/api-config/list' },
    { method: 'POST', path: '/api-config/save' },
    { method: 'POST', path: '/api-config/save-draft' },
    { method: 'PUT', path: '/api-config/:id' },
    { method: 'DELETE', path: '/api-config/:id' },
    { method: 'GET', path: '/questions/:brandName' },
    { method: 'POST', path: '/api-config/post-data' },
    { method: 'POST', path: '/views/add' },
    { method: 'GET', path: '/views/:id' },
    { method: 'GET', path: '/views/all' },
    { method: 'DELETE', path: '/views/:id' },
    { method: 'GET', path: '/question/combined' },
    { method: 'GET', path: '/question/storage/list' },
    { method: 'GET', path: '/question/storage/list/brand-branch' },
    { method: 'POST', path: '/question/storage/add' },
    { method: 'DELETE', path: '/question/storage/:id' },
    { method: 'PUT', path: '/question/storage/:id' },
    { method: 'GET', path: '/question/steps/:questionId' },
    { method: 'PUT', path: '/question/steps/:questionId' },
    { method: 'POST', path: '/question/storage/copy-steps' },
    { method: 'PUT', path: '/usersAccount/updateFormName' }
];

// Di chuyển middleware bảo vệ source lên đầu
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

// Chặn truy cập map files
app.use('*.map', (req, res) => {
    res.status(404).send('Not found');
});

// Các route proxy
routes.forEach(route => {
    const handler = createProxyMiddleware({
        ...baseProxyConfig,
        onProxyRes: (proxyRes, req, res) => {
            proxyRes.headers['X-Proxied'] = 'true';
        },
        pathRewrite: {}
    });

    if (Array.isArray(route.method)) {
        route.method.forEach(method => {
            app[method.toLowerCase()](route.path, handler);
        });
    } else {
        app[route.method.toLowerCase()](route.path, handler);
    }
});

app.use(express.static(path.join(__dirname, './build'), {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));
app.get('*.css', (req, res, next) => {
    res.set('Content-Type', 'text/css');
    next();
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './build', 'index.html'));
});

const pfxFile = fs.readFileSync(path.resolve(__dirname, 'SSL/star-niso-com-vn.pfx'));
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

const PORT = 3008;
const httpsServer = https.createServer({
    key: key,
    cert: cert
}, app);

httpsServer.listen(PORT, () => {
    console.log(`Frontend server đang chạy trên cổng ${PORT} (HTTPS)`);
});

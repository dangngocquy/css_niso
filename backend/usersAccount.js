const mssql = require('mssql');
const config = require('./sql');
const fs = require('fs');
const path = require('path');

const pool = new mssql.ConnectionPool(config);
const poolConnect = pool.connect();

exports.getusersAccount = async (req, res) => {
    try {
        await poolConnect;

        const result = await pool
            .request()
            .query('SELECT keys, Fullname, Email, PhanQuyen, Password, BrandName, ResCode, FormName FROM databaseAccount');

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching users:', error.message, error.code, error.number);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy dữ liệu người dùng' });
    }
};

exports.postusersAccount = async (req, res) => {
    const { Fullname, Email, Password, PhanQuyen, BrandName, ResCode, FormName } = req.body;

    try {
        await poolConnect;

        const result = await pool
            .request()
            .input('Fullname', mssql.NVarChar, Fullname)
            .input('Email', mssql.NVarChar, Email)
            .input('Password', mssql.NVarChar, Password)
            .input('PhanQuyen', mssql.Bit, PhanQuyen)
            .input('BrandName', mssql.NVarChar, BrandName)
            .input('ResCode', mssql.NVarChar, ResCode)
            .input('FormName', mssql.NVarChar, FormName)
            .query('INSERT INTO databaseAccount (keys, Fullname, Email, Password, PhanQuyen, BrandName, ResCode, FormName) VALUES (NEWID(), @Fullname, @Email, @Password, @PhanQuyen, @BrandName, @ResCode, @FormName)');

        res.json({ message: 'Thêm người dùng thành công' });
    } catch (error) {
        console.error('Error adding user:', error.message, error.code, error.number);
        if (error.number === 2627) {
            res.status(400).json({ message: `Email ${Email} đã tồn tại trong cơ sở dữ liệu` });
        } else {
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi thêm người dùng' });
        }
    }
};

exports.putusersAccount = async (req, res) => {
    const { Fullname, Email, Password, PhanQuyen, BrandName, ResCode, FormName } = req.body;
    const { keys } = req.params;

    try {
        await poolConnect;

        const result = await pool
            .request()
            .input('keys', mssql.UniqueIdentifier, keys)
            .input('Fullname', mssql.NVarChar, Fullname)
            .input('Email', mssql.NVarChar, Email)
            .input('Password', mssql.NVarChar, Password)
            .input('PhanQuyen', mssql.Bit, PhanQuyen)
            .input('BrandName', mssql.NVarChar, BrandName)
            .input('ResCode', mssql.NVarChar, ResCode)
            .input('FormName', mssql.NVarChar, FormName)
            .query('UPDATE databaseAccount SET Password = @Password, Email = @Email, Fullname = @Fullname, PhanQuyen = @PhanQuyen, BrandName = @BrandName, ResCode = @ResCode, FormName = @FormName WHERE keys = @keys');

        res.json({ message: 'Cập nhật thông tin người dùng thành công' });
    } catch (error) {
        console.error('Error updating user:', error.message, error.code, error.number);
        if (error.number === 2627) {
            res.status(400).json({ message: `Email ${Email} đã tồn tại trong cơ sở dữ liệu` });
        } else {
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi cập nhật người dùng' });
        }
    }
};

exports.deleteusersAccount = async (req, res) => {
    const { keys } = req.params;

    try {
        await poolConnect;

        const result = await pool
            .request()
            .input('keys', mssql.UniqueIdentifier, keys)
            .query('DELETE FROM databaseAccount WHERE keys = @keys');

        res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        console.error('Error deleting user:', error.message, error.code, error.number);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi xóa người dùng' });
    }
};

exports.downloadUsers = async (req, res) => {
    try {
        await poolConnect;

        const result = await pool
            .request()
            .query('SELECT keys, Fullname, Email, Password, PhanQuyen, BrandName, ResCode, FormName FROM databaseAccount');

        const filePath = path.join(__dirname, 'users_export.json');
        fs.writeFileSync(filePath, JSON.stringify(result.recordset, null, 2));

        res.download(filePath, 'users_export.json', (err) => {
            if (err) {
                console.error('Error sending JSON file:', err);
                res.status(500).json({ message: 'Lỗi khi gửi file JSON' });
            }
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Error downloading users:', error.message, error.code, error.number);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi tải xuống dữ liệu' });
    }
};

exports.uploadUsers = async (req, res) => {
    try {
        await poolConnect;

        if (!req.files || !req.files.file) {
            return res.status(400).json({ message: 'Không có file được tải lên' });
        }

        const file = req.files.file;
        if (!file.mimetype.includes('json')) {
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: 'Chỉ chấp nhận file JSON' });
        }

        const fileContent = fs.readFileSync(file.path, 'utf-8');
        let users;
        try {
            users = JSON.parse(fileContent);
        } catch (error) {
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: `Định dạng JSON không hợp lệ: ${error.message}` });
        }

        if (!Array.isArray(users)) {
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: 'File JSON phải là một mảng các đối tượng người dùng' });
        }

        // Kiểm tra schema của bảng databaseAccount
        const schemaCheck = await pool
            .request()
            .query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'databaseAccount'
            `);
        const requiredColumns = ['keys', 'Fullname', 'Email', 'Password', 'PhanQuyen', 'BrandName', 'ResCode', 'FormName'];
        const existingColumns = schemaCheck.recordset.map(col => col.COLUMN_NAME);
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        if (missingColumns.length > 0) {
            fs.unlinkSync(file.path);
            return res.status(500).json({ message: `Bảng databaseAccount thiếu các cột: ${missingColumns.join(', ')}` });
        }

        for (const user of users) {
            // Kiểm tra các trường bắt buộc
            if (!user.Fullname || !user.Email || !user.Password || !user.BrandName || !user.ResCode) {
                fs.unlinkSync(file.path);
                return res.status(400).json({ message: `Thiếu các trường bắt buộc trong đối tượng người dùng: ${JSON.stringify(user)}` });
            }

            // Kiểm tra email trùng lặp trước khi insert
            const emailCheck = await pool
                .request()
                .input('Email', mssql.NVarChar, user.Email)
                .query('SELECT COUNT(*) AS count FROM databaseAccount WHERE Email = @Email');
            if (emailCheck.recordset[0].count > 0) {
                fs.unlinkSync(file.path);
                return res.status(400).json({ message: `Email ${user.Email} đã tồn tại trong cơ sở dữ liệu` });
            }

            await pool
                .request()
                .input('Fullname', mssql.NVarChar, user.Fullname)
                .input('Email', mssql.NVarChar, user.Email)
                .input('Password', mssql.NVarChar, user.Password)
                .input('PhanQuyen', mssql.Bit, user.PhanQuyen === true || user.PhanQuyen === 'true' || user.PhanQuyen === 1 ? 1 : 0)
                .input('BrandName', mssql.NVarChar, user.BrandName)
                .input('ResCode', mssql.NVarChar, user.ResCode)
                .input('FormName', mssql.NVarChar, user.FormName)
                .query('INSERT INTO databaseAccount (keys, Fullname, Email, Password, PhanQuyen, BrandName, ResCode, FormName) VALUES (NEWID(), @Fullname, @Email, @Password, @PhanQuyen, @BrandName, @ResCode, @FormName)');
        }

        fs.unlinkSync(file.path);
        res.json({ message: 'Tải lên người dùng thành công' });
    } catch (error) {
        console.error('Error uploading users:', error.message, error.code, error.number);
        fs.unlinkSync(req.files?.file?.path || '');
        if (error.number === 2627) {
            res.status(400).json({ message: `Email đã tồn tại trong cơ sở dữ liệu` });
        } else {
            res.status(500).json({ message: `Lỗi xử lý file tải lên: ${error.message}` });
        }
    }
};

exports.updateFormName = async (req, res) => {
    const { brandNames, formId, chinhanhs } = req.body;

    try {
        await poolConnect;

        // Nếu brandNames là null, cập nhật tất cả FormName về null
        if (!brandNames) {
            await pool
                .request()
                .query('UPDATE databaseAccount SET [FormName] = NULL');

            return res.json({ message: 'Cập nhật FormName thành công' });
        }

        // Chuyển đổi brandNames thành mảng nếu là string
        const brandNamesArray = Array.isArray(brandNames) ? brandNames : [brandNames];

        // Tạo điều kiện WHERE cho câu lệnh SQL
        let whereClause = 'BrandName IN (';
        brandNamesArray.forEach((brand, index) => {
            whereClause += `@brand${index},`;
        });
        whereClause = whereClause.slice(0, -1) + ')';

        // Thêm điều kiện cho chi nhánh nếu có
        if (chinhanhs && chinhanhs.length > 0) {
            whereClause += ' AND ResCode IN (';
            chinhanhs.forEach((chinhanh, index) => {
                whereClause += `@chinhanh${index},`;
            });
            whereClause = whereClause.slice(0, -1) + ')';
        }

        // Tạo request với các tham số
        const request = pool.request();
        request.input('formId', mssql.NVarChar, formId);
        brandNamesArray.forEach((brand, index) => {
            request.input(`brand${index}`, mssql.NVarChar, brand);
        });
        if (chinhanhs && chinhanhs.length > 0) {
            chinhanhs.forEach((chinhanh, index) => {
                request.input(`chinhanh${index}`, mssql.NVarChar, chinhanh);
            });
        }

        // Thực hiện cập nhật
        await request.query(`UPDATE databaseAccount SET [FormName] = @formId WHERE ${whereClause}`);

        res.json({ message: 'Cập nhật FormName thành công' });
    } catch (error) {
        console.error('Error updating FormName:', error.message, error.code, error.number);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi cập nhật FormName' });
    }
};
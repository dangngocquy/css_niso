const mssql = require('mssql');
const config = require('./sql');

//login users
exports.postLoginUser = async (req, res) => {
  const { Email, Password } = req.body;
  try {
    await mssql.connect(config);

    const result = await mssql.query(`SELECT keys, Fullname, PhanQuyen, BrandName, Email, ResCode FROM databaseAccount WHERE Email = '${Email}' AND Password = '${Password}'`);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      res.json({ keys: user.keys, Fullname: user.Fullname, PhanQuyen: user.PhanQuyen, BrandName: user.BrandName, Email: user.Email, ResCode: user.ResCode});
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

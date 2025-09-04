const config = {
  user: 'sa',
  password: 'Niso@123',
  server: 'DESKTOP-5C9IQJK',
  database: 'CSSNISO',
  driver: 'msnodesqlv8',
  pool: {
    max: 100000,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    trustedConnection: true,
    enableArithAbort: true,
    trustServerCertificate: true,
    charset: 'UTF-8',
    encrypt: false,
    requestTimeout: 0,
    maxRows: 0
  }
};

module.exports = config;


// const config = {
//   user: 'sa',
//   password: '123123123',
//   server: '127.0.0.1',
//   port: 8433,
//   database: 'CSSNISO',
//   driver: 'msnodesqlv8',
//   pool: {
//     max: 100000,
//     min: 0,
//     idleTimeoutMillis: 30000
//   },
//   options: {
//     trustedConnection: true,
//     enableArithAbort: true,
//     trustServerCertificate: true,
//     charset: 'UTF-8',
//     encrypt: false,
//     requestTimeout: 0,
//     maxRows: 0
//   }
// };

// module.exports = config;
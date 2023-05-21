const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const connection = mysql.createConnection({
  host: '103.65.237.213',
  user: 'root',
  password: 'Bogis1996_',
  database: 'WAJS',
});

connection.connect((error) => {
  if (error) {
    console.error('Gagal terhubung ke MySQL:', error);
  } else {
    console.log('Terhubung ke MySQL!');
  }
});


const checkClientId = function (apiKey) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM clients WHERE api_key = ?', [apiKey], (error, results) => {
          if (error) {
            console.error('Gagal mengambil data:', error);
            reject(error);
          } else {
            resolve(results[0]);
          }
        });
      });
}

const deleteClient = function (apiKey){
  return new Promise((resolve, reject) => {
    connection.query('DELETE FROM clients WHERE api_key = ?', [apiKey], (error, results) => {
      if (error) {
        console.error('Gagal mengambil data:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
const allClientReady = function(){
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM clients WHERE expired_at >= now() ', (error, results) => {
      if (error) {
        console.error('Gagal mengambil data:', error);
        reject(false);
      } else {
        resolve(results);
      }
    });
  });
}
const createClientId = function (payload) {
  const newRecord = {
    api_key : uuidv4(),
    client_id: payload.client_id,
    name: payload.name,
    description: payload.description,
    expired_at: payload.expired_at,
  };
  const query = 'INSERT INTO clients SET ?';
  return new Promise((resolve, reject) => {
    connection.query(query, newRecord, (error, result) => {
        if (error){
          reject(error)
        };
        resolve(newRecord)
      });
    });
}

module.exports = {
    checkClientId, createClientId, allClientReady, deleteClient
}
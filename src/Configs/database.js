const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const {infoLog, emergecyLog} = require('../Services/telegram');

require('dotenv').config()
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

connection.connect((error) => {
  if (error) {
    console.error('Gagal terhubung ke MySQL:', error);
    emergecyLog(error);
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
const checkClientWithClientId = function (clientID) {
  return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM clients WHERE client_id = ?', [clientID], (error, results) => {
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
const allClientReady = function(clientID){
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM clients WHERE expired_at >= now() and client_id LIKE '%${clientID}%'`, (error, results) => {
      if (error) {
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
          reject(false)
        }else{
          resolve(newRecord)
        }
      });
    });

}

const updateClientId = function (payload) {

  const query = 'UPDATE clients SET expired_at = ? WHERE client_id = ? ';
  return new Promise((resolve, reject) => {
    connection.query(query, [payload.expired_at, payload.client_id], (error, result) => {
        if (error){
          reject(false)
        }else{
          resolve(result)
        }
      });
    });
}

module.exports = {
    checkClientId, createClientId, allClientReady, deleteClient, checkClientWithClientId, updateClientId
}
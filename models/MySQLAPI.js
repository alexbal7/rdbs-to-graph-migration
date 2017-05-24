'use strict';

const mysql = require('mysql');
const config = require('../config').MySQL_DATA;

class MySQLAPI {

  constructor() {
    this.connection = mysql.createConnection({
      host: config.HOST,
      user: config.USER,
      password: config.PASSWORD,
      database: config.DATABASE
    });

    return this;
  }

  getTables() {
    return new Promise((resolve, reject) => {
      this.connection.query('SHOW TABLES;', (err, res, fields) => {
        if (err) return reject(err);
        let tables = res.map(table => {
          return table[Object.keys(table)[0]];
        });
        resolve(tables);
      });
    });
  }

  getRelations() {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT `TABLE_NAME`,`COLUMN_NAME`,`REFERENCED_TABLE_NAME`,`REFERENCED_COLUMN_NAME` ' +
        'FROM `INFORMATION_SCHEMA`.`KEY_COLUMN_USAGE` ' +
        'WHERE `TABLE_SCHEMA` = SCHEMA() AND `REFERENCED_TABLE_NAME` IS NOT NULL;', (err, res, fields) => {
        if (err) return reject(err);
        let relations = res.map(relation => {
          return {
            sourceTable: relation.TABLE_NAME,
            sourceColumn: relation.COLUMN_NAME,
            targetTable: relation.REFERENCED_TABLE_NAME,
            targetColumn: relation.REFERENCED_COLUMN_NAME
          };
        });
        resolve(relations);
      });
    });
  }

  getPrimaryKeys() {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT `TABLE_NAME`, `COLUMN_NAME` ' +
        'FROM `INFORMATION_SCHEMA`.`KEY_COLUMN_USAGE` ' +
        'WHERE `TABLE_SCHEMA` = SCHEMA() AND `CONSTRAINT_NAME` = \'PRIMARY\' ', (err, res, fields) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  getData(table) {
    return new Promise((resolve, reject) => {
      this.connection.query(`SELECT * FROM ${table}`, (err, res, fields) => {
        if (err) return reject(err);

        let data = res.map(data => {
          return Object.assign({}, data);
        });

        let dataFromTable = {[table]: data};

        resolve(dataFromTable);
      });
    });
  }

}

module.exports = MySQLAPI;

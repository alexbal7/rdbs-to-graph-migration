'use strict';

class DataController {

  constructor() {
    return this;
  }

  getDataFromMySQL(schema) {
    return new Promise((resolve, reject) => {
      let promiseArrData = [];

      schema.forEach(table => {
        promiseArrData.push(mysqlInstance.getData(table.name));
      });

      Promise.all(promiseArrData).then(
        res => resolve(res), err => reject(err)
      );
    });
  }

  importDataToOrient(data) {
    return new Promise((resolve, reject) => {
      let promiseArrData = [];

      data.forEach(table => {
        let tableName = Object.keys(table)[0];
        let tableData = table[tableName];
        tableData.forEach(record => {
          promiseArrData.push(orientInstance.createVertex(tableName, record));
        });
      });

      Promise.all(promiseArrData).then(
        res => resolve(), err => reject()
      );
    });
  }

  constructEdges(schema) {
    return new Promise((resolve, reject) => {
      let promiseArrEdges = [];

      schema.edges.forEach(edge => {
        promiseArrEdges.push(this._processEdge(edge));
      });

      Promise.all(promiseArrEdges).then(
        res => resolve(), err => reject(err)
      );
    });
  }

  _processEdge(info) {
    return new Promise((resolve, reject) => {
      let promiseArrEdges = [];

      orientInstance.getRecords(info.sourceTable).then(res => {
        res.forEach(sourceRecord => {
          if (sourceRecord[info.source] !== null && sourceRecord[info.source] !== '') {
            orientInstance.getRecords(info.targetTable, {[info.target]: sourceRecord[info.source]}).then(res => {
              res.forEach(targetRecord => {
                promiseArrEdges.push(orientInstance.createEdge(info.name, sourceRecord['@rid'], targetRecord['@rid']));
              });
            });
          }
        });
      });

      Promise.all(promiseArrEdges).then(
        res => resolve(), err => reject(err)
      );
    });
  }

}

module.exports = DataController;

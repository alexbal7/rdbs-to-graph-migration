'use strict';

class SchemaController {

  constructor() {
    return this;
  }

  getMysqlSchema() {
    return new Promise((resolve, reject) => {
      Promise.all([
        mysqlInstance.getTables(),
        mysqlInstance.getRelations(),
        mysqlInstance.getPrimaryKeys()
      ]).then(res => {
        let tables = res[0];
        let relations = res[1];

        let schema = [];

        tables.forEach(tableName => {
          let table = {};
          table.name = tableName;
          table.fks = [];

          if (res[2].some(table => table.TABLE_NAME === tableName)) {
            table.pk = res[2].find(table => table.TABLE_NAME === tableName)['COLUMN_NAME'];
          }

          relations.forEach(relation => {
            if (relation.sourceTable === tableName) {
              let fk = {};
              fk.source = relation.sourceColumn;
              fk.target = relation.targetColumn;
              fk.refTable = relation.targetTable;
              table.fks.push(fk);
            }
          });

          schema.push(table);
        });

        resolve(schema);
      }, err => reject(err));
    });
  }

  importSchemaToOrient(schema) {
    return new Promise((resolve, reject) => {
      let promiseArrVertex = [];
      let promiseArrEdge = [];

      let processedEdges = [];

      schema.vertexes.forEach(vertex => {
        promiseArrVertex.push(orientInstance.createVertexClass(vertex.name));
      });

      schema.edges.forEach(edge => {
        if (processedEdges.indexOf(edge.name) === -1) {
          processedEdges.push(edge.name);
          promiseArrEdge.push(orientInstance.createEdgeClass(edge.name));
        }
      });

      Promise.all(promiseArrVertex.concat(promiseArrEdge)).then(
        res => resolve(), err => reject(err)
      );
    });
  }

}

module.exports = SchemaController;

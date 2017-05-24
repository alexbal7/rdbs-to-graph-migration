'use strict';

class MappingController {

  static convertSchema(schema) {
    let orientSchema = {};
    orientSchema.vertexes = MappingController._convertTablesToVertexes(schema);
    orientSchema.edges = MappingController._convertFksToEdges(schema);
    return orientSchema;
  }

  static _convertTablesToVertexes(schema) {
    return schema.map(table => {
      let vertex = {};
      vertex.name = table.name;
      if (table.hasOwnProperty('pk')) {
        vertex.pk = table.pk;
      }
      return vertex;
    });
  }

  static _convertFksToEdges(schema) {
    let tablesWithFks = schema.filter(table => table.fks.length > 0);
    let edges = [];

    tablesWithFks.forEach(table => {
      table.fks.forEach(fk => {
        let edge = {};
        edge.name = `${table.name}Has${fk.refTable}`;
        edge.source = fk.source;
        edge.target = fk.target;
        edge.sourceTable = table.name;
        edge.targetTable = fk.refTable;
        edges.push(edge);
      });
    });

    return edges;
  }

}

module.exports = MappingController;

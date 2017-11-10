'use strict';

/**
 * Program workflow
 *
 * 1. MySQL schema
 * 2. Mapping
 * 3. Import schema to Orient
 * 4. import data to Orient
 */

const config = require('./config').ORIENT_DATA;

const SchemaController = require('./controllers/SchemaController');
const MappingController = require('./controllers/MappingController');
const DataController = require('./controllers/DataController');

let schemaController = new SchemaController();
let dataController = new DataController();

const mySqlApi = require('./models/MySQLAPI');
const orientApi = require('./models/OrientAPI');

global.mysqlInstance = new mySqlApi();
global.orientInstance = new orientApi();

let startTime = Date.now();

console.log('Migration script starting...');

orientInstance.prepareDatabase().then(() => {

  console.log(`OrientDB database named ${config.DATABASE} is ready!`);

  schemaController.getMysqlSchema().then(
    res => {
      console.log('MySQL database schema was got');

      let mysqlSchema = res;
      let orientSchema = MappingController.convertSchema(mysqlSchema);

      console.log('MySQL schema was mapped to OrientDB schema');

      schemaController.importSchemaToOrient(orientSchema).then(res => {
        console.log('Schema was imported to OrientDB');

        dataController.getDataFromMySQL(mysqlSchema).then(res => {
          console.log('MySQL database data was got');

          let dataFromMysql = res;

          dataController.importDataToOrient(dataFromMysql).then(res => {
            console.log('MySQL database data was imported to OrientDB');

            dataController.constructEdges(orientSchema).then(res => {
              console.log('Edges between data was constructed');

              let endTime = (Date.now() - startTime) / 1000;
              console.log(`Migration script made off the work for ${endTime} seconds!`);

            }, err => console.log(err));
          }, err => console.log(err));
        }, err => console.log(err));
      }, err => console.log(err));
    }, err => console.log(err));
}, err => console.log(err));

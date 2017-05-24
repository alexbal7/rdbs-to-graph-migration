'use strict';

const orient = require('orientjs');
const config = require('../config').ORIENT_DATA;

class OrientAPI {

  constructor() {
    this.server = orient({
      host: config.HOST,
      port: config.PORT,
      username: config.USERNAME,
      password: config.PASSWORD
    });

    return this;
  }

  prepareDatabase() {
    return new Promise((resolve, reject) => {
      this.server.list().then(list => {
        if (!(list.some(db => db.name === config.DATABASE))) {
          console.log(`OrientDB database "${config.DATABASE}" does not exist. Creating...`);

          this.server.create({
            name: config.DATABASE,
            type: 'graph',
            storage: 'plocal'
          }).then(created => {
            this.db = this.server.use(config.DATABASE);
            resolve();
          }, err => {
            reject(err);
          });

        } else {
          this.db = this.server.use(config.DATABASE);
          resolve();
        }
      }, err => reject(err));
    });
  }

  createVertexClass(name) {
    return new Promise((resolve, reject) => {
      this.db.class.create(name, 'V').then(
        res => resolve(), err => reject(err)
      );
    });
  }

  createEdgeClass(name) {
    return new Promise((resolve, reject) => {
      this.db.class.create(name, 'E').then(
        res => resolve(), err => reject(err)
      );
    });
  }

  createVertex(name, data) {
    return new Promise((resolve, reject) => {
      this.db.create('VERTEX', name).set(data).one().then(
        res => resolve(), err => reject(err)
      );
    });
  }

  createEdge(name, source, target) {
    return new Promise((resolve, reject) => {
      this.db.create('EDGE', name).from(source).to(target).one().then(
        res => resolve(), err => reject(err)
      );
    });
  }

  getRecords(name, where) {
    return new Promise((resolve, reject) => {
      if (!!where) {
        this.db.select().from(name).where(where).all().then(
          res => resolve(res), err => reject(err)
        );
      } else {
        this.db.select().from(name).all().then(
          res => resolve(res), err => reject(err)
        );
      }
    });
  }
}

module.exports = OrientAPI;

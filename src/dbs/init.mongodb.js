// db/database.js (CommonJS)
'use strict';

const mongoose = require('mongoose');
require('dotenv').config();

const connectString = process.env.MONGODB_URI;

const { countConnect } = require('../helpers/check.connect'); 

class Database {
  constructor() {
    this.connect();
  }

  // connect
  connect(type = 'mongodb') {
    // enable mongoose debug logs (colored if supported)
    mongoose.set('debug', true);
    mongoose.set('debug', { color: true });

    mongoose
      .connect(connectString, {
        // recommended options (adjust as needed)
        // useNewUrlParser: true,            // for very old mongoose versions
        // useUnifiedTopology: true,
        autoIndex: true,
        maxPoolSize: 50,
        
      })
      .then(() => console.log('Connected MongoDB Success PRO', countConnect()))
      .catch((err) => {
        console.error('MongoDB connection error:', err?.message || err);
      });
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}


const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
// If you also want to export the class for testing:
// module.exports.Database = Database;

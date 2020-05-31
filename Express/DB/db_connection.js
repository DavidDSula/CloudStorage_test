var sqlite3 = require('sqlite3').verbose();
var db      = new sqlite3.cached.Database('./DB/Database.sql', (err)={ if(err){ return console.error(err.message)}});

module.exports = db;
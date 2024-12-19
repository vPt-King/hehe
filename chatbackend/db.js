const mysql = require("mysql2");
var db;

connectDatabase = () => {
  if (!db) {
    db = mysql.createConnection({
      host: "14.225.254.35",
      user: "root",
      password: "123",
      database: "project"
    });

    db.connect(function(err) {
      if (!err) {
        console.log("Database is connected!");
      } else {
        console.log("Error connecting database!");
        throw err;
      }
    });
  }
  return db;
};

module.exports = connectDatabase();
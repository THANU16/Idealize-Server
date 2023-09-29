// database.js
const mysql = require("mysql");

class database {
  constructor() {
    // this.host = "localhost";
    // this.user = "root";
    // this.port = 3306;
    // this.password = "root";
    // this.database = "lifeserver";

    // this.host = "sql107.infinityfree.com";
    // // this.host = "192.168.219.247";
    // this.port = 3306; // Replace with your desired port
    // this.user = "if0_35023243";
    // this.password = "wmQYLUnlxQ7kaf";
    // this.database = "if0_35023243_lifeserver";

    this.host = "familytree.mysql.database.azure.com";
    // this.host = "192.168.219.247";
    this.port = 3306; // Replace with your desired port
    this.user = "kobinarth22";
    this.password = "Itsme043";
    this.database = "lifeserver";

    this.connection = mysql.createConnection({
      host: this.host,
      port: this.port, // Add the port here
      user: this.user,
      password: this.password,
      database: this.database,
    });
  }

  connectDatabase(fileName) {
    this.connection.connect((err) => {
      if (err) {
        console.log(fileName + " error database connection");
        console.log(err);
      } else {
        console.log(fileName + " connected");
      }
    });
  }
}

module.exports = database; // Export the database class

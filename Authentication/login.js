const express = require("express");
const bcrypt = require('bcryptjs');

const generateSessionToken = require("./generateSessionToken");
const database = require("../utils/databaseUtils"); // Import the database class

const databaseObj = new database();
databaseObj.connectDatabase("login");

const router = express.Router();

const connection = databaseObj.connection;

router.post("/", (req, res) => {
  body = req.body;
  const password = body.password;

  // check the employee already exist or not
  const getQuery = "select * from  all_user where email = ? ;";

  connection.query(getQuery, [body.email], (err, result) => {
    if (err) {
      res.send({
        sucess: false,
        isExist: false,
        error: err,
        result: null,
      });
    } else {
      if (result.length == 0) {
        res.send({
          sucess: false,
          isExist: false,
          error: null,
          result: result,
        });
      } else {
        const userID = result[0].id;
        const typeID = result[0].typeID;
        const hash = result[0].password;

        bcrypt.compare(password, hash, function (err, result) {
          if (result) {
            // password is valid
            // create the session token
            const sessionToken = generateSessionToken(userID);
            res.send({
              sucess: true,
              isExist: true,
              error: null,
              result: result,
              sessionToken: sessionToken,
              typeID: typeID,
            });
          } else {
            res.send({
              sucess: false,
              isExist: true,
              error: null,
              result: result,
            });
          }
        });
      }
    }
  });
});

module.exports = router;

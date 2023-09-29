const express = require("express");
const bcrypt = require('bcryptjs');
const decodedUserId = require("../Authentication/decodedToken");
const database = require("../utils/databaseUtils");

const databaseObj = new database();
const router = express.Router();

databaseObj.connectDatabase("User");

const connection = databaseObj.connection;

router.post("/add", (req, res) => {
  body = req.body;
  const password = body.password;

  // check the employee already exist or not
  const checkQuery =
    "select id as id, typeID as TypeID, email as email from  all_user where email = ? union all select userID as id, typeID as TypeID, email as email from  user where NIC = ?  limit 2;";

  const insertQuery =
    "insert into  user (firstName, lastName, phoneNumber, NIC, address, DOB, email, password,preferredType,typeID) values(?,?,?,?,?,?,?,?,?,?);";

  connection.query(checkQuery, [body.email, body.nic], (err, result) => {
    if (err) {
      console.log(err);
      res.send({
        sucess: false,
        isExist: false,
        error: err,
        result: null,
      });
    } else {
      if (result.length > 0) {
        res.send({
          sucess: false,
          isExist: true,
          error: null,
          result: result,
        });
      } else {
        // encrpt the user pasword
        bcrypt.hash(password, 10, function (err, hash) {
          // store hash in the database
          connection.query(
            insertQuery,
            [
              body.firstName,
              body.lastName,
              body.phoneNo,
              body.nic,
              body.address,
              body.dob,
              body.email,
              hash,
              body.preferredType,
              "us",
            ],
            (err, result) => {
              if (err) {
                res.send({
                  sucess: false,
                  isExist: false,
                  error: err,
                  result: null,
                });
              } else {
                res.send({
                  sucess: true,
                  isExist: false,
                  error: null,
                  result: result,
                });
              }
            }
          );
        });
      }
    }
  });
});

router.post("/showDetail", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ");

  const userID = decodedUserId(sessionToken);

  const getQuery = "select * from  user where userID = ?;";

  connection.query(getQuery, (err, result) => {
    if (err) {
      res.send({
        sucess: false,
        isExist: false,
        error: err,
        result: null,
      });
    } else {
      if (result.length > 0) {
        res.send({
          sucess: true,
          isExist: true,
          error: null,
          result: result,
        });
      } else {
        res.send({
          sucess: false,
          isExist: false,
          error: null,
          result: result,
        });
      }
    }
  });
});

module.exports = router;

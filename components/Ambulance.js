const express = require("express");
const decodedUserId = require("../Authentication/decodedToken");
const database = require("../utils/databaseUtils");

const databaseObj = new database();
const router = express.Router();

databaseObj.connectDatabase("Ambulance");

const connection = databaseObj.connection;

// connected
router.post("/add", (req, res) => {
  const ambulanceNumber = req.body.ambulanceNo;
  const sessionToken = req.headers.authorization.replace("key ", "");
  const hospitalID = decodedUserId(sessionToken);
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  // check the employee already exist or not
  const checkQuery = "SELECT * FROM ambulance where ambulanceNumber = ?;";

  // type id is the forigen key so we set the forigen key correctly
  const insertQuery =
    "insert into ambulance (ambulanceNumber, hospitalID, latitude, longitude) values(?,?,?,?);";

  connection.query(checkQuery, [ambulanceNumber], (err, result) => {
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
        connection.query(
          insertQuery,
          [ambulanceNumber, hospitalID, latitude, longitude],
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
      }
    }
  });
});

router.post("/showDetail", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ");

  const ambulanceID = decodedUserId(sessionToken);

  const getQuery = "select * from ambulance where ambulanceID = ?;";

  connection.query(getQuery, ambulanceID, (err, result) => {
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

router.post("/getLocation", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ");

  const ambulanceID = decodedUserId(sessionToken);

  const getQuery =
    "select ambulanceID, lat, lng  from ambulance where ambulanceID = ?;";

  connection.query(getQuery, ambulanceID, (err, result) => {
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

router.post("/setLocation", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ");

  const ambulanceID = decodedUserId(sessionToken);

  const setQuery =
    "insert into ambulanceLocation (ambulanceID, lat, lng) values (?, ?, ?);";

  connection.query(
    setQuery,
    [ambulanceID, body.lat, body.lng],
    (err, result) => {
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
    }
  );
});

module.exports = router;

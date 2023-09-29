const express = require("express");
const bcrypt = require("bcryptjs");
const decodedUserId = require("../Authentication/decodedToken");
const database = require("../utils/databaseUtils");

const databaseObj = new database();
const router = express.Router();

databaseObj.connectDatabase("Hospital");

const connection = databaseObj.connection;

// connected
router.post("/add", (req, res) => {
  const body = req.body;
  const typeID = "ho";
  const password = body.password;

  // check the employee already exist or not
  const checkQuery = "select * from  all_user where email = ? ;";

  // type id is the forigen key so we set the forigen key correctly
  const insertQuery =
    "INSERT INTO hospital (Latitude, Longitude, district, email, name, contactNumber, type, password, postalCode, province, registeredDate, registrationNo, website, typeID) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?);";

  connection.query(checkQuery, [body.email], (err, result) => {
    console.log();
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
              body.Latitude,
              body.Longitude,
              body.district,
              body.email,
              body.hospitalName,
              body.hotline,
              body.ownership,
              hash,
              body.postalCode,
              body.province,
              body.registeredDate,
              body.registrationNo,
              body.webPage,
              typeID,
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

  const hospitalID = decodedUserId(sessionToken);

  const getQuery = "select * from  hospital where hospitalID = ?;";

  connection.query(getQuery, hospitalID, (err, result) => {
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

router.post("/getAllHospitalsLocations", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ");

  const hospitalID = decodedUserId(sessionToken);

  const getQuery = "select hospitalID, name, lat, lng from  hospital;";

  connection.query(getQuery, hospitalID, (err, result) => {
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

router.get("/getAllHospitalAmbulance", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ", "");

  const hospitalID = decodedUserId(sessionToken);

  const getQuery = "select * from  ambulance_details where hospitalID = ?;";

  connection.query(getQuery, [hospitalID], (err, result) => {
    if (err) {
      res.send({
        sucess: false,
        error: err,
        result: null,
      });
    } else {
      res.send({
        sucess: true,
        error: null,
        result: result,
      });
    }
  });
});

router.post("/getAllHospitalDrivers", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ", "");
  const hospitalID = decodedUserId(sessionToken);

  const getQuery = "select * from  driver where hospitalID = ?;";

  connection.query(getQuery, [hospitalID], (err, result) => {
    if (err) {
      res.send({
        sucess: false,
        error: err,
        result: null,
      });
    } else {
      res.send({
        sucess: true,
        error: null,
        result: result,
      });
    }
  });
});

router.post("/getHospitalAmbulanceLocation", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ", "");
  // console.log(sessionToken);

  const hospitalID = decodedUserId(sessionToken);

  const getQuery =
    "select * from  ambulance_and_location where hospitalID = ?;";

  connection.query(getQuery, [hospitalID], (err, result) => {
    if (err) {
      res.send({
        sucess: false,
        error: err,
        result: null,
      });
    } else {
      res.send({
        sucess: true,
        error: null,
        result: result,
      });
    }
  });
});

router.post("/getRecentRequest", (req, res) => {
  const requestID = req.body.data;
  const getQuery = "SELECT * FROM  emergency_request where  requestID = ?;";

  connection.query(getQuery, [requestID], (err, result) => {
    if (err) {
      res.send({
        sucess: false,
        error: err,
        result: null,
      });
    } else {
      res.send({
        sucess: true,
        error: null,
        result: result,
      });
    }
  });
});

router.get("/getRequest", (req, res) => {
  const getQuery =
    "SELECT * FROM emergency_request where ( ambulanceID  is null and hospitalID is null and status = 'Pending');";

  connection.query(getQuery, (err, result) => {
    if (err) {
      res.send({
        sucess: false,
        error: err,
        result: null,
      });
    } else {
      res.send({
        sucess: true,
        error: null,
        result: result,
      });
    }
  });
});

router.post("/showAllDrivers", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ");

  const hospitalID = decodedUserId(sessionToken);

  const getQuery = "select * from  driver where hospitalID = ?;";

  connection.query(getQuery, hospitalID, (err, result) => {
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

router.post("/AvailabileAmbulance", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ");

  const hospitalID = decodedUserId(sessionToken);

  const getQuery =
    "select * from  ambulance where hospitalID = ? and isAvailabile = true;";

  connection.query(getQuery, hospitalID, (err, result) => {
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

router.get("/getAvailableAmbulance", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ", "");

  const hospitalID = decodedUserId(sessionToken);
  const getQuery =
    "SELECT * FROM ambulance where hospitalID = ? and isAvailable = 1;";

  connection.query(getQuery, [hospitalID], (err, result) => {
    if (err) {
      res.send({
        sucess: false,
        error: err,
        result: null,
      });
    } else {
      res.send({
        sucess: true,
        error: null,
        result: result,
      });
    }
  });
});

router.get("/getHospitalLocation", (req, res) => {
  const body = req.body;
  const sessionToken = req.headers.authorization.replace("key ", "");

  const hospitalID = decodedUserId(sessionToken);
  const getQuery =
    "SELECT latitude, longitude FROM hospital where hospitalID = ?";

  connection.query(getQuery, [hospitalID], (err, result) => {
    if (err) {
      res.send({
        sucess: false,
        error: err,
        result: null,
      });
    } else {
      res.send({
        sucess: true,
        error: null,
        result: result,
      });
    }
  });
});

module.exports = router;

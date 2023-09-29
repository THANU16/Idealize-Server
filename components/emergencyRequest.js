const express = require("express");
const { WebSocketServer } = require("ws");
const decodedUserId = require("../Authentication/decodedToken");
const url = require("url");
const database = require("../utils/databaseUtils");
const databaseObj = new database();

// Map to store session tokens and associated WebSocket connections for hospitals.
const hospitalsConnection = new Map();

const router = express.Router();
databaseObj.connectDatabase("Emergency");
const connection = databaseObj.connection;



// Create a function to handle WebSocket connections.
function handleWebSocketConnections(server) {

  // Handle emergency requests from users
  router.post("/addEmergencyRequest", (req, res) => {
    const requestData = req.body; // Assuming you receive the emergency request data from the user
    const sessionToken = req.headers.authorization.replace("key ", "");
    const userID = decodedUserId(sessionToken);
    const setQuery =
      "insert into emergency_request (userID, status, lat, lng, requestedTime) values(?,?,?,?,?);";
    const getIDQuery =
      "select * from emergency_request where (userID = ? and status = ? and lat = ? and lng = ? and requestedTime = ?);";

    connection.query(
      setQuery,
      [
        userID,
        "Pending",
        requestData.lat,
        requestData.lng,
        requestData.dateTime,
      ],
      (err, result) => {
        if (err) {
          res.send({
            success: false,
            isExist: false,
            error: err,
            result: null,
          });
        } else {
          connection.query(
            getIDQuery,
            [
              userID,
              "Pending",
              requestData.lat,
              requestData.lng,
              requestData.dateTime,
            ],
            (err, result) => {
              if (err) {
                res.send({
                  success: false,
                  isExist: false,
                  error: err,
                  result: null,
                });
              } else {
                res.send({
                  success: true,
                  isExist: true,
                  error: null,
                  result: result,
                });

                // // Notify all hospitals about the new emergency request
                // hospitalsConnection.forEach((hospitalSocket) => {
                //   if (hospitalSocket.readyState === WebSocket.OPEN) {
                //     console.log("Sending message to a hospital");
                //     hospitalSocket.send(JSON.stringify(requestData));
                //   }
                // });
              }
            }
          );
        }
      }
    );
  });

  return router;
}

module.exports = handleWebSocketConnections;
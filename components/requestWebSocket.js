const express = require("express");
const { WebSocketServer } = require("ws");
const decodedUserId = require("../Authentication/decodedToken");
const url = require("url");
const database = require("../utils/databaseUtils");
const databaseObj = new database();

// Map to store session tokens and associated WebSocket connections for hospitals.
const hospitalsConnection = new Map();
const ambulanceConnection = new Map();
const clientConnection = new Map();

const router = express.Router();
databaseObj.connectDatabase("Emergency");
const connection = databaseObj.connection;

// Create a function to handle WebSocket connections.
function handleWebSocketConnections(server) {
  const wsServer = new WebSocketServer({ server });

  wsServer.on("connection", (socket, req) => {
    console.log("WebSocket client connected");

    // Extract query parameters from the request URL.
    const { query } = url.parse(req.url, true);
    const sessionToken = query.sessionToken;
    // console.log(sessionToken);
    const typeID = query.typeID;

    const clientID = decodedUserId(sessionToken);

    // console.log(clientID, typeID, sessionToken);

    // Check if the session token is valid (you should implement your validation logic here).
    if (clientID) {
      // console.log(" connected");
      if (typeID === "ho") {
        console.log("hospital connected");
        hospitalsConnection.set(clientID, socket);
      } else if (typeID === "dr") {
        console.log("ambulance connected");
        ambulanceConnection.set(clientID, socket);
      } else if (typeID === "us") {
        console.log("client connected");
        clientConnection.set(clientID, socket);
      }

      socket.on("message", (message) => {
        console.log(`Received message: ${message}`);
        // Handle WebSocket messages here.
      });

      socket.on("close", () => {
        console.log("WebSocket client disconnected");

        // Remove the WebSocket connection from the map when the client disconnects.
        // hospitalsConnection.delete(clientID);
      });
    } else {
      // If the session token is invalid, close the WebSocket connection.
      console.log("Invalid session token. Closing WebSocket connection.");
      socket.close();
    }
  });

  function sendMessageToAmbulance(ambulanceID, message) {
    // console.log(ambulanceConnection);
    const ambulanceSocket = ambulanceConnection.forEach((ambulanceSocket) => {
      console.log(ambulanceSocket);
      console.log(ambulanceSocket.ambulanceID);
      if (ambulanceSocket.ambulanceID === ambulanceID) {
        console.log(`Sending message to ambulance ${ambulanceID}`);
        ambulanceSocket.send(JSON.stringify(message));
      } else {
        console.log(`Ambulance ${ambulanceID} not found.`);
      }
    });
  }

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

                // console.log(ambulanceConnection);
                // Notify all ambulance about the new emergency request
                ambulanceConnection.forEach((ambulanceSocket) => {
                  console.log("Sending message to a ambulance");
                  ambulanceSocket.send(
                    JSON.stringify({
                      requestData: result[0],
                      identify: "clientReq",
                    })
                  );
                });

                // Notify all hospitals about the new emergency request
                hospitalsConnection.forEach((hospitalSocket) => {
                  console.log("Sending message to a hospital");
                  hospitalSocket.send(
                    JSON.stringify({
                      requestData: result[0],
                      identify: "clientReq",
                    })
                  );
                });
              }
            }
          );
        }
      }
    );
  });

  router.post("/assignAmbulance", (req, res) => {
    const requestData = req.body; // Assuming you receive the emergency request data from the user
    const sessionToken = req.headers.authorization.replace("key ", "");
    console.log(requestData);
    const userID = requestData.userID;
    const requestID = requestData.requestID;
    const ambulanceID = requestData.ambulanceID;
    const connectedTime = requestData.connectedTime;
    const driverID = requestData.driverID;
    const setQuery1 =
      "insert into user_ambulance_connection (requestID, ambulanceID,connectedTime) values(?,?,?);";

    connection.query(
      setQuery1,
      [requestID, ambulanceID, connectedTime],
      (err, result) => {
        if (err) {
          // sendMessageToAmbulance(ambulanceID, requestData);
          // console.log(ambulanceConnection.get(1));
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
          const ambulanceSocket = ambulanceConnection.get(driverID);
          if (ambulanceSocket) {
            ambulanceSocket.send(
              JSON.stringify({
                requestData: requestData,
                identify: "hospitalReq",
              })
            );
            console.log("message sending to ambulance");
          }
          const clientSocket = clientConnection.get(userID);
          if (clientSocket) {
            clientSocket.send(
              JSON.stringify({
                requestData: requestData,
                identify: "acceptReq",
              })
            );
            console.log("message sending to client");
          }
        }
      }
    );
  });

  router.post("/ambulanceAcceptReq", (req, res) => {
    const requestData = req.body; // Assuming you receive the emergency request data from the user
    const sessionToken = req.headers.authorization.replace("key ", "");
    console.log(requestData);
    const userID = requestData.userID;
    const requestID = requestData.requestID;
    const ambulanceID = requestData.ambulanceID;
    const connectedTime = requestData.connectedTime;
    const driverID = decodedUserId(sessionToken);

    const setQuery =
      "insert into user_ambulance_connection (requestID, ambulanceID,connectedTime) values(?,?,?);";

    connection.query(
      setQuery,
      [requestID, ambulanceID, connectedTime],
      (err, result) => {
        if (err) {
          // sendMessageToAmbulance(ambulanceID, requestData);
          // console.log(ambulanceConnection.get(1));
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
          const clientSocket = clientConnection.get(userID);
          if (clientSocket) {
            clientSocket.send(
              JSON.stringify({
                requestData: requestData,
                identify: "acceptReq",
              })
            );
            console.log("message sending to client");
          }

          // clientConnection.get(userID).send(
          //   JSON.stringify({
          //     requestData: requestData,
          //     identify: "aceeptReq",
          //   })
          // );

        }
      }
    );
  });

  return router;
}

module.exports = handleWebSocketConnections;

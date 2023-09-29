var http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

const user = require("./components/user");
const login = require("./Authentication/login");
const hospital = require("./components/hospital");
const driver = require("./components/driver");
const ambulance = require("./components/Ambulance");
// const emergency = require("./components/emergencyRequest");
const handleWebSocketConnections = require("./components/requestWebSocket");

const server = http.createServer(app); // Create an HTTP server
// const emergencyRequestRouter = emergency(server);

app.use(express.json());
// Handle WebSocket connections using the imported function.
const requestWebSocket = handleWebSocketConnections(server);

app.use("/user", user);
app.use("/login", login);
app.use("/hospital", hospital);
app.use("/driver", driver);
app.use("/ambulance", ambulance);
app.use("/emergency", requestWebSocket);

server.listen(process.env.PORT || 8000, () => {
  console.log("Listen port 8000");
});

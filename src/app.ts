/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-05-11 11:59:53
 * @Description: Daemon service startup file
 */

import config from "./entity/config";
import logger from "./service/log";

// eslint-disable-next-line no-unused-vars
// const { Socket } = require("socket.io");
// const fs = require("fs-extra");


// import * as socketIO from "socket.io";
import fs from "fs-extra"
import { Server, Socket } from "socket.io";

console.log(`______  _______________________  ___                                         
___   |/  /_  ____/_  ___/__   |/  /_____ _____________ _______ _____________
__  /|_/ /_  /    _____ \\__  /|_/ /_  __  /_  __ \\  __  /_  __  /  _ \\_  ___/
_  /  / / / /___  ____/ /_  /  / / / /_/ /_  / / / /_/ /_  /_/ //  __/  /    
/_/  /_/  \\____/  /____/ /_/  /_/  \\__,_/ /_/ /_/\\__,_/ _\\__, / \\___//_/     
________                                                /____/                                          
___  __ \\_____ ____________ ________________ 
__  / / /  __  /  _ \\_  __  __ \\  __ \\_  __ \\
_  /_/ // /_/ //  __/  / / / / / /_/ /  / / /
/_____/ \\__,_/ \\___//_/ /_/ /_/\\____//_/ /_/ Version 1.0
`);

logger.info(`Welcome to use MCSManager daemon.`);

const io = new Server(config.port, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 10000,
  cookie: false
});

// Initialize Session session variables
// Use lightweight session function
// io.use((socket, next) => {
//   if (!socket.session) socket.session = {};
//   next();
// });

// Configuration file and data directory related operations
if (!fs.existsSync(config.instanceDirectory)) {
  fs.mkdirsSync(config.instanceDirectory);
}

const router = require("./service/router");
const protocol = require("./service/protocol");
const { instanceService } = require("./service/instance_service");

// Load instance
try {
  logger.info("Loading local instance file...");
  instanceService.loadInstances(config.instanceDirectory);
  logger.info(`All local instances are loaded, a total of ${instanceService.getInstancesSize()}.`);
} catch (err) {
  logger.error("Failed to read the local instance file, this problem must be fixed to start:", err);
  process.exit(-1);
}

// Register link event
io.on("connection", (socket) => {
  logger.info(`Session ${socket.id}(${socket.handshake.address}) is linked`);

  // Join the global Socket object
  protocol.addGlobalSocket(socket);

  // Socket.io request is forwarded to the custom routing controller
  router.navigation(socket);

  // Disconnect event
  socket.on("disconnect", () => {
    // Remove from the global Socket object
    protocol.delGlobalSocket(socket);
    for (const name of socket.eventNames()) socket.removeAllListeners(name);
    logger.info(`Session ${socket.id}(${socket.handshake.address}) disconnected`);
  });
});

// Error report monitoring
process.on("uncaughtException", function (err) {
  logger.error(`Error report (uncaughtException):`, err);
});

// Error report monitoring
process.on("unhandledRejection", (reason, p) => {
  logger.error(`Error report (unhandledRejection):`, reason, p);
});

// Started up
logger.info(`The daemon has started successfully.`);
logger.info("--------------------");
logger.info(`Monitoring ${config.port} port, waiting for data...`);
logger.info(`Access Key (Key): ${config.key}`);
logger.info("It is recommended to use the exit command to close the exit program.");
logger.info("--------------------");
console.log("");

require("./service/ui");

process.on("SIGINT", function () {
  console.log("\n\n\n\n");
  logger.warn("SIGINT close process signal detected.");
  logger.warn("It is recommended to use the exit command to close under normal circumstances, otherwise there is a certain risk of data loss.");
  logger.warn("Closed...");
  process.exit(0);
});

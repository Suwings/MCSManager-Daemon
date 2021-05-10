/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-05-10 21:03:19
 * @Description: Route navigator, used to analyze the Socket.io protocol and encapsulate and forward to a custom route
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const fs = require("fs-extra");
const path = require("path");
const { EventEmitter } = require("events");
// eslint-disable-next-line no-unused-vars
const { Socket } = require("socket.io");
const { logger } = require("./log");
const RouterContext = require("../entity/ctx");

// Routing controller class (singleton class)
class RouterApp extends EventEmitter {
  constructor() {
    super();
    this.middlewares = [];
  }

  /**
   * @param {string} event
   * @param {RouterContext} ctx
   * @param {string|Object} data
   */
  emit(event, ctx, data) {
    super.emit(event, ctx, data);
    return this;
  }

  /**
   * @param {string} event event
   * @param {(ctx: RouterContext, data: string) => void} fn
   * @return {RouterApp}
   */
  on(event, fn) {
    // logger.info(`Register event: ${event} `);
    return super.on(event, fn);
  }

  /**
   * Load middleware
   * @param {(event: string, ctx: RouterContext, data: string, next: Function) => void} fn
   */
  use(fn) {
    this.middlewares.push(fn);
  }

  /**
   * @return {Function[]}
   */
  getMiddlewares() {
    return this.middlewares;
  }
}

// routing controller singleton class
const routerApp = new RouterApp();
module.exports.routerApp = routerApp;

/**
 * Based on Socket.io for routing decentralization and secondary forwarding
 * @param {Socket} socket
 */
module.exports.navigation = (socket) => {
  // Register all events with Socket
  for (const event of routerApp.eventNames()) {
    socket.on(event, (protocol) => {
      if (!protocol) return logger.info(`session $(socket.id) request data protocol format is incorrect`);
      const ctx = new RouterContext(protocol.uuid, socket);
      routerApp.emit(event, ctx, protocol.data);
    });
  }
  // Register all middleware with Socket
  for (const fn of routerApp.getMiddlewares()) {
    socket.use((packet, next) => {
      const protocol = packet[1];
      if (!protocol) return logger.info(`session $(socket.id) request data protocol format is incorrect`);
      const ctx = new RouterContext(protocol.uuid, socket);
      fn(packet[0], ctx, protocol.data, next);
    });
  }
};

// Import all routing layer classes
function importController() {
  logger.info("Loading routing controller and middleware...");
  const routerPath = path.normalize(path.join(__dirname, "../controller/"));
  const jsList = fs.readdirSync(routerPath);
  for (var name of jsList) {
    name = name.split(".")[0];
    logger.info(" + Route file: " + path.join(routerPath, name) + ".js");
    require(path.join(routerPath, name));
  }
  logger.info(`Complete. Total routing controller ${routerApp.eventNames().length}, middleware ${routerApp.middlewares.length}.`);
}
importController();

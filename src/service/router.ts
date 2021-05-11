/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-05-11 11:19:17
 * @Description: Route navigator, used to analyze the Socket.io protocol and encapsulate and forward to a custom route
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import fs from "fs-extra"
import path from "path"
import { EventEmitter } from "events"
import { Socket } from "socket.io"
import logger from "./log"
import RouterContext from "../entity/ctx"

// const fs = require("fs-extra");
// const path = require("path");
// const { EventEmitter } = require("events");
// // eslint-disable-next-line no-unused-vars
// const { Socket } = require("socket.io");
// const { logger } = require("./log");
// const RouterContext = require("../entity/ctx");

// Routing controller class (singleton class)
class RouterApp extends EventEmitter {

  public readonly middlewares: Array<Function>

  constructor() {
    super();
    this.middlewares = [];
  }


  emitRouter(event: string, ctx: RouterContext, data: any) {
    super.emit(event, ctx, data);
    return this;
  }


  on(event: string, fn: (ctx: RouterContext, data: any) => void) {
    logger.info(` Register event: ${event} `);
    return super.on(event, fn);
  }


  use(fn: (event: string, ctx: RouterContext, data: any, next: Function) => void) {
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
export const routerApp = new RouterApp();

/**
 * Based on Socket.io for routing decentralization and secondary forwarding
 * @param {Socket} socket
 */
export function navigation(socket: Socket) {
  // Register all events with Socket
  for (const event of routerApp.eventNames()) {
    socket.on(event, (protocol) => {
      if (!protocol) return logger.info(`session $(socket.id) request data protocol format is incorrect`);
      const ctx = new RouterContext(protocol.uuid, socket);
      routerApp.emitRouter(event as string, ctx, protocol.data);
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

logger.info("Loading routing controller and middleware...");
import "../routers/auth";
// import "../routers/"

// Import all routing layer classes
function importController() {

  // const routerPath = path.normalize(path.join(__dirname, "../routers/"));
  // const jsList = fs.readdirSync(routerPath);
  // for (var name of jsList) {
  //   name = name.split(".")[0];
  //   logger.info(" + Route file: " + path.join(routerPath, name) + ".js");
  //   require(path.join(routerPath, name));
  // }

  logger.info(`Complete. Total routing controller ${routerApp.eventNames().length}, middleware ${routerApp.middlewares.length}.`);
}
importController();

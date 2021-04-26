/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-04-26 16:22:03
 * @Description: 路由导航器，用于分析 Socket.io 协议并封装转发到自定义路由
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

// 路由控制器类（单例类）
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
    logger.info(`  注册: ${event} 事件`);
    return super.on(event, fn);
  }

  /**
   * 装载中间件
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

// 路由控制器单例类
const routerApp = new RouterApp();
module.exports.routerApp = routerApp;

/**
 * 基于 Socket.io 进行路由分散与二次转发
 * @param {Socket} socket
 */
module.exports.navigation = (socket) => {
  // 向 Socket 注册所有事件
  for (const event of routerApp.eventNames()) {
    socket.on(event, (protocol) => {
      if (!protocol) return logger.info(`会话 ${socket.id} 请求数据协议格式不正确`);
      const ctx = new RouterContext(protocol.uuid, socket);
      routerApp.emit(event, ctx, protocol.data);
    });
  }
  // 向 Socket 注册所有中间件
  for (const fn of routerApp.getMiddlewares()) {
    socket.use((packet, next) => {
      const protocol = packet[1];
      if (!protocol) return logger.info(`会话 ${socket.id} 请求数据协议格式不正确`);
      const ctx = new RouterContext(protocol.uuid, socket);
      fn(packet[0], ctx, protocol.data, next);
    });
  }
};

// 导入所有路由层类
function importController() {
  logger.info("正在装载路由控制器与中间件...");
  const routerPath = path.normalize(path.join(__dirname, "../controller/"));
  const jsList = fs.readdirSync(routerPath);
  for (var name of jsList) {
    name = name.split(".")[0];
    logger.info("路由文件: " + path.join(routerPath, name) + ".js");
    require(path.join(routerPath, name));
  }
  logger.info(`装载完毕，总路由控制器${routerApp.eventNames().length}个，中间件${routerApp.middlewares.length}个.`);
}
importController();

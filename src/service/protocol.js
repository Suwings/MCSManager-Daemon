/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-04-26 16:58:52
 * @Description: 定义网络协议与常用发送/广播/解析功能，客户端也应当拥有此文件
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

// eslint-disable-next-line no-unused-vars
const { Socket } = require("socket.io");
// eslint-disable-next-line no-unused-vars
const RouterContext = require("../entity/ctx");
const { logger } = require("./log");

const STATUS_OK = 200;
const STATUS_ERR = 500;

class Packet {
  /**
   * @param {string} uuid
   * @param {string} status
   * @param {string} event
   * @param {object} data
   */
  constructor(uuid = null, status = 200, event = null, data = null) {
    this.status = status;
    this.event = event;
    this.data = data;
    this.uuid = uuid;
  }
}

/**
 * @return {Packet}
 */
module.exports.Packet = Packet;

/**
 * @param {RouterContext} ctx
 * @param {string} event
 * @param {object} data
 * @return {void}
 */
module.exports.msg = (ctx, event, data) => {
  const packet = new Packet(ctx.uuid, STATUS_OK, event, data);
  ctx.socket.emit(event, packet);
};

/**
 * @param {RouterContext} ctx
 * @param {string} event
 * @param {object} err
 */
module.exports.error = (ctx, event, err) => {
  const packet = new Packet(ctx.uuid, STATUS_ERR, event, err);
  logger.error(`会话 ${ctx.socket.id} 在 ${event} 中发送错误:\n`, err);
  ctx.socket.emit(event, packet);
};

/**
 * @param {object} text
 */
module.exports.parse = (text) => {
  if (typeof text == "object") {
    return new Packet(null, text.status, text.event, text.data);
  }
  const obj = JSON.parse(text);
  return new Packet(null, obj.status, obj.event, obj.data);
};

/**
 * @param {object} obj
 */
module.exports.stringify = (obj) => {
  return JSON.stringify(obj);
};

// 全局 Socket 储存
const globalSocket = {};

/**
 * @param {Socket} socket
 */
module.exports.addGlobalSocket = (socket) => {
  globalSocket[socket.id] = socket;
};

/**
 * @param {Socket} socket
 */
module.exports.delGlobalSocket = (socket) => {
  delete globalSocket[socket.id];
};

module.exports.socketObjects = () => {
  return globalSocket;
};

// 全局 Socket 广播
module.exports.broadcast = (event, obj) => {
  for (const id in globalSocket) {
    module.exports.msg(new RouterContext(null, globalSocket[id]), event, obj);
  }
};

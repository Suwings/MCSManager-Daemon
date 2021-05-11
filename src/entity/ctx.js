/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-04-26 15:24:54
 * @LastEditTime: 2021-05-11 08:49:16
 * @Description: 路由上下文
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

// eslint-disable-next-line no-unused-vars
const { Socket } = require("socket.io");

module.exports = class RouterContext {
  /**
   * @param {String} uuid
   * @param {Socket} socket
   */
  constructor(uuid, socket) {
    this.uuid = uuid;
    this.socket = socket;
  }
};

/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-05-10 19:24:43
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const iconv = require("iconv-lite");
// eslint-disable-next-line no-unused-vars
const { Instance } = require("../instance");
const { InstanceCommand } = require("./command");

module.exports.SendCommand = class extends InstanceCommand {
  /**
   * @param {String} data
   * @return {void}
   */
  constructor(cmd) {
    super("SendCommand");
    this.cmd = cmd;
  }

  /**
   * @param {Instance} instance
   * @return {void}
   */
  exec(instance) {
    // Note: 关服命令需要发送命令，但关服命令会设置状态为关闭中。
    // if (!instance.process || instance.status() != Instance.STATUS_RUNNING) {
    //   throw new Error("This instance status is NOT STATUS_RUN.");
    // }
    instance.process.stdin.write(iconv.encode(this.cmd, instance.config.oe));
    instance.process.stdin.write("\n");
    return this;
  }
};

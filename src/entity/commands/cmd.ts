/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-05-21 16:13:27
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import Instance from "../instance/instance";
import { encode } from "iconv-lite";
import InstanceCommand from "./command";

export default class SendCommand extends InstanceCommand {
  public cmd: string;

  constructor(cmd: string) {
    super("SendCommand");
    this.cmd = cmd;
  }

  exec(instance: Instance) {
    // Note: 关服命令需要发送命令，但关服命令会设置状态为关闭中。
    // if (!instance.process || instance.status() != Instance.STATUS_RUNNING) {
    //   throw new Error("This instance status is NOT STATUS_RUN.");
    // }
    if (!instance.process) throw new Error("Command execution error, process of instance object does not exist")

    instance.process.stdin.write(encode(this.cmd, instance.config.oe));
    instance.process.stdin.write("\n");
    return this;
  }
}

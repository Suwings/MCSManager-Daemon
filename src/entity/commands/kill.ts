/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-05-11 13:17:25
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import Instance from "../instance";
import InstanceCommand from "./command";

export default class KillCommand extends InstanceCommand {
  constructor() {
    super("KillCommand");
  }

  exec(instance: Instance) {
    if (instance.process && instance.process.pid) {
      instance.process.kill("SIGKILL");
    }
    instance.stoped(-3);
    instance.setLock(false);
  }
}

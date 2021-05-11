/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-05-11 09:08:25
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import Instance from "../instance"
import InstanceCommand from "./command"
import SendCommand from "./cmd"

export default class StopCommand extends InstanceCommand {

  constructor() {
    super("StopCommand");
  }

  exec(instance: Instance) {
    const stopCommand = instance.config.stopCommand;
    if (instance.status() == Instance.STATUS_STOP || !instance.process || !instance.process.pid) {
      throw new Error("The instance is not started and cannot be stopped.");
    }
    instance.status(Instance.STATUS_STOPPING);
    if (stopCommand.toLocaleLowerCase() == "^c") {
      instance.process.kill("SIGINT");
    } else {
      instance.exec(new SendCommand(stopCommand));
    }
    return instance;
  }
};

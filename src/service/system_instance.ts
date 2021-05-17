/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-05-17 21:25:47
 * @Description: instance service
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import fs from "fs-extra";
import path from "path";

import Instance from "../entity/instance/instance";
import EventEmitter from "events";
import KillCommand from "../entity/commands/kill";
import logger from "./log";

import { v4 } from "uuid";
// import { IForwardInstanceIO } from "./interfaces";
import { Socket } from "socket.io";

class InstanceSubsystem extends EventEmitter {

  public readonly instances = new Map<string, Instance>();
  public readonly forwardInstanceMap = new Map<string, Array<Socket>>();
  constructor() {
    super();
  }

  // init all instances from local files
  loadInstances(dir: string) {
    const files = fs.readdirSync(dir);
    for (const fileName of files) {
      if (path.extname(fileName) !== ".json") continue;
      const instance = new Instance(fileName.split(".")[0]);
      this.addInstance(instance);
    }
  }

  createInstance(cfg: any) {
    const newUuid = v4().replace(/-/gim, "");
    const instance = new Instance(newUuid);
    instance.parameters(cfg);
    this.addInstance(instance);
    return instance;
  }

  addInstance(instance: Instance) {
    if (this.instances.has(instance.instanceUuid)) {
      throw new Error(`The application instance ${instance.instanceUuid} already exists.`);
    }
    this.instances.set(instance.instanceUuid, instance);
    // Dynamically monitor the newly added instance output stream and pass it to its own event stream
    instance.on("data", (...arr) => {
      this.emit("data", instance.instanceUuid, ...arr);
    });
    instance.on("exit", (...arr) => {
      this.emit("exit", instance.instanceUuid, ...arr);
    });
    instance.on("open", (...arr) => {
      this.emit("open", instance.instanceUuid, ...arr);
    });
  }

  removeInstance(instanceUuid: string) {
    const instance = this.getInstance(instanceUuid);
    if (instance) instance.destroy();
    this.instances.delete(instanceUuid);
    return true;
  }

  forward(targetInstanceUuid: string, socket: Socket) {
    if (this.forwardInstanceMap.has(targetInstanceUuid)) {
      const arr = this.forwardInstanceMap.get(targetInstanceUuid);
      arr.forEach((socket, index) => {
        if (socket.id == socket.id) throw new Error("Attempt to listen to the same instance")
      });
      arr.push(socket);
    } else {
      this.forwardInstanceMap.set(targetInstanceUuid, [socket]);
    }
  }

  stopForward(targetInstanceUuid: string, sSocket: Socket) {
    if (this.forwardInstanceMap.has(targetInstanceUuid)) {
      const arr = this.forwardInstanceMap.get(targetInstanceUuid);
      arr.forEach((socket, index) => {
        if (socket.id == sSocket.id) arr.splice(index, 1);
      });
    }

  }

  getInstance(instanceUuid: string) {
    return this.instances.get(instanceUuid);
  }

  exists(instanceUuid: string) {
    return this.instances.has(instanceUuid);
  }

  exit() {
    this.instances.forEach((instance) => {
      if (instance.status() != Instance.STATUS_STOP) {
        logger.info(`Instance ${instance.config.nickname} (${instance.instanceUuid}) is running or busy, and is being forced to end.`);
        instance.execCommand(new KillCommand());
      }
      instance.config.save();
      logger.info(`Instance ${instance.config.nickname} (${instance.instanceUuid}) saved successfully.`);
    });
  }
}

export default new InstanceSubsystem();

/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-05-11 15:45:41
 * @Description: instance service
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import fs from "fs-extra";
import path from "path";

import Instance from "../entity/instance";
import EventEmitter from "events";
import KillCommand from "../entity/commands/kill";
import logger from "./log";

import { v4 } from "uuid";

class InstanceSubsystem extends EventEmitter {
  public readonly instances = new Map<String, Instance>();

  constructor() {
    super();
  }

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

  getInstance(instanceUuid: string) {
    return this.instances.get(instanceUuid);
  }

  exists(instanceUuid: string) {
    return this.instances.has(instanceUuid);
  }

  getAllInstance() {
    return this.instances;
  }

  getInstancesSize(): number {
    return this.instances.size;
  }

  forEachInstances(callback: (instance: Instance, id: string) => void) {
    this.instances.forEach((v) => { });
    for (const id in this.instances) {
      callback(this.instances.get(id), id);
    }
  }

  exit() {
    this.forEachInstances((instance) => {
      if (instance.status() != Instance.STATUS_STOP) {
        logger.info(`instance ${instance.config.nickname} (${instance.instanceUuid}) is running or busy, and is being forced to end.`);
        instance.execCommand(new KillCommand());
      }
      instance.config.save();
      logger.info(`instance ${instance.config.nickname} (${instance.instanceUuid}) data saved successfully.`);
    });
  }
}

export default new InstanceSubsystem();

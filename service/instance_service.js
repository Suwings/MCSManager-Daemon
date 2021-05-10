/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-05-10 20:48:39
 * @Description: instance service
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */
// eslint-disable-next-line no-unused-vars
const { Instance } = require("../entity/instance");
const { EventEmitter } = require("events");
const fs = require("fs-extra");
const path = require("path");
const { KillCommand } = require("../entity/commands/kill");
const { logger } = require("./log");

class InstanceService extends EventEmitter {
  constructor() {
    super();
    this.instances = {};
  }

  /**
   * Load all example applications
   * @return {void}
   */
  loadInstances(dir) {
    const files = fs.readdirSync(dir);
    for (const fileName of files) {
      if (path.extname(fileName) !== ".json") continue;
      const instance = new Instance(fileName.split(".")[0]);
      this.addInstance(instance);
    }
  }

  /**
   * @param {Instance} instance
   */
  addInstance(instance) {
    if (this.instances[instance.instanceUuid]) {
      throw new Error(`The application instance ${instance.instanceUuid} already exists.`);
    }
    this.instances[instance.instanceUuid] = instance;
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

  /**
   * @param {string} instanceUuid
   */
  removeInstance(instanceUuid) {
    const instance = this.getInstance(instanceUuid);
    if (instance) instance.destroy();
    delete this.instances[instanceUuid];
    return true;
  }

  /**
   * @param {string} instanceUuid
   * @return {Instance}
   */
  getInstance(instanceUuid) {
    return this.instances[instanceUuid];
  }

  exists(instanceUuid) {
    return this.instances[instanceUuid] ? true : false;
  }

  /**
   * @return {{string:Instance}}
   */
  getAllInstance() {
    return this.instances;
  }

  /**
   * @return {Number}
   */
  getInstancesSize() {
    let i = 0;
    // eslint-disable-next-line no-unused-vars
    for (const _key in this.instances) i++;
    return i;
  }

  /**
   * @param {(instance: Instance,id: string) => void} callback
   * @return {*}
   */
  forEachInstances(callback) {
    for (const id in this.instances) {
      callback(this.instances[id], id);
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

module.exports.instanceService = new InstanceService();
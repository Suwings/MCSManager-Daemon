/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 应用实例和实例类实现
 */

import { EventEmitter } from "events";
import * as iconv from "iconv-lite";
import { ChildProcess } from "child_process";
import * as path from "path";

import InstanceCommand from "../commands/command";
import InstanceConfig from "./InstanceConfig";

import globalConfig from "../config";

export default class Instance extends EventEmitter {
  // 实例类静态变量
  public static readonly STATUS_BUSY = -1;
  public static readonly STATUS_STOP = 0;
  public static readonly STATUS_STOPPING = 1;
  public static readonly STATUS_STARTING = 2;
  public static readonly STATUS_RUNNING = 3;

  // 实例类型
  public static readonly TYPE_UNIVERSAL = "TYPE_UNIVERSAL"; // 通用
  public static readonly TYPE_MINECRAFT = "TYPE_MINECRAFT"; // Minecraft 游戏服务端
  public static readonly TYPE_WEB_SHELL = "TYPE_WEB_SHELL"; // WebShell 程序
  public static readonly TYPE_LOW_PERMISSION = "TYPE_LOW_PERMISSION"; // 低权限程序

  public instanceStatus: number;
  public instanceUuid: string;
  public lock: boolean;
  public startCount: number;

  public config: InstanceConfig;
  public process: ChildProcess;

  constructor(instanceUuid: string) {
    super();

    //Basic information
    this.instanceStatus = Instance.STATUS_STOP;
    this.instanceUuid = instanceUuid;

    // Action lock
    this.lock = false;

    // Config init
    this.config = new InstanceConfig(path.join(globalConfig.instanceDirectory, instanceUuid));

    this.process = null;
    this.startCount = 0;
  }

  parameters(cfg: any) {
    this.config.parameters(cfg);
  }

  setLock(bool: boolean) {
    this.lock = bool;
  }

  // 对本实例执行对应的命令
  execCommand(command: InstanceCommand) {
    if (this.lock) throw new Error(`This ${command.info} operation cannot be completed because the command executes a deadlock.`);
    if (this.status() == Instance.STATUS_BUSY) throw new Error(`The status of ${this.instanceUuid} instance is busy and cannot do anything.`);
    command.exec(this);
  }

  // 对本实例执行对应的命令 别名
  exec(command: InstanceCommand) {
    this.execCommand(command);
  }

  // 设置实例状态或获取状态
  status(v?: number) {
    if (v) this.instanceStatus = v;
    return this.instanceStatus;
  }

  // 实例启动后必须执行的函数
  started(process: ChildProcess) {
    this.config.lastDatetime = this.fullTime();
    process.stdout.on("data", (text) => this.emit("data", iconv.decode(text, this.config.ie)));
    process.stderr.on("data", (text) => this.emit("data", iconv.decode(text, this.config.oe)));
    process.on("exit", (code) => this.stoped(code));
    this.process = process;
    this.instanceStatus = Instance.STATUS_RUNNING;
    this.emit("open", this);
    this.config.save();
  }

  // 实例已关闭后必须执行的函数
  stoped(code = 0) {
    this.releaseResources();
    this.instanceStatus = Instance.STATUS_STOP;
    this.emit("exit", code);
    if (this.config) this.config.save();
  }

  // 释放资源（主要释放进程相关的资源）
  releaseResources() {
    if (this.process && this.process.stdout && this.process.stderr) {
      // 移除所有动态新增的事件监听者
      for (const eventName of this.process.stdout.eventNames()) this.process.stdout.removeAllListeners(eventName);
      for (const eventName of this.process.stderr.eventNames()) this.process.stderr.removeAllListeners(eventName);
      for (const eventName of this.process.eventNames()) this.process.removeAllListeners(eventName);
      this.process.stdout.destroy();
      this.process.stderr.destroy();
    }
    this.process = null;
  }

  // 强制性删除本实例
  destroy() {
    try {
      if (this.process && this.process.pid) {
        this.process.kill("SIGKILL");
      }
      this.stoped(-999);
    } finally {
      this.config.del();
      this.config = null;
    }
  }

  fullTime() {
    const date = new Date();
    return date.toLocaleDateString() + " " + date.getHours() + ":" + date.getMinutes();
  }
}

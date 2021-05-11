/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 应用实例相关控制器
 */

import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import instanceService from "../service/instance_service";
import Instance from "../entity/instance";
import logger from "../service/log";

import StartCommand from "../entity/commands/start";
import StopCommand from "../entity/commands/stop";
import SendCommand from "../entity/commands/cmd";
import KillCommand from "../entity/commands/kill";
import { IInstanceDetail } from "../service/interfaces";

// 部分实例操作路由器验证中间件
routerApp.use((event, ctx, data, next) => {
  if (event == "instance/new") return next();
  if (event == "instance/overview") return next();
  // 类 AOP
  if (event.startsWith("instance")) {
    const instanceUuid = data.instanceUuid;
    if (!instanceService.exists(instanceUuid)) {
      return protocol.error(ctx, event, {
        instanceUuid: instanceUuid,
        err: `The operation failed, the instance ${instanceUuid} does not exist.`
      });
    }
  }
  next();
});

// 获取本守护进程实例总览
routerApp.on("instance/overview", (ctx) => {
  const overview: IInstanceDetail[] = [];
  instanceService.getAllInstance().forEach((instance) => {
    overview.push({
      instanceUuid: instance.instanceUuid,
      started: instance.startCount,
      status: instance.status(),
      config: instance.config
    });
  });

  protocol.msg(ctx, "instance/overview", overview);
});

// 查看单个实例的详细情况
routerApp.on("instance/detail", (ctx, data) => {
  try {
    const instanceUuid = data.instanceUuid;
    const instance = instanceService.getInstance(instanceUuid);
    protocol.msg(ctx, "instance/detail", {
      instanceUuid: instance.instanceUuid,
      started: instance.startCount,
      status: instance.status(),
      config: instance.config
    });
  } catch (err) {
    protocol.error(ctx, "instance/detail", { err: err.message });
  }
});

// 新建应用实例
routerApp.on("instance/new", (ctx, data) => {
  const nickname = data.nickname;
  const command = data.command;
  const cwd = data.cwd;
  const stopCommand = data.stopCommand || "^C";
  const ie = data.ie;
  const oe = data.oe;
  try {
    const newInstance = instanceService.createInstance({
      nickname: nickname,
      startCommand: command,
      stopCommand: stopCommand,
      cwd: cwd,
      ie: ie,
      oe: oe
    });
    protocol.msg(ctx, "instance/new", { instanceUuid: newInstance.instanceUuid, nickname: nickname });
  } catch (err) {
    protocol.error(ctx, "instance/new", { instanceUuid: null, err: err.message });
  }
});

// 更新实例数据
routerApp.on("instance/update", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  const config = data.config;
  try {
    instanceService.getInstance(instanceUuid).parameters(config);
    protocol.msg(ctx, "instance/update", { instanceUuid });
  } catch (err) {
    protocol.error(ctx, "instance/update", { instanceUuid: instanceUuid, err: err.message });
  }
});

// 开启实例
routerApp.on("instance/open", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  const instance = instanceService.getInstance(instanceUuid);
  try {
    instance.exec(new StartCommand(ctx.socket.id));
    protocol.msg(ctx, "instance/open", { instanceUuid });
  } catch (err) {
    logger.error(`实例${instanceUuid}启动时错误: `, err);
    protocol.error(ctx, "instance/open", { instanceUuid: instanceUuid, err: err.message });
  }
});

// 关闭实例
routerApp.on("instance/stop", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  const instance = instanceService.getInstance(instanceUuid);
  try {
    instance.exec(new StopCommand());
    protocol.msg(ctx, "instance/stop", { instanceUuid });
  } catch (err) {
    protocol.error(ctx, "instance/stop", { instanceUuid: instanceUuid, err: err.message });
  }
});

// 删除实例
routerApp.on("instance/delete", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  try {
    instanceService.removeInstance(instanceUuid);
    protocol.msg(ctx, "instance/delete", { instanceUuid });
  } catch (err) {
    protocol.error(ctx, "instance/delete", { instanceUuid: instanceUuid, err: err.message });
  }
});

// 向应用实例发送命令
routerApp.on("instance/command", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  const command = data.command || "";
  const instance = instanceService.getInstance(instanceUuid);
  try {
    instance.exec(new SendCommand(command));
    protocol.msg(ctx, "instance/command", { instanceUuid });
  } catch (err) {
    protocol.error(ctx, "instance/command", { instanceUuid: instanceUuid, err: err.message });
  }
});

// 杀死应用实例方法
routerApp.on("instance/kill", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  const instance = instanceService.getInstance(instanceUuid);
  try {
    instance.exec(new KillCommand());
    protocol.msg(ctx, "instance/kill", { instanceUuid });
  } catch (err) {
    protocol.error(ctx, "instance/kill", { instanceUuid: instanceUuid, err: err.message });
  }
});

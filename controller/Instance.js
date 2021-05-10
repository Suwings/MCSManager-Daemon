/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 应用实例相关控制器
 */
const uuid = require("uuid");
const { routerApp } = require("../service/router");
const protocol = require("../service/protocol");
const { instanceService } = require("../service/instance_service");
const { Instance } = require("../entity/instance");
const { logger } = require("../service/log");

const { StartCommand } = require("../entity/commands/start");
const { StopCommand } = require("../entity/commands/stop");
const { SendCommand } = require("../entity/commands/cmd");
const { KillCommand } = require("../entity/commands/kill");
// const io = require('socket.io')();

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
  const instances = instanceService.getAllInstance();
  const overview = [];
  for (const name in instances) {
    const instance = instanceService.getInstance(name);
    if (!instance) continue;
    overview.push({
      instanceUuid: instance.instanceUuid,
      startCount: instance.startCount,
      status: instance.status(),
      config: instance.config
    });
  }
  protocol.msg(ctx, "instance/overview", overview);
});


// 查看单个实例的详细情况
routerApp.on("instance/detail", (ctx, data) => {
  try {
    const instanceUuid = data.instanceUuid;
    const instance = instanceService.getInstance(instanceUuid);
    protocol.msg(ctx, "instance/detail", {
      instanceUuid: instance.instanceUuid,
      startCount: instance.startCount,
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
  const newUuid = uuid.v4().replace(/-/gim, "");
  try {
    const instance = new Instance(newUuid);
    instance.parameters({
      nickname: nickname,
      startCommand: command,
      stopCommand: stopCommand,
      cwd: cwd,
      ie: "GBK",
      oe: "GBK"
    });
    instanceService.addInstance(instance);
    protocol.msg(ctx, "instance/new", { instanceUuid: newUuid, nickname: nickname });
  } catch (err) {
    protocol.error(ctx, "instance/new", { instanceUuid: newUuid, err: err.message });
  }
});

// 删除实例
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

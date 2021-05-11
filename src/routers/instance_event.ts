/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-05-11 11:20:01
 * @Description: 应用实例所有主动性事件
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const protocol = require("../service/protocol");
const { instanceService } = require("../service/instance_service");



// 程序输出流日志广播
instanceService.on("data", (instanceUuid: string, text: string) => {
  protocol.broadcast("instance/stdout", {
    instanceUuid: instanceUuid,
    text: text
  });
});

// 实例退出事件
instanceService.on("exit", (instanceUuid: string) => {
  protocol.broadcast("instance/stopped", {
    instanceUuid: instanceUuid
  });
});

// 实例启动事件
instanceService.on("open", (instanceUuid: string) => {
  protocol.broadcast("instance/opened", {
    instanceUuid: instanceUuid
  });
});

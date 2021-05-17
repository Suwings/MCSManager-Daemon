/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-05-17 21:40:55
 * @Description: 应用实例所有主动性事件
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import RouterContext from "../entity/ctx";
import * as protocol from "../service/protocol";
import InstanceSubsystem from "../service/system_instance";

// 程序输出流日志广播
InstanceSubsystem.on("data", (instanceUuid: string, text: string) => {
  InstanceSubsystem.forEachForward(instanceUuid, (socket, index) => {
    protocol.msg(new RouterContext(null, socket), "instance/stdout", {
      instanceUuid: instanceUuid,
      text: text
    });
  })
});

// 实例退出事件
InstanceSubsystem.on("exit", (instanceUuid: string) => {
  InstanceSubsystem.forwardInstanceMap.delete(instanceUuid);
  protocol.broadcast("instance/stopped", {
    instanceUuid: instanceUuid
  });
});

// 实例启动事件
InstanceSubsystem.on("open", (instanceUuid: string) => {
  protocol.broadcast("instance/opened", {
    instanceUuid: instanceUuid
  });
});

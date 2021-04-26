/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-04-26 16:22:11
 * @Description: 身份认证控制器组
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const { routerApp } = require("../service/router");
const protocol = require("../service/protocol");
const { config } = require("../entity/config");
const { logger } = require("../service/log");

// 权限认证中间件
routerApp.use((event, ctx, data, next) => {
  const socket = ctx.socket;
  // 除 auth 控制器是公开访问，其他控制器必须得到授权才可访问
  if (event === "auth") return next();
  if (!socket.session) throw new Error("Session does not exist in authentication middleware.");
  // 若未验证则阻止除 auth 事件外的所有事件
  if (socket.session.key !== config.key || !socket.session.login || !socket.session.id) {
    logger.warn(`会话 ${socket.id}(${socket.handshake.address}) 试图无权限访问 ${event} 现已阻止.`);
    return protocol.error(ctx, "error", "权限不足，非法访问");
  }
  next();
});

// 日志输出中间件
routerApp.use((event, ctx, data, next) => {
  try {
    const socket = ctx.socket;
    logger.info(`收到 ${socket.id}(${socket.handshake.address}) 的 ${event} 指令.`);
    logger.info(` - 数据: ${JSON.stringify(data)}.`);
  } catch (err) {
    logger.error("日志记录错误:", err);
  } finally {
    next();
  }
});

// 身份认证控制器
routerApp.on("auth", (ctx, data) => {
  if (data === config.key) {
    // 身份认证通过，注册会话为可信会话
    logger.info(`会话 ${ctx.socket.id}(${ctx.socket.handshake.address}) 验证身份成功`);
    loginSuccessful(ctx.socket, data);
    protocol.msg(ctx, "auth", true);
  } else {
    protocol.msg(ctx, "auth", false);
  }
});

// 登录成功后必须执行此函数
function loginSuccessful(socket, data) {
  socket.session.key = data;
  socket.session.login = true;
  socket.session.id = socket.id;
  return socket.session;
}

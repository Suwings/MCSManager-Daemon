/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-04-26 15:24:54
 * @LastEditTime: 2021-05-11 09:12:04
 * @Description: 路由上下文
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import { Socket } from "socket.io";


// import 

export default class RouterContext {
  public uuid: string
  public socket: Socket

  constructor(uuid, socket) {
    this.uuid = uuid;
    this.socket = socket;
  }
};

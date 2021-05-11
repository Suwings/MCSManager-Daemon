/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-04-26 15:24:54
 * @LastEditTime: 2021-05-11 12:02:43
 * @Description: 路由上下文
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import { Socket } from "socket.io";


// import 

export default class RouterContext {
  public uuid: string
  public socket: Socket
  public session: any

  constructor(uuid: string, socket: Socket) {
    this.uuid = uuid;
    this.socket = socket;
  }
};

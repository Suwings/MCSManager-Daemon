/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-04-26 15:24:54
 * @LastEditTime: 2021-05-11 12:33:48
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import { Socket } from "socket.io";

export default class RouterContext {
  constructor(public uuid: string, public socket: Socket, public session?: any) {}
}

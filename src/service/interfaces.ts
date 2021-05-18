/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-11 12:51:36
 * @LastEditTime: 2021-05-17 20:08:56
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

export interface IInstanceDetail {
  instanceUuid: string;
  started: number;
  status: number;
  config: any;
}

// export interface IForwardInstanceIO {
//   sourceSocket: Socket,
//   targetUuid: string
// }

/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 17:43:54
 * @LastEditTime: 2021-05-11 09:07:59
 * @Description: InstanceCommand
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */


export default class InstanceCommand {

  public info: string

  constructor(info: string) {
    this.info = info;
  }

  exec(instance: any) {
    return instance;
  }
};

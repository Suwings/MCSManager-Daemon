/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-12 12:03:58
 * @LastEditTime: 2021-05-12 12:14:00
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

// interface of docker config
export interface IDockerConfig {
  image: string;
  xmx: number;
  ports: number[];
}

/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-12 12:04:13
 * @LastEditTime: 2021-05-12 12:18:07
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */
import DataStructure from "../structure";
import Instance from "./instance";
import { IDockerConfig } from "./interface";

export default class InstanceConfig extends DataStructure {
  public nickname = "";
  public startCommand = "";
  public stopCommand = "";
  public cwd = "";
  public ie = "utf-8";
  public oe = "utf-8";
  public createDatetime = new Date().toLocaleDateString();
  public lastDatetime = "--";
  public type = Instance.TYPE_UNIVERSAL;    // Instance type like: Minecraft,Webwhell...
  public tag: string[] = [];                // Instance tag like: Cloud1 Group2...
  public docker: IDockerConfig = { image: "", xmx: 1, ports: [] };

  constructor(path: string) {
    super(path);
    this.load()
  }

  parameters(cfg: any) {
    this.nickname = cfg.nickname || this.nickname || "DefaultInstance_" + new Date().getTime();
    this.startCommand = cfg.startCommand || this.startCommand || "";
    this.stopCommand = cfg.stopCommand || this.stopCommand || "^C";
    this.cwd = cfg.cwd || this.cwd || ".";
    this.ie = cfg.ie || this.ie || "utf-8";
    this.oe = cfg.oe || this.oe || "utf-8";
    this.type = cfg.type || this.type || Instance.TYPE_UNIVERSAL;
    this.save();
  }

}



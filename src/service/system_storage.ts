/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-11 15:56:24
 * @LastEditTime: 2021-05-11 16:14:58
 * @Description: 储存服务，用于序列化类到本地文件
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import Structure from "../entity/storage_structure";
import path from "path";
import fs from "fs-extra";

export default class StorageSubsystem<T extends Structure> {

  public static STIRAGE_DATA_PATH = path.normalize(path.join(process.cwd(), "data"));;

  public store(object: T) {
    const filePath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, object.className, object.uuid);
    const data = JSON.stringify(object);
    fs.writeFileSync(filePath, data, {
      encoding: "utf-8"
    });
  }

  public load(object: T): T {
    const filePath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, object.className, object.uuid);
    const data = fs.readFileSync(filePath, { encoding: "utf-8" });
    return JSON.parse(data);
  }

}







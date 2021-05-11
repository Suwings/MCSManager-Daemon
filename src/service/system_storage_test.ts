/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-11 16:29:08
 * @LastEditTime: 2021-05-11 16:53:08
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */
/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-11 16:29:08
 * @LastEditTime: 2021-05-11 16:49:16
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import path from "path";
import fs from "fs-extra";
class Structure {
  [_: string]: any;

  constructor(public __uuid: string, public __className: string) {}
}

class StorageSubsystem {
  public static STIRAGE_DATA_PATH = path.normalize(path.join(process.cwd(), "data"));

  public store(object: Structure) {
    const dirPath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, object.__className);
    if (!fs.existsSync(dirPath)) fs.mkdirsSync(dirPath);
    const filePath = path.join(dirPath, `${object.__uuid}.json`);
    const data = JSON.stringify(object);
    fs.writeFileSync(filePath, data, {
      encoding: "utf-8"
    });
  }

  public load(object: Structure) {
    const filePath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, object.__className, `${object.__uuid}.json`);
    const data = fs.readFileSync(filePath, { encoding: "utf-8" });
    const dataObject = JSON.parse(data);
    for (const v of Object.keys(object)) {
      if (dataObject[v]) object[v] = dataObject[v];
    }
  }

  public load2(uuid: string, className: string, classz: any) {
    const filePath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, className, `${uuid}.json`);
    const data = fs.readFileSync(filePath, { encoding: "utf-8" });
    const dataObject = JSON.parse(data);
    const target = new classz();
    for (const v of Object.keys(target)) {
      if (dataObject[v] !== undefined) target[v] = dataObject[v];
    }
    return target;
  }
}

class Config extends Structure {
  public static aaa = 1;

  constructor(public name: string, public age: number) {
    super(name, "Config");
  }

  doing() {
    console.log(2333);
  }

  somesoe() {}
}

const system = new StorageSubsystem();

const a = new Config("WK", 123);
system.store(a);

const b: Config = system.load2("WK", "Config", Config);
b.name = "23333333333";

// const b = new Config("WK", null)
// system.load(b)
console.log("RES:", b);
system.store(b);

/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-26 18:41:40
 * @LastEditTime: 2021-05-10 20:47:15
 * @Description: Terminal interaction logic. Since the logic is simple and does not require authentication and inspection, all UI business codes will be in one file.
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("[User Interface] program has a simple terminal interaction function, type help to see more information.");

function stdin() {
  rl.question("> ", (answer) => {
    try {
      const cmds = answer.split(" ");
      logger.info(`[Terminal] ${answer}`);
      const result = command(...cmds);
      if (result) console.log(result);
      else console.log(`Command ${answer} does not exist, type help to get help.`);
    } catch (err) {
      logger.error("[Terminal]", err);
    } finally {
      // next
      stdin();
    }
  });
}

stdin();

const { instanceService } = require("./instance_service");
const protocol = require("./protocol");
const { config } = require("../entity/config");
const { logger } = require("./log");
const { StartCommand } = require("../entity/commands/start");
const { StopCommand } = require("../entity/commands/stop");
const { KillCommand } = require("../entity/commands/kill");
const { SendCommand } = require("../entity/commands/cmd");
// const {logger} = require('./log');

/**
 * Pass in relevant UI commands and output command results
 * @param {String} cmd
 * @return {String}
 */
function command(cmd, p1, p2, p3) {
  if (cmd === "instance") {
    if (p1 === "start") {
      instanceService.getInstance(p2).exec(new StartCommand("Terminal"));
      return "Done.";
    }
    if (p1 === "stop") {
      instanceService.getInstance(p2).exec(new StopCommand());
      return "Done.";
    }
    if (p1 === "kill") {
      instanceService.getInstance(p2).exec(new KillCommand());
      return "Done.";
    }
    if (p1 === "send") {
      instanceService.getInstance(p2).exec(new SendCommand(p3));
      return "Done.";
    }
    return "Parameter error";
  }

  if (cmd === "instances") {
    const objs = instanceService.getAllInstance();
    let result = "instance name | instance UUID | status code\n";
    for (const id in objs) {
      const instance = objs[id];
      result += `${instance.config.nickname} ${instance.instanceUuid} ${instance.status()}\n`;
    }
    result += "\nStatus Explanation:\n Busy=-1;Stop=0;Stopping=1;Starting=2;Running=3;\n";
    return result;
  }

  if (cmd === "sockets") {
    const sockets = protocol.socketObjects();
    let result = "";
    let count = 0;
    result += "IP address | session identifier\n";
    for (const id in sockets) {
      count++;
      result += `${sockets[id].handshake.address} ${id}\n`;
    }
    result += `Total ${count} online.\n`;
    return result;
  }

  if (cmd == "key") {
    return config.key;
  }

  if (cmd == "exit") {
    try {
      logger.info("Preparing to shut down the daemon...");
      config.save();
      instanceService.exit();
      logger.info("Data saved, thanks for using, goodbye!");
      logger.info("The data is saved, thanks for using, goodbye!");
      logger.info("process.exit(0);");
      process.exit(0);
    } catch (err) {
      logger.error("Failed to end the program. Please check the file permissions and try again. If you still can't close it, please use Ctrl+C to close.", err);
    }
  }

  if (cmd == "help") {
    console.log("----------- Help document -----------");
    console.log(" instances view all instances");
    console.log(" Sockets view all linkers");
    console.log(" key view key");
    console.log(" exit to close this program (recommended method)");
    console.log(" instance start <UUID> to start the specified instance");
    console.log(" instance stop <UUID> to start the specified instance");
    console.log(" instance kill <UUID> to start the specified instance");
    console.log(" instance send <UUID> <CMD> to send a command to the instance");
    console.log("----------- Help document -----------");
    return "\n";
  }
}

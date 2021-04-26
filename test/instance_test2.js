/* eslint-disable no-undef */
/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-04-26 17:10:02
 * @Description: Socket 基本通信与基本功能测试类
 */

const io = require("socket.io-client");
const test = require("./test");
require("should");

let testServerID = "7e498901057c41b097afdf38478ce89a";
let key = "test_key";

describe("第二代 Socket.io 业务逻辑测试", function () {
  it("身份验证测试", function () {
    test.io({
      key: key,
      req: (socket) => {
        socket.emit("instance/open", { uuid: null, data: { instanceUUID: testServerID } });
      },
      on: (socket) => {
        socket.on("instance/open", (msg) => {
          console.log("Return:", msg)
          Number(200).should.equal(msg.status);
        });
      }
    });
  });

  it("身份验证测试2", function () {
    const socket = io.connect(test.config.ip, test.config.connect);
    socket.emit("auth", { uuid: "1", data: key });
    socket.emit("instance/stop", { uuid: "2", data: { instanceUUID: testServerID } });
    socket.on("instance/stop", (msg) => {
      console.log("Return:", msg)
      // console.log(msg);
      Number(200).should.equal(msg.status);
      // testServerID.should.equal(msg.data.instanceUUID);
      socket.close();
    });
  });
});

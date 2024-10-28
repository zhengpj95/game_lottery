const robotjs = require("robotjs");
const readline = require("readline");
const dayjs = require("dayjs");

// 设置后才可以开始自动点击
let autoClick = 0;
let autoClickCnt = 0;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.question(`输入是否自动点击(1或0)：`, (isAuto) => {
  autoClick = isAuto ? +isAuto : 1;
  if (!!autoClick) {
    rl.question(`输入自动点击次数(默认10)：`, (cnt) => {
      autoClickCnt = +cnt || 1000;
      rl.question(`获取鼠标位置(1或0)：`, (isGet) => {
        const getMouse = isGet ? +isGet : 1;
        if (+getMouse === 1) {
          let posList = getMousePosHex();
          confirmPoint = { x: posList[0] ?? 0, y: posList[1] ?? 0 };
          confirmHex = posList[2];
          setCancelPoint(confirmPoint);
          // console.log("start auto click: ", posList, confirmPoint, confirmHex, cancelPoint);
          startAutoClick();
          rl.close();
        } else {
          console.log(`===不获取鼠标位置，无法开启自动点击===`);
          rl.close();
        }
      });
    });
  } else {
    rl.close();
    getMousePosHex(false, `获取当前鼠标位置信息：`);
  }
});


let confirmPoint = { x: 0, y: 0 };
let confirmHex = "";
let cancelPoint = { x: confirmPoint.x + 10, y: confirmPoint.y + 45 };
const stopHex = ["1e1f22", "1e1e1e", "1f1f1f", "1d1d1d", "1c1c1c"];

function setCancelPoint(point) {
  cancelPoint = { x: point.x + 10, y: point.y + 45 };
}

function getMousePosHex(isLog = false, logStr = "") {
  const mouse = robotjs.getMousePos();
  const hex = robotjs.getPixelColor(mouse.x, mouse.y);
  if (!isLog) {
    console.log(logStr + "#" + hex + " at x:" + mouse.x + " y:" + mouse.y);
  }
  return [mouse.x, mouse.y, hex];
}

function isStopPos() {
  const mouse = getMousePosHex(true);
  return mouse && stopHex.includes(mouse[2]);
}

function clickConfirm() {
  robotjs.moveMouse(confirmPoint.x, confirmPoint.y);
  const mouse1 = robotjs.getMousePos();
  const hex1 = robotjs.getPixelColor(mouse1.x, mouse1.y);
  if (hex1 !== confirmHex) {
    return;
  }
  clickCnt++;
  robotjs.mouseClick();
  // console.log(`11111 click confirm`);
}

function clickCancel() {
  robotjs.moveMouse(cancelPoint.x, cancelPoint.y);
  robotjs.mouseClick();
  // console.log(`11111 click cancel`);
}

let clickCnt = 0;

function startAutoClick() {
  let toggleFlag = false;

  if (!!autoClick) {
    const interval = 300;
    const intervalKey = setInterval(() => {
      if ((autoClickCnt !== -1 && clickCnt > autoClickCnt) || (clickCnt > 1 && isStopPos())) {
        clearInterval(intervalKey);
        return;
      }
      const dayStr = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");
      // console.log(dayStr, toggleFlag, clickCnt);
      if (toggleFlag) {
        clickCancel();
        toggleFlag = false;
      } else {
        clickConfirm();
        toggleFlag = true;
      }
    }, interval);
  }
}

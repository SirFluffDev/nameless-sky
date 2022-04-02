import { Vector } from "./utility.mjs";

let cw, ch;

//#region - Mouse input
let mouse = {
  x: 0,
  y: 0
};

document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
//#endregion

//#region - Keyboard input
let keys = [];
let pressed = [];

document.addEventListener("keydown", (e) => {
  if (!keys.includes(e.code)) {
    keys.push(e.code);
    pressed.push(e.code);
  }
});

document.addEventListener("keyup", (e) => {
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] == e.code) {
      keys.splice(i, 1);
    }
  }
});
//#endregion

//#region - Touch input
let tapped = false;
let touch = { touching: false, x: 0, y: 0 };
document.addEventListener("touchstart", (e) => {
  if (e.target.nodeName === "CANVAS") {
    touch.touching = true;
    tapped = true;

    const rect = e.target.getBoundingClientRect();
    touch.x = e.touches[0].clientX - rect.left;
    touch.y = e.touches[0].clientY - rect.top;
  }

  e.preventDefault();
});

document.addEventListener("touchmove", (e) => {
  if (e.target.nodeName === "CANVAS") {
    const rect = e.target.getBoundingClientRect();
    touch.x = e.touches[0].clientX - rect.left;
    touch.y = e.touches[0].clientY - rect.top;
  }

  e.preventDefault();
});

document.addEventListener("touchend", (e) => {
  touch.touching = false;
  e.preventDefault();
});
//#endregion

// Function that returns part of a vector based off AWSD, a mobile joystick, or controller
export function getJoystickVector(id) {
  let vector = new Vector();

  switch (id) {
    case 0:
      // Keyboard vector
      if (keys.length > 0) {
        vector.x =
          ((keys.includes("KeyD") || keys.includes("ArrowRight")) | 0) -
          ((keys.includes("KeyA") || keys.includes("ArrowLeft")) | 0);

        vector.y =
          ((keys.includes("KeyS") || keys.includes("ArrowDown")) | 0) -
          ((keys.includes("KeyW") || keys.includes("ArrowUp")) | 0);
      }

      // Touch vector
      else if (touch.touching) {
        let tx = touch.x - cw / 2;
        let ty = touch.y - ch / 2;

        let tVec = new Vector(tx, ty);
        tVec.normalize();
        let deg = tVec.toDegrees();

        if (deg < 45 || deg >= 325) vector.x = 1;
        if (deg >= 135 && deg < 225) vector.x = -1;
        if (deg >= 45 && deg < 135) vector.y = 1;
        if (deg >= 225 && deg < 325) vector.y = -1;

        console.debug(deg);
      }

      return vector;
  }
}

export function init(c) {
  cw = parseInt(c.style.width, 10);
  ch = parseInt(c.style.height, 10);
}

export function update() {
  pressed = [];
}

export function reset() {
  tapped = false;
  pressed = [];
}
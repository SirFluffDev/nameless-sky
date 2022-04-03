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
let keyboard = { keys: [], pressed: [] };

document.addEventListener("keydown", (e) => {
  if (!keyboard.keys.includes(e.code)) {
    keyboard.keys.push(e.code);
    keyboard.pressed.push(e.code);
  }
});

document.addEventListener("keyup", (e) => {
  for (let i = 0; i < keyboard.keys.length; i++) {
    if (keyboard.keys[i] == e.code) {
      keyboard.keys.splice(i, 1);
    }
  }
});
//#endregion

//#region - Touch input
let touch = { tapped: false, touching: false, x: 0, y: 0 };
document.addEventListener("touchstart", (e) => {
  if (e.target.nodeName === "CANVAS") {
    touch.touching = true;
    touch.tapped = true;

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

//#region - Controller input
let controller = { connected: false, deadzone: 0.1, gamepad: null };

// Controller disconnected
window.addEventListener("gamepaddisconnected", (e) => {
  console.debug("Controller disconnected!");

  controller.gamepad = null;
  controller.connected = false;
});

// Controller connected
window.addEventListener("gamepadconnected", (e) => {
  console.debug("Controller connected!");

  controller.gamepad = e.gamepad;
  controller.connected = true;
});


//#endregion

// Function that returns part of a vector based off AWSD, a mobile joystick, or controller
export function getJoystickVector(id) {
  let vector = new Vector();

  switch (id) {
    case 0:
      // Controller input
      if (controller.connected) {
        // Get the first joystick as a vector
        let joystick = new Vector(
          controller.gamepad.axes[0],
          controller.gamepad.axes[1]
        );

        // If the stick isn't being moved, just return the empty vector
        if (joystick.magnitude() <= controller.deadzone) { return vector; }

        // Get the degree angle of the stick and get a direction from it
        let deg = joystick.toDegrees();

        if (deg < 60 || deg > 300) vector.x = 1;
        if (deg > 120 && deg < 240) vector.x = -1;
        if (deg > 30 && deg < 150) vector.y = 1;
        if (deg > 210 && deg < 330) vector.y = -1;
      }

      // Keyboard input
      else if (keyboard.keys.length > 0) {
        vector.x =
          ((keyboard.keys.includes("KeyD") || keyboard.keys.includes("ArrowRight")) | 0) -
          ((keyboard.keys.includes("KeyA") || keyboard.keys.includes("ArrowLeft")) | 0);

        vector.y =
          ((keyboard.keys.includes("KeyS") || keyboard.keys.includes("ArrowDown")) | 0) -
          ((keyboard.keys.includes("KeyW") || keyboard.keys.includes("ArrowUp")) | 0);
      }

      // Touch input
      else if (touch.touching) {
        let tx = touch.x - cw / 2;
        let ty = touch.y - ch / 2;

        // Convert the user's touch position into a degree angle
        let tVec = new Vector(tx, ty);
        tVec.normalize();
        let deg = tVec.toDegrees();

        // Get a direction from the angle
        if (deg < 60 || deg > 300) vector.x = 1;
        if (deg > 120 && deg < 240) vector.x = -1;
        if (deg > 30 && deg < 150) vector.y = 1;
        if (deg > 210 && deg < 330) vector.y = -1;
      }

      vector.normalize();

      if (vector.x < 1 && vector.x > 0) vector.x = 0.8;
      if (vector.x > -1 && vector.x < 0) vector.x = -0.8;
      if (vector.y < 1 && vector.y > 0) vector.y = 0.8;
      if (vector.y > -1 && vector.y < 0) vector.y = -0.8;

      return vector;
  }
}

export function init(c) {
  cw = parseInt(c.style.width, 10);
  ch = parseInt(c.style.height, 10);
}

export function update() {
  touch.tapped = false;
  keyboard.pressed = [];
}
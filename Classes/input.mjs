import { Vector } from "./utility.mjs";

let cw, ch;

//#region - Mouse input
let mouse = {
  x: 0,
  y: 0,
  wheel: 0,
  down: false
};

document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

document.addEventListener("mousedown", (e) => { mouse.down = true })

document.addEventListener("wheel", (e) => { mouse.wheel = e.deltaY > 0 ? 1 : -1 });

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
    touch.x = e.touches[e.touches.length - 1].clientX - rect.left;
    touch.y = e.touches[e.touches.length - 1].clientY - rect.top;
  }

  e.preventDefault();
});

document.addEventListener("touchmove", (e) => {
  if (e.target.nodeName === "CANVAS") {
    const rect = e.target.getBoundingClientRect();
    touch.x = e.touches[e.touches.length - 1].clientX - rect.left;
    touch.y = e.touches[e.touches.length - 1].clientY - rect.top;
  }

  e.preventDefault();
});

document.addEventListener("touchend", (e) => {
  if (e.touches.length === 0) touch.touching = false;
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

        if (deg < 45 || deg >= 315) vector.x = 1;
        if (deg >= 135 && deg < 225) vector.x = -1;
        if (deg >= 45 && deg < 135) vector.y = 1;
        if (deg >= 225 && deg < 315) vector.y = -1;
      }

      // Keyboard input
      else if (keyboard.keys.length > 0) {
        vector.x =
          ((keyboard.keys.includes("KeyD") || keyboard.keys.includes("ArrowRight")) | 0) -
          ((keyboard.keys.includes("KeyA") || keyboard.keys.includes("ArrowLeft")) | 0);

        if (!vector.x) vector.y =
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
        if (deg < 45 || deg >= 315) vector.x = 1;
        if (deg >= 135 && deg < 225) vector.x = -1;
        if (deg >= 45 && deg < 135) vector.y = 1;
        if (deg >= 225 && deg < 315) vector.y = -1;
      }

      return vector;
  }
}

export function init() {
  const container = window.game.CONTAINER;
  cw = parseInt(container.style.width, 10);
  ch = parseInt(container.style.height, 10);
}

export function update() {
  touch.tapped = false;
  keyboard.pressed = [];
  mouse.wheel = 0;
  mouse.down = false;
}

export { mouse };
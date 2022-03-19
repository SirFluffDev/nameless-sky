var mouse = {
  x: 0,
  y: 0
};

var keys = [];
var pressed = [];

document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

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

function reset() {
  pressed = [];
}

export { mouse, keys, pressed, reset }
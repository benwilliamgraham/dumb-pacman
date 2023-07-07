"use strict";

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const context = canvas.getContext("2d");

var x = 0;
function draw(time) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "red";
  context.fillRect(x, 0, 100, 100);
  x += 10;
  if (x > canvas.width) {
    x = -100;
  }
  requestAnimationFrame(draw);
}

function play() {
  requestAnimationFrame(draw);
}

play();

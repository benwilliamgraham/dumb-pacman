"use strict";

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const context = canvas.getContext("2d");

const images = {
  demo: new Image(),
};

function loadImages() {
  for (const key in images) {
    images[key].src = `assets/textures/${key}.png`;
  }
}

var x = 0;
function draw(time) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "red";
  context.drawImage(images.demo, x, 0, 100, 100);
  x += 10;
  if (x > canvas.width) {
    x = -100;
  }
  requestAnimationFrame(draw);
}

function play() {
  loadImages();
  requestAnimationFrame(draw);
}

play();

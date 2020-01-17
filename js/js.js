var canvas

function setup(){
  canvas = createCanvas(window.innerWidth, window.innerHeight, WEBGL);
}

function draw(){
  let number = $("#number").value;
  background(250);
  normalMaterial();
  rectMode(CENTER);
  translate(mouseX - width/2, mouseY -height/2);
  rotateX(frameCount * 0.01);
  box(width/25, width/25, width/25);
}

window.onresize = function() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  canvas.size(w,h);
  width = w;
  height = h;
};

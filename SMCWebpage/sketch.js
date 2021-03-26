let serial;
let latestData = "waiting for data";

let measureLines;
let canvas;

let clickText;
let titleText;
let measureText;


function setup() {
  // create + position HTML elements
  clickText = createP("Click anywhere to begin!");
  clickText.position(10,400);
  
  measureText = createP("");
  measureText.position(10,420);
  
  canvas = createCanvas(400, 400);
  canvas.position(10,5);
  background(255);
  measureLines = createGraphics(400, 400);
  
  //callback function for when canvas is clicked
  canvas.mouseClicked(canvasClick);
  
  //display graph lines + cm values
  for (let x = 0; x < 400; x += 20) {
    let textVal = (x - 40) / 10;
    measureLines.textSize(14);
    if (textVal >= 0) {
      text(textVal, 3,398-x);
      text(textVal, x + 2, 395);
    }
    
    measureLines.strokeWeight(1);
    measureLines.stroke(200);
    measureLines.line(x, 0, x, 400);
    measureLines.line(0, x, 400, x);
  }

  image(measureLines, 0, 0, 400, 400);

  
  //initialize serial connection
  serial = new p5.SerialPort();

  serial.list();
  serial.open('/dev/tty.usbmodem14101');

  serial.on('connected', serverConnected);
  serial.on('list', gotList);
  serial.on('data', gotData);
  serial.on('error', gotError);
  serial.on('open', gotOpen);
  serial.on('close', gotClose);
}

function serverConnected() {
  print("Connected to Server");
}

function gotList(thelist) {
  print("List of Serial Ports:");

  for (let i = 0; i < thelist.length; i++) {
    print(i + " " + thelist[i]);
  }
}

function gotOpen() {
  print("Serial Port is Open");
}

function gotClose() {
  print("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

function gotError(theerror) {
  print(theerror);
}

//incoming data formatted into CSV in this order:

let IRFVal; //value from front-facing IR sensor
let IRRVal; //value from right side IR sensor
let lTurns; //degree of turn on left wheel since last update
let rTurns; //right wheel



let keyIn; //keyboard key pressed

//when serial data is received:
function gotData() {
  //put incoming data into a string
  let currentString = serial.readLine();
  trim(currentString);
  if (!currentString) return;
  
  //separate CSVs into array
  latestData = currentString.split(",");
  lTurns = latestData[2];
  rTurns = latestData[3];
  
  if ((lTurns >= 0 && rTurns >= 0) || 
      (lTurns <= 0 && rTurns <= 0)) {
    //if lTurns and rTurns are both positive or both negative,
    //then the car is moving in a straight line
    moveCar()
  } else { //if not, the car is turning
    rotateCar();
  }
  IRRVal = latestData[1];
  IRFVal = latestData[0];
}

function draw() {
  angleMode(DEGREES);
  //on 30th frame, set car's starting position on the graph
  if (frameCount == 30) {
    translate(40, 360);
    push();
  }
  pop();
  fill(0);
  stroke(0);
  rectMode(CENTER);
  
  rect(0, 0, 5, 10); //draw car's currrent position on the graph
  drawPoints(); //draw a point according to car angle + sensor value
  
  push();
}

function keyPressed() {
  serial.write(key); //send keystroke data to arduino
  keyIn = key; //update variable
}

function keyReleased() {
  serial.write(0); //send key release data to arduino
}

function moveCar() {
  let pulsesPerRotation = 2086;
  let distPerPulse = (65 * PI) / pulsesPerRotation;
  translate(0, distPerPulse * lTurns * -1);
  push();
}

let currentAngle = 0;

function rotateCar() {
  let motorDiff = lTurns - rTurns;
  rotate(motorDiff / 21.572);
  currentAngle += motorDiff / 21.572;
  push();
}

function drawPoints() {
  let XDist = 2; //dist from R sensor to center of car
  let XAdd;
  
  //translate sensor data into px distance
  if (IRRVal < 1000 && IRRVal > 900) {
    XAdd = map(IRRVal, 1000, 900, 8, 10);
  } else if (IRRVal < 900 && IRRVal > 790) {
    XAdd = map(IRRVal, 900, 790, 10, 12);
  } else if (IRRVal < 790 && IRRVal > 720) {
    XAdd = map(IRRVal, 790, 720, 12, 14);
  } else if (IRRVal < 720 && IRRVal > 660) {
    XAdd = map(IRRVal, 720, 660, 14, 16);
  } else if (IRRVal < 660 && IRRVal > 610) {
    XAdd = map(IRRVal, 660, 610, 16, 18);
  } else if (IRRVal < 610 && IRRVal > 560) {
    XAdd = map(IRRVal, 610, 560, 18, 21);
  } else if (IRRVal < 560 && IRRVal > 510) {
    XAdd = map(IRRVal, 560, 510, 21, 24);
  }
  XDist += XAdd; //dist in cm
  XDist *= 10;

  //draw point
  strokeWeight(5);
  stroke(0, 0, 255);
  point(XDist, 0);

  let ZDist = 0;
  let ZAdd;

  if (IRFVal < 1000 && IRFVal > 850) {
    ZAdd = map(IRFVal, 1000, 850, 7, 9);
  } else if (IRFVal < 850 && IRFVal > 720) {
    ZAdd = map(IRFVal, 850, 720, 9, 11);
  } else if (IRFVal < 720 && IRFVal > 620) {
    ZAdd = map(IRFVal, 720, 620, 11, 13);
  } else if (IRFVal < 620 && IRFVal > 550) {
    ZAdd = map(IRFVal, 620, 550, 13, 15);
  }

  ZDist += ZAdd;
  ZDist *= 10;
  point(0, ZDist * -1);
}


let x1;
let y1;
let x2;
let y2;

let firstVal = true; //set to !firstVal with each click
let firstClicked = false;

//use 2 mouse clicks to measure the distance between them
function canvasClick() {
  if (!firstClicked) {
    firstClicked = true;
    clickText.html("Click on 2 points to measure the distance between them:");
  } else {
    //on odd # clicks, record click position
    if (firstVal) {
      x1 = mouseX
      y1 = mouseY;
      clickText.html("First point recorded. Click on second point:");
    //on even clicks, record click position + calculate distance
    } else {
      x2 = mouseX;
      y2 = mouseY;
      let xDiff = sq(x2 - x1);
      let yDiff = sq(y2 - y1);
      let length = int(sqrt(xDiff + yDiff));
      clickText.html("Click on 2 points to meausre the distance between them:");
      measureText.html("Object length = " + length / 10 + "cm");
    }
    firstVal = !firstVal;
  }
}


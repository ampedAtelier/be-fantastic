let video;
let poseNet;
let pose;
let skeleton;

let mySound;
//let amp;  //TODO: remove unused amp refs
let fft;
let circleX;
let circleY;
let circleSize;

let rainDrops = [];

// poem
let poem;
let refrainX = 0;
let refrainY = 0;
var speed = 8; // follow speed of refrain, higher number is slower

// Sketch Settings
let shouldShowSkeleton = false;  // can be toggled by pressing 'd' on the keyboard
let shouldUseLiveVideo = false;
let pnOptions = {
  flipHorizontal: shouldUseLiveVideo,
  //scoreThreshold: 0.6, // defaults 0.5
  detectionType: 'single',
};
// Only one videoPath should be uncommented.
//let videoPath = 'assets/video/newVid1hHD.mp4';
let videoPath = 'https://cdn.glitch.com/143a7c8f-a046-4f06-a4a2-9c98e9a30e9e%2FnewVid1hHD.mp4?v=1632334490187';

function preload(){
  poem = loadStrings('poem.txt');
  //mySound = loadSound('assets/audio/rainsound.mp3');
  mySound = loadSound('https://cdn.glitch.com/143a7c8f-a046-4f06-a4a2-9c98e9a30e9e%2Frainsound.mp3?v=1631541521343');
}

function setup() {
  console.log("setting up...");
  // set canvas size and framerate to match video
  createCanvas(960, 540);
  frameRate(30);
  noCursor();

  // set up font
  textFont('Georgia');
  textSize(25);

  mySound.play();
  noFill();
  strokeWeight(5);
  circleX = width / 4;
  circleY = height / 4;
  circleSize = 0;
  
  //amp = new p5.Amplitude();
  fft = new p5.FFT();

  if (shouldUseLiveVideo == true) {
    video = createCapture(VIDEO);
  } else {
    // videoPath is declared above
    video = createVideo(videoPath, onVideoLoaded);
  }
  video.hide();
  // Create a new poseNet object
  //console.log(ml5);
  // https://learn.ml5js.org/#/reference/posenet
  poseNet = ml5.poseNet(video, pnOptions, onModelLoaded);
  poseNet.on("pose", onPoses);

  for (let i = 0; i < 50; i++) {
    rainDrops[i] = new Drop();
  }
}

// invoked when the video loads
function onVideoLoaded() {
  console.log("Video Loaded!");
  video.play();
  video.volume(0);
  //video.volume(0.2);
}

// invoked when the model is loaded
function onModelLoaded() {
  console.log("Model Loaded!");
}

// invoked when poses are detected
function onPoses(poses) {
  //console.log('got poses!');
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function draw() {
  if (pnOptions.flipHorizontal == true) {
    // flip the video
    // https://p5js.org/reference/#/p5/push
    push();
    // https://p5js.org/reference/#/p5/translate
    translate(video.width,0);
    scale(-1.0,1.0); 
    image(video,0,0);
    pop();
  } else {
    image(video,0,0);
  }

  // draw the waveform
  //let level = amp.getLevel(); unused
  let waveform = fft.waveform();
  //let spectrum = fft.analyze; unused

  noFill();
  beginShape();
  stroke(50, 64, 150);
  strokeWeight(2);
  for(let i = 0; i < waveform.length; i++){
    // randomR = random(0,27)
    // randomG = random(20,100)
    // randomB = random(150,255)
    // fill(randomR, randomG, randomB,95)
    //fill (246, 29, 90)
    
    let x = map(i, 0, waveform.length, 0, width)
    let y = map(waveform[i], -1, 1, height, height/1.25);
    //circle(x, y, 5);
    vertex(x,y);
  }
  endShape();
  // draw ripple
  //TODO: rename circleX, circleY, circleSize to ripple....
  noFill();
  circleSize += 15;
  stroke(50, 64, 150);
  circle(circleX, circleY, circleSize);
  circle(circleX, circleY, circleSize * .75);
  circle(circleX, circleY, circleSize * .5);

  // https://p5js.org/reference/#/p5/filter
  //filter(GRAY);
  //Cheyenne:added the blur to see what it looks like. I think it makes Ayesha look more fluid which is pretty cool.
  //filter(BLUR,2);
  
  if (pose) {
    if (shouldShowSkeleton == true) {
      drawKeypoints();
      drawSkeleton();
    }
    drawBodyText();
  }
  // let it rain
  for (let i = 0; i < rainDrops.length; i++) {
    rainDrops[i].fall();
    rainDrops[i].show();
  }
}

function keyPressed() {
  if (key == 'd'){
    console.log('toggling showing the skeleton!');
    shouldShowSkeleton = !shouldShowSkeleton;
  }
}

// draws body keypoints, the greener the keypoints, the higer the confidence
function drawKeypoints() {
  for (let i = 5; i < pose.keypoints.length; i++) {
  	//TODO: only draw keypoint above a certain score
    let x = pose.keypoints[i].position.x;
    let y = pose.keypoints[i].position.y;
    // https://p5js.org/reference/#/p5/lerp
    let c = lerp(0, 255, pose.keypoints[i].score);
    fill(0, c, 0);
    ellipse(x, y, 6, 6);
  }
}

// draws the skeleton
function drawSkeleton() {
  for (let i = 0; i < skeleton.length; i++) {
    let a = skeleton[i][0];
    let b = skeleton[i][1];
    strokeWeight(1);
    stroke(255);
    line(a.position.x, a.position.y, b.position.x, b.position.y);
  }
}

// Cheyenne: adding text to keypoints on the body. 
// Cheyenne: Thinking about keywords assocaited with waves because I was thinking Ayesha's movements look wave like. 
// Keypoint indices can be found here: https://github.com/tensorflow/tfjs-models/tree/master/posenet
function drawBodyText(){
  //TODO: should this be wrapped in push & pop?
  noStroke()
  fill(255);

  let bodyPoint = pose.rightWrist;
  if (bodyPoint.confidence > 0.5) {
    let vec = createVector((bodyPoint.x - refrainX),(bodyPoint.y - refrainY));
    refrainX +=  (vec.x * 1/speed);
    refrainY +=  (vec.y * 1/speed);
  } // else don't move the text
  text("with every drop", refrainX+30, refrainY);

  text(random(poem), 10, 10, 80, 80);
}

function mousePressed(){
  circleX = mouseX;
  circleY = mouseY;
  circleSize = 10;
}

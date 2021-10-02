let video;
let poseNet;
let pose;
let skeleton;

let mySound;
let fft;
let circleX;
let circleY;
let circleSize;

// poem
let poem;
let refrainX = 960;
let refrainY = 540;
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
let videoPath = 'assets/video/newVid1hHD.mp4';
//let videoPath = 'https://cdn.glitch.com/143a7c8f-a046-4f06-a4a2-9c98e9a30e9e%2FnewVid1hHD.mp4?v=1632334490187';
//let videoPath = 'https://cdn.glitch.com/143a7c8f-a046-4f06-a4a2-9c98e9a30e9e%2FnewVid2hHD.mp4?v=1632426045413';

function preload(){
  poem = loadStrings('poem.txt');
  mySound = loadSound('assets/audio/rainsound.mp3');
  //mySound = loadSound('https://cdn.glitch.com/143a7c8f-a046-4f06-a4a2-9c98e9a30e9e%2Frainsound.mp3?v=1631541521343');
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

  /* draw the waveform
  let waveform = fft.waveform();

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
  */
  /* draw ripple
  //TODO: rename circleX, circleY, circleSize to ripple....
  noFill();
  circleSize += 15;
  stroke(50, 64, 150);
  circle(circleX, circleY, circleSize);
  circle(circleX, circleY, circleSize * .75);
  circle(circleX, circleY, circleSize * .5);
  */
  // https://p5js.org/reference/#/p5/filter
  //filter(GRAY);
  //filter(BLUR,2);
  
  if (pose) {
    if (shouldShowSkeleton == true) {
      drawKeypoints();
      drawSkeleton();
    }
    drawBodyText();
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

// Keypoint indices can be found here: https://github.com/tensorflow/tfjs-models/tree/master/posenet
function drawBodyText(){
  //TODO HR: should this be wrapped in push & pop?
  noStroke()
  fill(255);
  textSize(18);

  let bodyPoint = pose.rightWrist;

  if (bodyPoint.confidence > 0.5) {
    let vec = createVector((bodyPoint.x - refrainX),(bodyPoint.y - refrainY));
    refrainX +=  (vec.x * 1/speed);
    refrainY +=  (vec.y * 1/speed);
  } // else don't move the text
  text("with \n     each  \n         drop", refrainX, refrainY);
  //text(random(poem), 10, 10);
}

function mousePressed(){
  //TODO HR: if shouldUseLiveVideo == false then start the video & sound
}

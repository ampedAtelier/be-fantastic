let video;
let poseNet;
let pose;
let skeleton;

let y = 0;
let mySound;
let amp;
let fft;
let circleX;
let circleY;
let circleSize;

let rainDrops = [];

// Sketch Settings
let shouldShowSkeleton = false;  // can be toggled by pressing 'd' on the keyboard
let shouldUseLiveVideo = false;
let pnOptions = {
  flipHorizontal: shouldUseLiveVideo,
  detectionType: 'single',
};
// Only one videoPath should be uncommented.
let videoPath = 'assets/video/eMotionSm.mp4';
//let videoPath = 'https://cdn.glitch.com/143a7c8f-a046-4f06-a4a2-9c98e9a30e9e%2FAyehsa%20bw.mp4?v=1632043045579';
//let videoPath = 'https://cdn.glitch.com/143a7c8f-a046-4f06-a4a2-9c98e9a30e9e%2FAyesha%20Cosmic%20edit.mp4?v=1632043075474';

function preload(){
  mySound = loadSound('assets/audio/rainsound.mp3');
  //mySound = loadSound('https://cdn.glitch.com/143a7c8f-a046-4f06-a4a2-9c98e9a30e9e%2Frainsound.mp3?v=1631541521343');  
}

function setup() {
  console.log("setting up...");
  createCanvas(960, 540);
  mySound.play();
  noCursor();
  noFill();
  strokeWeight(5);
  circleX = width / 4;
  circleY = height / 4;
  circleSize = 0;
  
  amp = new p5.Amplitude();
  fft = new p5.FFT();

  if (shouldUseLiveVideo == true) {
    video = createCapture(VIDEO);
  } else {
    // videoPath is declared above
    video = createVideo(videoPath, onVideoLoaded);
    //video.size(width, height);
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
  video.loop();
  video.volume(0);
}

// invoked when the model is loaded
function onModelLoaded() {
  console.log("Model Loaded!");
}

// invoked when poses are detected
function onPoses(poses) {
  //console.log('got poses!');
  if (poses.length > 0) {
    //TODO: check confidence level of pose
    //console.log(poses);
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
  let level = amp.getLevel(); 
  let waveform = fft.waveform();
  let spectrum = fft.analyze;
  
  for(let i = 0; i < waveform.length; i++){
    randomR = random(0,27)
    randomG = random(20,100)
    randomB = random(150,255)
    noStroke()
    fill(randomR, randomG, randomB,95)
    //fill (246, 29, 90)
    
    let x = map(i, 0, waveform.length, 0, width)
    let y = map(waveform[i], -1, 1, height, height/2 );
    circle(x, y, 5)
  }
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
    // toggle showing the skeleton
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
  noStroke()
  fill(255);
  textSize(25);
  // pose keypoint 10 is the rightWrist
  text("with every drop", pose.keypoints[10].position.x, pose.keypoints[10].position.y);
}

function mousePressed(){
  circleX = mouseX;
  circleY = mouseY;
  circleSize = 10;
}

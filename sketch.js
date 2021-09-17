let video;
let poseNet;
let pose;
let skeleton;
var rainDrops = [];

// Sketch Settings
let shouldShowSkeleton = true;  // can be toggled by pressing 'd' on the keyboard
let shouldUseLiveVideo = false;
let pnOptions = {
  flipHorizontal: shouldUseLiveVideo,
  detectionType: 'single',
};

function setup() {
  console.log("setting up...");
  createCanvas(960, 540);
  noCursor();

  if (shouldUseLiveVideo == true) {
    video = createCapture(VIDEO);
  } else {
    video = createVideo('assets/eMotionSm.mp4', onVideoLoaded);
  	//video = createVideo('https://cdn.glitch.com/143a7c8f-a046-4f06-a4a2-9c98e9a30e9e%2FeMotion1sm.mp4?v=1631659527193', onVideoLoaded);
  	//video = createVideo('https://cdn.glitch.com/143a7c8f-a046-4f06-a4a2-9c98e9a30e9e%2FeMotionSm.mp4?v=1631827841006', onVideoLoaded);
    
    //video.size(width, height);
  }
  video.hide();
  // Create a new poseNet object
  //console.log(ml5);
  // https://learn.ml5js.org/#/reference/posenet
  poseNet = ml5.poseNet(video, pnOptions, onModelLoaded);
  poseNet.on("pose", onPoses);

  for (var i = 0; i < 5; i++) {
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
  // https://p5js.org/reference/#/p5/filter
  filter(GRAY);
  //Cheyenne:added the blur to see what it looks like. I think it makes Ayesha look more fluid which is pretty cool.
  filter(BLUR,2);
  
  if (pose) {
    if (shouldShowSkeleton == true) {
      drawKeypoints();
      drawSkeleton();
    }
    drawBodyText();
  }
  // let it rain
  for (var i = 0; i < rainDrops.length; i++) {
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
  fill(30,200,255);
  // leftWrist
  // Cheyenne: randomised each textfont size to see if it made it more dynamic
  textSize(random(15,35));
  text("the swelling of waves", pose.keypoints[9].position.x, pose.keypoints[9].position.y);
  // rightKnee
  textSize(random(15,35));
  text("the crashing of storms", pose.keypoints[14].position.x, pose.keypoints[14].position.y);
}

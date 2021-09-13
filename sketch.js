let video;
let poseNet;
let pose;
let skeleton;
let pnOptions = {
  flipHorizontal: true,
  detectionType: 'single',
};

function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.hide();

  // Create a new poseNet object
  //console.log(ml5);
  // https://learn.ml5js.org/#/reference/posenet
  //poseNet = ml5.poseNet(video, onModelLoaded);
  poseNet = ml5.poseNet(video, pnOptions, onModelLoaded);
  //poseNet.flipHorizontal = true;
  poseNet.on("pose", onPoses);
}

// invoked when the model is loaded
function onModelLoaded() {
  console.log("Model Loaded!");
}

// invoked when poses are detected
function onPoses(poses) {
  //console.log('got poses!');
  if (poses.length > 0) {
    // maybe check confidence level of pose
    //console.log(poses);
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function draw() {
  // flip the video
  // https://p5js.org/reference/#/p5/push
  push();
  // https://p5js.org/reference/#/p5/translate
  translate(video.width,0);
  scale(-1.0,1.0); 
  image(video,0,0);
  pop();
  
  // https://p5js.org/reference/#/p5/filter
  filter(GRAY);
  
  if (pose) {
    drawKeypoints();
    drawSkeleton();
  }
}

function drawKeypoints() {
  // draw body keypoints
  for (let i = 5; i < pose.keypoints.length; i++) {
    let x = pose.keypoints[i].position.x;
    let y = pose.keypoints[i].position.y;
    // https://p5js.org/reference/#/p5/lerp
    let c = lerp(0, 255, pose.keypoints[i].score);
    fill(0, c, 0);
    ellipse(x, y, 16, 16);
  }
}

function drawSkeleton() {
  // draw the skeleton
  for (let i = 0; i < skeleton.length; i++) {
    let a = skeleton[i][0];
    let b = skeleton[i][1];
    strokeWeight(2);
    stroke(255);
    line(a.position.x, a.position.y, b.position.x, b.position.y);
  }
}

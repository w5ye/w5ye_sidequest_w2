// Y-position of the floor (ground level)
let floorY3;

// Angry mode flag
let angryMode = false;

// Player character (soft, animated blob)
let blob3 = {
  x: 80,
  y: 0,

  // Visual properties
  r: 26,
  points: 48,
  wobble: 7,
  wobbleFreq: 1.8,

  t: 0,
  tSpeed: 0.01,

  // Physics
  vx: 0,
  vy: 0,

  accel: 0.55,
  maxRun: 4.0,
  gravity: 0.65,
  jumpV: -11.0,

  onGround: false,

  frictionAir: 0.995,
  frictionGround: 0.88,
};

// Platforms
let platforms = [];

function setup() {
  createCanvas(640, 360);

  floorY3 = height - 36;

  noStroke();
  textFont("sans-serif");
  textSize(14);

  platforms = [
    {
      x: 0,
      y: floorY3,
      w: width,
      h: height - floorY3,
      breakable: false,
      move: false,
    },

    {
      x: 120,
      y: floorY3 - 70,
      w: 120,
      h: 12,
      breakable: true,
      move: true,
      dir: 1,
    },
    {
      x: 300,
      y: floorY3 - 120,
      w: 90,
      h: 12,
      breakable: true,
      move: true,
      dir: -1,
    },
    {
      x: 440,
      y: floorY3 - 180,
      w: 130,
      h: 12,
      breakable: true,
      move: true,
      dir: 1,
    },
    {
      x: 520,
      y: floorY3 - 70,
      w: 90,
      h: 12,
      breakable: true,
      move: true,
      dir: -1,
    },
  ];

  blob3.y = floorY3 - blob3.r - 1;
}

function draw() {
  background(240);
  // 🔥 Angry mode ONLY when holding space
  angryMode = keyIsDown(32);

  // 🔄 Switch physics based on emotion
  if (angryMode) {
    background(245, 164, 66);
    // 🔥 Angry background text
    push();
    fill(191, 48, 19);
    textAlign(CENTER, CENTER);
    textSize(96);
    text("AHHHH!", width / 2, height / 2);
    pop();
    blob3.points = 15;
    blob3.wobble = 20;
    blob3.wobbleFreq = 2.8;
    blob3.accel = 1.2;
    blob3.maxRun = 7.0;
    blob3.jumpV = -18.0;
    blob3.gravity = 0.75;
    blob3.frictionGround = 0.95;
    blob3.tSpeed = 0.04;
    blob3.wobble = 14;
  } else {
    background(240);
    blob3.r = 26;
    blob3.points = 48;
    blob3.wobble = 7;
    blob3.wobbleFreq = 1.8;
    blob3.accel = 0.55;
    blob3.maxRun = 4.0;
    blob3.jumpV = -11.0;
    blob3.gravity = 0.65;
    blob3.frictionGround = 0.88;
    blob3.tSpeed = 0.01;
    blob3.wobble = 7;
  }

  // 🔥 Move platforms when angry
  if (angryMode) {
    for (const p of platforms) {
      if (p.move) {
        p.x += 1.5 * p.dir;

        // Bounce off screen edges
        if (p.x < 0 || p.x + p.w > width) {
          p.dir *= -1;
        }
      }
    }
  }

  // Draw platforms
  if (angryMode) {
    fill(122, 10, 10);
  } else {
    fill(200);
  }

  for (const p of platforms) {
    rect(p.x, p.y, p.w, p.h);
  }

  // Input (A/D or arrows)
  let move = 0;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) move -= 1;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) move += 1;
  blob3.vx += blob3.accel * move;

  blob3.vx *= blob3.onGround ? blob3.frictionGround : blob3.frictionAir;
  blob3.vx = constrain(blob3.vx, -blob3.maxRun, blob3.maxRun);

  // Gravity
  blob3.vy += blob3.gravity;

  // Collision box
  let box = {
    x: blob3.x - blob3.r,
    y: blob3.y - blob3.r,
    w: blob3.r * 2,
    h: blob3.r * 2,
  };

  // Horizontal collision
  box.x += blob3.vx;
  for (const s of platforms) {
    if (overlap(box, s)) {
      if (blob3.vx > 0) box.x = s.x - box.w;
      else if (blob3.vx < 0) box.x = s.x + s.w;
      blob3.vx = 0;
    }
  }

  // Vertical collision
  box.y += blob3.vy;
  blob3.onGround = false;

  for (const s of platforms) {
    if (overlap(box, s)) {
      if (blob3.vy > 0) {
        // Landing
        box.y = s.y - box.h;
        blob3.vy = 0;
        blob3.onGround = true;
      } else if (blob3.vy < 0) {
        // Hit from below
        if (s.breakable && angryMode) {
          platforms = platforms.filter((p) => p !== s);
          blob3.vy *= -0.3;
        } else {
          box.y = s.y + s.h;
          blob3.vy = 0;
        }
      }
    }
  }

  blob3.x = box.x + box.w / 2;
  blob3.y = box.y + box.h / 2;

  blob3.x = constrain(blob3.x, blob3.r, width - blob3.r);

  // Animate blob
  blob3.t += blob3.tSpeed;
  drawBlobCircle(blob3);
  drawAngryEyebrows(blob3);

  // HUD
  fill(0);
  text(
    "Hold arrow keys = ANGRY MODE  |  A/D or ←/→ Move  |  Space/W/↑ Jump",
    10,
    18,
  );
}
function drawAngryEyebrows(b) {
  if (!angryMode) return;

  push();
  stroke(60, 0, 0);
  strokeWeight(4);
  noFill();

  const eyeY = b.y - b.r * 0.25;
  const spacing = b.r * 0.45;
  const size = b.r * 0.25;

  // Left eyebrow ( \ )
  line(b.x - spacing - size, eyeY - size, b.x - spacing + size, eyeY + size);

  // Right eyebrow ( / )
  line(b.x + spacing - size, eyeY + size, b.x + spacing + size, eyeY - size);

  pop();
}

// AABB collision
function overlap(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

// Draw blob
function drawBlobCircle(b) {
  if (angryMode) fill(220, 60, 40);
  else fill(20, 120, 255);

  beginShape();
  for (let i = 0; i < b.points; i++) {
    const a = (i / b.points) * TAU;

    const n = noise(
      cos(a) * b.wobbleFreq + 200,
      sin(a) * b.wobbleFreq + 200,
      b.t,
    );

    const r = b.r + map(n, 0, 1, -b.wobble, b.wobble);
    const jitter = angryMode ? random(-0.6, 0.6) : 0;

    vertex(b.x + cos(a) * r + jitter, b.y + sin(a) * r + jitter);
  }
  endShape(CLOSE);
}

// Jump
function keyPressed() {
  if ((key === "W" || key === "w" || keyCode === UP_ARROW) && blob3.onGround) {
    blob3.vy = blob3.jumpV;
    blob3.onGround = false;
  }
}

const canvas = document.querySelector("#flow-canvas");
const context = canvas.getContext("2d", { alpha: false });
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const colors = ["#b43b25", "#d28a22", "#405635", "#73805a", "#8f2f20"];
const streams = [
  { color: colors[0], y: 0.18, width: 0.09, amplitude: 0.12, speed: 0.4 },
  { color: colors[1], y: 0.34, width: 0.075, amplitude: 0.1, speed: -0.34 },
  { color: colors[2], y: 0.53, width: 0.095, amplitude: 0.13, speed: 0.29 },
  { color: colors[3], y: 0.69, width: 0.07, amplitude: 0.09, speed: -0.42 },
  { color: colors[4], y: 0.84, width: 0.085, amplitude: 0.1, speed: 0.36 },
];

const pointer = {
  x: 0.5,
  y: 0.5,
  targetX: 0.5,
  targetY: 0.5,
  inside: false,
  down: false,
  pressure: 0.12,
};

const clickRipple = {
  x: 0.5,
  y: 0.5,
  strength: 0,
  phase: 0,
};

let width = 0;
let height = 0;
let animationFrame = 0;
let startTime = performance.now();
let previousTime = startTime;

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  width = bounds.width;
  height = bounds.height;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  if (reducedMotion.matches) {
    draw(performance.now());
  }
}

function streamPoint(stream, x, time, index) {
  const normalizedX = x / width;
  const primaryWave = Math.sin(
    normalizedX * Math.PI * 2.05 + time * stream.speed + index * 1.17,
  );
  const secondaryWave = Math.sin(
    normalizedX * Math.PI * 4.1 - time * stream.speed * 0.54 + index * 0.68,
  );

  const hoverDistance = normalizedX - pointer.x;
  const hoverFalloff = Math.exp(-(hoverDistance * hoverDistance) / 0.026);
  const hoverPull = (pointer.y - stream.y) * height * hoverFalloff * pointer.pressure;

  const rippleDistance = normalizedX - clickRipple.x;
  const rippleFalloff = Math.exp(-(rippleDistance * rippleDistance) / 0.045);
  const rippleWave =
    Math.sin(rippleDistance * 28 - clickRipple.phase + index * 0.5) *
    height *
    0.095 *
    rippleFalloff *
    clickRipple.strength;
  const ripplePull =
    (clickRipple.y - stream.y) *
    height *
    rippleFalloff *
    clickRipple.strength *
    0.24;

  return (
    stream.y * height +
    primaryWave * height * stream.amplitude +
    secondaryWave * height * stream.amplitude * 0.24 +
    hoverPull +
    rippleWave +
    ripplePull
  );
}

function drawStream(stream, index, time) {
  const lineWidth = Math.max(26, height * stream.width);
  const step = Math.max(12, width / 76);

  context.beginPath();

  for (let x = -step; x <= width + step; x += step) {
    const y = streamPoint(stream, x, time, index);

    if (x === -step) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.strokeStyle = stream.color;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.globalAlpha = 0.62;
  context.stroke();

  context.strokeStyle = "#fff7e8";
  context.lineWidth = Math.max(3, lineWidth * 0.09);
  context.globalAlpha = 0.25;
  context.stroke();
}

function draw(timestamp) {
  const elapsed = reducedMotion.matches ? 0 : (timestamp - startTime) / 1000;
  const deltaTime = reducedMotion.matches
    ? 0
    : Math.min(0.035, Math.max(0, (timestamp - previousTime) / 1000));
  previousTime = timestamp;

  pointer.x += (pointer.targetX - pointer.x) * 0.075;
  pointer.y += (pointer.targetY - pointer.y) * 0.075;
  const targetPressure = pointer.down ? 1.18 : pointer.inside ? 0.82 : 0.12;
  pointer.pressure += (targetPressure - pointer.pressure) * 0.07;

  clickRipple.phase += deltaTime * 7;
  clickRipple.strength *= Math.pow(0.08, deltaTime);

  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  context.globalCompositeOperation = "multiply";
  streams.forEach((stream, index) => drawStream(stream, index, elapsed));

  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;

  if (!reducedMotion.matches) {
    animationFrame = requestAnimationFrame(draw);
  }
}

function pointerPosition(event) {
  const bounds = canvas.getBoundingClientRect();

  return {
    normalizedX: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
    normalizedY: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
  };
}

function updatePointer(event) {
  const position = pointerPosition(event);
  pointer.targetX = position.normalizedX;
  pointer.targetY = position.normalizedY;
  pointer.inside = true;

  if (reducedMotion.matches) {
    pointer.x = pointer.targetX;
    pointer.y = pointer.targetY;
    pointer.pressure = 0.82;
    draw(performance.now());
  }
}

canvas.addEventListener("pointerenter", () => {
  pointer.inside = true;
});
canvas.addEventListener("pointermove", updatePointer);
canvas.addEventListener("pointerdown", (event) => {
  const position = pointerPosition(event);
  pointer.down = true;
  pointer.inside = true;
  pointer.targetX = position.normalizedX;
  pointer.targetY = position.normalizedY;
  clickRipple.x = position.normalizedX;
  clickRipple.y = position.normalizedY;
  clickRipple.strength = 1;
  clickRipple.phase = Math.random() * Math.PI * 2;
  canvas.setPointerCapture(event.pointerId);

  if (reducedMotion.matches) {
    pointer.x = pointer.targetX;
    pointer.y = pointer.targetY;
    draw(performance.now());
  }
});
canvas.addEventListener("pointerup", (event) => {
  pointer.down = false;
  canvas.releasePointerCapture(event.pointerId);
});
canvas.addEventListener("pointercancel", () => {
  pointer.down = false;
});
canvas.addEventListener("pointerleave", () => {
  pointer.inside = false;
  pointer.down = false;
});

reducedMotion.addEventListener("change", () => {
  cancelAnimationFrame(animationFrame);
  startTime = performance.now();
  previousTime = startTime;
  draw(startTime);
});

new ResizeObserver(resizeCanvas).observe(canvas);
resizeCanvas();
draw(startTime);

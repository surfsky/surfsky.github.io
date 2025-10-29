const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');
const fractalSelector = document.getElementById('fractalSelector');
const zoomInButton = document.getElementById('zoomIn');
const zoomOutButton = document.getElementById('zoomOut');
const resetZoomButton = document.getElementById('resetZoom');
const pauseButton = document.getElementById('pause');
const fpsDisplay = document.getElementById('fpsDisplay');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let currentFractal = 'fractalTree';
let zoom = 1.0;
let panX = 0.0;
let panY = 0.0;
let isPaused = false;

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

fractalSelector.addEventListener('change', (e) => {
    currentFractal = e.target.value;
    isMandelbrotCalculated = false; // 切换分形时重置缓存
    if (isPaused) {
        animateOnce(time);
    }
});

zoomInButton.addEventListener('click', () => {
    const zoomFactor = 1.2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (currentFractal === 'mandelbrotSet') {
        const C1 = canvas.width / 1.5;
        const C2 = canvas.height / 2;
        panX = (centerX - C1) * (zoomFactor - 1) + panX * zoomFactor;
        panY = (centerY - C2) * (zoomFactor - 1) + panY * zoomFactor;
    } else {
        panX = centerX * (1 - zoomFactor) + panX * zoomFactor;
        panY = centerY * (1 - zoomFactor) + panY * zoomFactor;
    }

    zoom *= zoomFactor;
    isMandelbrotCalculated = false;
    if (isPaused) {
        animateOnce(time);
    }
});

zoomOutButton.addEventListener('click', () => {
    const zoomFactor = 1 / 1.2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (currentFractal === 'mandelbrotSet') {
        const C1 = canvas.width / 1.5;
        const C2 = canvas.height / 2;
        panX = (centerX - C1) * (zoomFactor - 1) + panX * zoomFactor;
        panY = (centerY - C2) * (zoomFactor - 1) + panY * zoomFactor;
    } else {
        panX = centerX * (1 - zoomFactor) + panX * zoomFactor;
        panY = centerY * (1 - zoomFactor) + panY * zoomFactor;
    }

    zoom *= zoomFactor;
    isMandelbrotCalculated = false;
    if (isPaused) {
        animateOnce(time);
    }
});

resetZoomButton.addEventListener('click', () => {
    zoom = 1.0;
    panX = 0.0;
    panY = 0.0;
    isMandelbrotCalculated = false;
    if (isPaused) {
        animateOnce(time);
    }
});

pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    if (!isPaused) {
        animate();
    }
});

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        if (currentFractal === 'mandelbrotSet') {
            panX -= dx;
            panY -= dy;
        } else {
            panX += dx;
            panY += dy;
        }
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        isMandelbrotCalculated = false;
        if (isPaused) {
            animateOnce(time);
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

canvas.addEventListener('dblclick', (e) => {
    const zoomFactor = 2.0;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (currentFractal === 'mandelbrotSet') {
        const C1 = canvas.width / 1.5;
        const C2 = canvas.height / 2;
        panX = (mouseX - C1) * (zoomFactor - 1) + panX * zoomFactor;
        panY = (mouseY - C2) * (zoomFactor - 1) + panY * zoomFactor;
    } else {
        panX = mouseX * (1 - zoomFactor) + panX * zoomFactor;
        panY = mouseY * (1 - zoomFactor) + panY * zoomFactor;
    }

    zoom *= zoomFactor;
    isMandelbrotCalculated = false;
    if (isPaused) {
        animateOnce(time);
    }
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    panX = mouseX * (1 - zoomFactor) + panX * zoomFactor;
    panY = mouseY * (1 - zoomFactor) + panY * zoomFactor;

    zoom *= zoomFactor;
    isMandelbrotCalculated = false;
    if (isPaused) {
        animateOnce(time);
    }
});

let time = 0;
let lastFractal = 'fractalTree';

function animateOnce(time) {
    if (currentFractal !== lastFractal) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (currentFractal === 'barnsleyFern') {
            fernState = { x: 0, y: 0 };
        }
        lastFractal = currentFractal;
    }

    if (currentFractal !== 'barnsleyFern' && currentFractal !== 'barnsleyFernColored') {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (currentFractal === 'fractalTree') {
        ctx.strokeStyle = 'white';
        const angle = Math.sin(time * 0.01) * 20;
        fractals.fractalTree(ctx, canvas.width / 2, canvas.height, 120, angle, 10, zoom, panX, panY);
    } else if (currentFractal === 'kochSnowflake') {
        const level = Math.floor((Math.sin(time * 0.01) + 1) * 3.5) + 1;
        fractals.kochSnowflake(ctx, canvas.width / 2 - 250, canvas.height / 2, 500, level, zoom, panX, panY);
    } else if (currentFractal === 'sierpinskiTriangle') {
        const level = Math.floor((Math.sin(time * 0.01) + 1) * 5.5) + 1;
        fractals.sierpinskiTriangle(ctx, canvas.width / 2 - 200, canvas.height / 2 + 200, 400, level, zoom, panX, panY);
    } else if (currentFractal === 'barnsleyFern') {
        const numPoints = Math.floor((Math.sin(time * 0.01) + 1) * 5000);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        fractals.barnsleyFern(ctx, canvas.width, canvas.height, numPoints, zoom, panX, panY);
    } else if (currentFractal === 'pythagorasTree') {
        ctx.strokeStyle = 'white';
        const maxLevel = 10;
        const level = Math.floor(((Math.sin(time * 0.02) + 1) / 2) * (maxLevel - 1)) + 1;
        fractals.pythagorasTree(ctx, canvas.width / 2 - 35, canvas.height - 50, canvas.width / 2 + 35, canvas.height - 50, level, zoom, panX, panY);
    } else if (currentFractal === 'mandelbrotSet') {
        fractals.mandelbrotSet(ctx, canvas.width, canvas.height, time, zoom, panX, panY);
    } else if (currentFractal === 'juliaSet') {
        fractals.juliaSet(ctx, canvas.width, canvas.height, time, zoom, panX, panY);
    }
}

let lastTime = 0;
let frameCount = 0;

function animate() {
    const now = performance.now();
    const deltaTime = now - lastTime;
    frameCount++;

    if (deltaTime >= 1000) {
        const fps = frameCount;
        fpsDisplay.textContent = `FPS: ${fps}`;
        frameCount = 0;
        lastTime = now;
    }

    if (isPaused) {
        requestAnimationFrame(animate);
        return;
    }
    time++;
    animateOnce(time);
    requestAnimationFrame(animate);
}

animate();
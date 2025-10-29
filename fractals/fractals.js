function drawFractalTree(ctx, x, y, len, angle, branchWidth, zoom, panX, panY) {
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    function drawBranch(x, y, len, angle, branchWidth) {
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = branchWidth;
        ctx.translate(x, y);
        ctx.rotate(angle * Math.PI / 180);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -len);
        ctx.stroke();

        if (len < 10) {
            ctx.restore();
            return;
        }

        drawBranch(0, -len, len * 0.8, -angle, branchWidth * 0.8);
        drawBranch(0, -len, len * 0.8, angle, branchWidth * 0.8);

        ctx.restore();
    }

    drawBranch(x, y, len, angle, branchWidth);
    ctx.restore();
}

function drawKochSnowflake(ctx, x, y, len, level, zoom, panX, panY) {
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    const drawLine = (x1, y1, x2, y2) => {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    };

    const divideLine = (x1, y1, x2, y2, level) => {
        if (level === 0) {
            drawLine(x1, y1, x2, y2);
            return;
        }

        const dx = x2 - x1;
        const dy = y2 - y1;

        const x3 = x1 + dx / 3;
        const y3 = y1 + dy / 3;

        const x4 = x1 + dx * 2 / 3;
        const y4 = y1 + dy * 2 / 3;

        const angle = Math.PI / 3;
        const x5 = x3 + (x4 - x3) * Math.cos(angle) + (y4 - y3) * Math.sin(angle);
        const y5 = y3 - (x4 - x3) * Math.sin(angle) + (y4 - y3) * Math.cos(angle);

        divideLine(x1, y1, x3, y3, level - 1);
        divideLine(x3, y3, x5, y5, level - 1);
        divideLine(x5, y5, x4, y4, level - 1);
        divideLine(x4, y4, x2, y2, level - 1);
    };

    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    divideLine(x, y, x + len, y, level);
    divideLine(x + len, y, x + len / 2, y + len * Math.sqrt(3) / 2, level);
    divideLine(x + len / 2, y + len * Math.sqrt(3) / 2, x, y, level);
    ctx.stroke();
    ctx.restore();
}

function drawSierpinskiTriangle(ctx, x, y, size, level, zoom, panX, panY) {
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    function drawTriangle(x, y, size, level) {
        if (level === 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.lineTo(x + size / 2, y - size * Math.sqrt(3) / 2);
            ctx.closePath();
            ctx.fillStyle = 'white';
            ctx.fill();
        } else {
            const newSize = size / 2;
            const newHeight = newSize * Math.sqrt(3) / 2;
            drawTriangle(x, y, newSize, level - 1);
            drawTriangle(x + newSize, y, newSize, level - 1);
            drawTriangle(x + newSize / 2, y - newHeight, newSize, level - 1);
        }
    }

    drawTriangle(x, y, size, level);
    ctx.restore();
}

function drawBarnsleyFern(ctx, canvasWidth, canvasHeight, numPoints, zoom, panX, panY) {
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);
    ctx.fillStyle = 'white';

    const scale = 50;
    let fernState = { x: 0, y: 0 };

    // Iterate a few times to let the fractal settle before drawing
    for (let i = 0; i < 20; i++) {
        const r = Math.random();
        let nextX, nextY;
        if (r < 0.01) {
            nextX = 0;
            nextY = 0.16 * fernState.y;
        } else if (r < 0.86) {
            nextX = 0.85 * fernState.x + 0.04 * fernState.y;
            nextY = -0.04 * fernState.x + 0.85 * fernState.y + 1.6;
        } else if (r < 0.93) {
            nextX = 0.2 * fernState.x - 0.26 * fernState.y;
            nextY = 0.23 * fernState.x + 0.22 * fernState.y + 1.6;
        } else {
            nextX = -0.15 * fernState.x + 0.28 * fernState.y;
            nextY = 0.26 * fernState.x + 0.24 * fernState.y + 0.44;
        }
        fernState.x = nextX;
        fernState.y = nextY;
    }

    // Draw the points
    for (let i = 0; i < numPoints; i++) {
        const r = Math.random();
        let nextX, nextY;

        if (r < 0.01) {
            nextX = 0;
            nextY = 0.16 * fernState.y;
        } else if (r < 0.86) {
            nextX = 0.85 * fernState.x + 0.04 * fernState.y;
            nextY = -0.04 * fernState.x + 0.85 * fernState.y + 1.6;
        } else if (r < 0.93) {
            nextX = 0.2 * fernState.x - 0.26 * fernState.y;
            nextY = 0.23 * fernState.x + 0.22 * fernState.y + 1.6;
        } else {
            nextX = -0.15 * fernState.x + 0.28 * fernState.y;
            nextY = 0.26 * fernState.x + 0.24 * fernState.y + 0.44;
        }

        fernState.x = nextX;
        fernState.y = nextY;

        const plotX = canvasWidth / 2 + fernState.x * scale;
        const plotY = canvasHeight * 0.9 - fernState.y * scale;
        ctx.fillRect(plotX, plotY, 1, 1);
    }
    ctx.restore();
}


function drawPythagorasTree(ctx, x1, y1, x2, y2, level, zoom, panX, panY) {
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    function draw(x1, y1, x2, y2, level) {
        if (level === 0) {
            return;
        }

        // 计算正方形的边长和向量
        const dx = x2 - x1;
        const dy = y1 - y2;

        // 计算正方形的另外两个顶点
        const x3 = x2 - dy;
        const y3 = y2 - dx;
        const x4 = x1 - dy;
        const y4 = y1 - dx;

        // 绘制正方形
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.stroke();

        // 计算顶部三角形的顶点
        const x5 = x4 + 0.5 * (dx - dy);
        const y5 = y4 - 0.5 * (dx + dy);

        // 递归绘制下一层的两个分支
        draw(x4, y4, x5, y5, level - 1);
        draw(x5, y5, x3, y3, level - 1);
    }

    draw(x1, y1, x2, y2, level);
    ctx.restore();
}

let mandelbrotCache = null;
let isMandelbrotCalculated = false;

/**
 * 绘制曼德博集合分形。
 * @param {CanvasRenderingContext2D} ctx - 画布上下文。
 * @param {number} canvasWidth - 画布宽度。
 * @param {number} canvasHeight - 画布高度。
 * @param {number} time - 时间参数，用于动画。
 * @param {number} zoom - 缩放级别。
 * @param {number} panX - X轴平移。
 * @param {number} panY - Y轴平移。
 */
function drawMandelbrotSet(ctx, canvasWidth, canvasHeight, time, zoom, panX, panY) {
    const maxIter = 100;

    if (!isMandelbrotCalculated) {
        mandelbrotCache = [];
        for (let px = 0; px < canvasWidth; px++) {
            mandelbrotCache[px] = [];
            for (let py = 0; py < canvasHeight; py++) {
                const x0 = (px - canvasWidth / 1.5 + panX) * 4.0 / (canvasWidth * zoom);
                const y0 = (py - canvasHeight / 2 + panY) * 4.0 / (canvasHeight * zoom);

                let x = 0.0;
                let y = 0.0;
                let iteration = 0;

                while (x * x + y * y <= 4 && iteration < maxIter) {
                    const xtemp = x * x - y * y + x0;
                    y = 2 * x * y + y0;
                    x = xtemp;
                    iteration++;
                }
                mandelbrotCache[px][py] = iteration;
            }
        }
        isMandelbrotCalculated = true;
    }

    const hueOffset = time * 5;
    for (let px = 0; px < canvasWidth; px++) {
        for (let py = 0; py < canvasHeight; py++) {
            const iteration = mandelbrotCache[px][py];
            const color = iteration === maxIter ? 'black' : `hsl(${(iteration + hueOffset) % 360}, 100%, 50%)`;
            ctx.fillStyle = color;
            ctx.fillRect(px, py, 1, 1);
        }
    }
}

/**
 * 绘制朱利亚集合分形。
 * @param {CanvasRenderingContext2D} ctx - 画布上下文。
 * @param {number} canvasWidth - 画布宽度。
 * @param {number} canvasHeight - 画布高度。
 * @param {number} time - 时间参数，用于动画。
 * @param {number} zoom - 缩放级别。
 * @param {number} panX - X轴平移。
 * @param {number} panY - Y轴平移。
 */
function drawJuliaSet(ctx, canvasWidth, canvasHeight, time, zoom, panX, panY) {
    const maxIter = 100;
    // c 是一个常数，其值决定了朱利亚集合的形状
    const cRe = 0.7885 * Math.cos(time / 1000);
    const cIm = 0.7885 * Math.sin(time / 1000);

    for (let px = 0; px < canvasWidth; px++) {
        for (let py = 0; py < canvasHeight; py++) {
            // 将像素坐标映射到复数平面
            let newRe = (px - canvasWidth / 2 + panX) * 1.5 / (0.5 * canvasWidth * zoom);
            let newIm = (py - canvasHeight / 2 + panY) * 1.5 / (0.5 * canvasHeight * zoom);

            let iteration = 0;
            // 迭代计算 z = z^2 + c
            while (newRe * newRe + newIm * newIm <= 4 && iteration < maxIter) {
                const oldRe = newRe;
                const oldIm = newIm;
                newRe = oldRe * oldRe - oldIm * oldIm + cRe;
                newIm = 2 * oldRe * oldIm + cIm;
                iteration++;
            }

            // 根据迭代次数着色
            const hueOffset = time * 5;
            const color = iteration === maxIter ? 'black' : `hsl(${(iteration + hueOffset) % 360}, 100%, 50%)`;
            ctx.fillStyle = color;
            ctx.fillRect(px, py, 1, 1);
        }
    }
}

const fractals = {
    fractalTree: drawFractalTree,
    kochSnowflake: drawKochSnowflake,
    sierpinskiTriangle: drawSierpinskiTriangle,
    barnsleyFern: drawBarnsleyFern,
    pythagorasTree: drawPythagorasTree,
    mandelbrotSet: drawMandelbrotSet,
    juliaSet: drawJuliaSet,
};
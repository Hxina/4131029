const blossomCanvas = document.getElementById("blossomCanvas");
const blossomCtx = blossomCanvas.getContext("2d");

let blossoms = [];
let blossomAnimationFrameId;
let blossomAnimationIntervalId;

function adjustBlossomCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    blossomCanvas.width = blossomCanvas.clientWidth * dpr;
    blossomCanvas.height = blossomCanvas.clientHeight * dpr;
    blossomCtx.scale(dpr, dpr);
}

function drawBlossom(x, y, rotation, petals) {
    blossomCtx.save();
    blossomCtx.translate(x, y);
    blossomCtx.rotate(rotation);

    petals.forEach(petal => {
        blossomCtx.save();
        blossomCtx.translate(petal.x, petal.y);
        blossomCtx.rotate(petal.angle);
        drawPetal(petal.size, petal.stamens);
        blossomCtx.restore();
    });

    blossomCtx.restore();
}

function drawPetal(size, stamens) {
    blossomCtx.beginPath();
    blossomCtx.moveTo(0, 0);
    blossomCtx.bezierCurveTo(size / 2, -size / 2, size, -size / 4, size, 0);
    blossomCtx.bezierCurveTo(size, size / 4, size / 2, size / 2, 0, 0);

    const gradientStrokePetalColor = blossomCtx.createRadialGradient(0, size / 4, size / 2, 0, 0, size);
    gradientStrokePetalColor.addColorStop(0, "#ff859f");
    gradientStrokePetalColor.addColorStop(1, "#fdf1f4");
    blossomCtx.strokeStyle = gradientStrokePetalColor;
    blossomCtx.stroke();

    const gradientPetalColor = blossomCtx.createRadialGradient(0, 0, size / 9, 0, 0, size);
    gradientPetalColor.addColorStop(0, "#f47983");
    gradientPetalColor.addColorStop(1, "#fdf1f4");
    blossomCtx.fillStyle = gradientPetalColor;
    blossomCtx.fill();

    stamens.forEach(stamen => {
        blossomCtx.save();
        blossomCtx.rotate(stamen.angle);
        blossomCtx.beginPath();
        blossomCtx.moveTo(0, 0);
        blossomCtx.lineTo(stamen.length, 0);
        blossomCtx.strokeStyle = "#fde9ed";
        blossomCtx.stroke();
        blossomCtx.beginPath();
        blossomCtx.arc(stamen.length, 0, 2, 0, 2 * Math.PI);
        blossomCtx.fillStyle = "#fbd3dc";
        blossomCtx.fill();
        blossomCtx.restore();
    });
}

function createBlossom() {
    const x = Math.random() * blossomCanvas.width;
    const y = -20;
    const size = Math.random() * 20 + 20;
    const speed = Math.random() * 0.5 + 0.5;
    const wind = (Math.random() - 0.5) * 1.28;
    const rotation = Math.random() * 2 * Math.PI;
    const rotationSpeed = (Math.random() - 0.5) * 0.03;

    const petals = [];
    const petalCount = 5;

    for (let i = 0; i < petalCount; i++) {
        const petal = {
            x: 0,
            y: 0,
            size: size,
            angle: (i * 2 * Math.PI) / petalCount,
            stamens: []
        };

        const stamenCount = Math.floor(Math.random() * 5) + 3;
        for (let j = 0; j < stamenCount; j++) {
            const stamen = {
                length: Math.random() * (size / 4) + size / 5,
                angle: (Math.random() * (Math.PI / 3)) - (Math.PI / 10)
            };
            petal.stamens.push(stamen);
        }

        petals.push(petal);
    }

    const blossom = {
        x: x,
        y: y,
        size: size,
        speed: speed,
        wind: wind,
        rotation: rotation,
        rotationSpeed: rotationSpeed,
        petals: petals
    };

    blossoms.push(blossom);
}

function blossomAnimate() {
    blossomCtx.clearRect(0, 0, blossomCanvas.width, blossomCanvas.height);

    blossoms.forEach((blossom, index) => {
        blossom.y += blossom.speed;
        blossom.x += blossom.wind;
        blossom.rotation += blossom.rotationSpeed;
        drawBlossom(blossom.x, blossom.y, blossom.rotation, blossom.petals);

        if (blossom.y > blossomCanvas.height || blossom.x < -50 || blossom.x > blossomCanvas.width + 50) {
            blossoms.splice(index, 1);
        }
    });

    blossomAnimationFrameId = requestAnimationFrame(blossomAnimate);
}

function startBlossomAnimation() {
    adjustBlossomCanvasSize();
    window.addEventListener("resize", adjustBlossomCanvasSize);
    blossomAnimationIntervalId = setInterval(createBlossom, 1800);
    blossomAnimate();
}

function stopBlossomAnimation() {
    cancelAnimationFrame(blossomAnimationFrameId);
    clearInterval(blossomAnimationIntervalId);
    blossomAnimationIntervalId = null;
    window.removeEventListener("resize", adjustBlossomCanvasSize);
}

function resumeBlossomAnimation() {
    if (!blossomAnimationIntervalId) {
        blossomAnimationIntervalId = setInterval(createBlossom, 1800);
    }

    blossomAnimationFrameId = requestAnimationFrame(blossomAnimate);
}

export {
    adjustBlossomCanvasSize,
    startBlossomAnimation,
    stopBlossomAnimation,
    resumeBlossomAnimation
}
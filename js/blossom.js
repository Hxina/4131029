const canvas = document.getElementById("blossomCanvas");
const ctx = canvas.getContext("2d");

let blossoms = [];
let blossomAnimationFrameId;
let blossomAnimationIntervalId;

function adjustCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
}

function drawBlossom(x, y, rotation, petals) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    petals.forEach(petal => {
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.angle);
        drawPetal(petal.size, petal.stamens);
        ctx.restore();
    });

    ctx.restore();
}

function drawPetal(size, stamens) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size / 2, -size / 2, size, -size / 4, size, 0);
    ctx.bezierCurveTo(size, size / 4, size / 2, size / 2, 0, 0);

    const gradientStrokePetalColor = ctx.createRadialGradient(0, size / 4, size / 2, 0, 0, size);
    gradientStrokePetalColor.addColorStop(0, "#ff859f");
    gradientStrokePetalColor.addColorStop(1, "#fdf1f4");
    ctx.strokeStyle = gradientStrokePetalColor;
    ctx.stroke();

    const gradientPetalColor = ctx.createRadialGradient(0, 0, size / 9, 0, 0, size);
    gradientPetalColor.addColorStop(0, "#f47983");
    gradientPetalColor.addColorStop(1, "#fdf1f4");
    ctx.fillStyle = gradientPetalColor;
    ctx.fill();

    stamens.forEach(stamen => {
        ctx.save();
        ctx.rotate(stamen.angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(stamen.length, 0);
        ctx.strokeStyle = "#fde9ed";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(stamen.length, 0, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#fbd3dc";
        ctx.fill();
        ctx.restore();
    });
}

function createBlossom() {
    const x = Math.random() * canvas.width;
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    blossoms.forEach((blossom, index) => {
        blossom.y += blossom.speed;
        blossom.x += blossom.wind;
        blossom.rotation += blossom.rotationSpeed;
        drawBlossom(blossom.x, blossom.y, blossom.rotation, blossom.petals);

        if (blossom.y > canvas.height || blossom.x < -50 || blossom.x > canvas.width + 50) {
            blossoms.splice(index, 1);
        }
    });

    blossomAnimationFrameId = requestAnimationFrame(blossomAnimate);
}

function startBlossomAnimation() {
    adjustCanvasSize();
    window.addEventListener("resize", adjustCanvasSize);
    blossomAnimationIntervalId = setInterval(createBlossom, 1800);
    blossomAnimate();
}

function stopBlossomAnimation() {
    cancelAnimationFrame(blossomAnimationFrameId);
    clearInterval(blossomAnimationIntervalId);
    blossomAnimationIntervalId = null;
    window.removeEventListener("resize", adjustCanvasSize);
}

function resumeBlossomAnimation() {
    if (!blossomAnimationIntervalId) {
        blossomAnimationIntervalId = setInterval(createBlossom, 1800);
    }

    blossomAnimationFrameId = requestAnimationFrame(blossomAnimate);
}

export {
    adjustCanvasSize,
    startBlossomAnimation,
    stopBlossomAnimation,
    resumeBlossomAnimation
}

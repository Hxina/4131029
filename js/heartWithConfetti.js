const heartCanvas = document.getElementById("heartWithConfettiCanvas");
const heartCtx = heartCanvas.getContext("2d");

let hearts = [];
let confetti = [];
let mouseX = 0;
let mouseY = 0;
let heartAnimationFrameId;
let heartAnimationIntervalId;

function adjustHeartCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    heartCanvas.width = heartCanvas.clientWidth * dpr;
    heartCanvas.height = heartCanvas.clientHeight * dpr;
    heartCtx.scale(dpr, dpr);
}

function drawHeart(x, y, size, color, alpha) {
    heartCtx.save();
    heartCtx.globalAlpha = alpha;
    heartCtx.beginPath();
    heartCtx.translate(x, y);
    heartCtx.moveTo(0, -size / 2);
    heartCtx.bezierCurveTo(size / 2, -size, size, -size / 8, 0, size * 0.4);
    heartCtx.bezierCurveTo(-size, -size / 8, -size / 2, -size, 0, -size / 2);
    heartCtx.closePath();
    heartCtx.fillStyle = color;
    heartCtx.fill();
    heartCtx.restore();
}

function drawConfetti(confetto) {
    heartCtx.save();
    heartCtx.globalAlpha = confetto.alpha;
    heartCtx.fillStyle = confetto.color;
    heartCtx.beginPath();
    heartCtx.arc(confetto.x, confetto.y, confetto.size / 2, 0, Math.PI * 2);
    heartCtx.fill();
    heartCtx.restore();
}

function createHeart() {
    const x = Math.random() * heartCanvas.width;
    const y = heartCanvas.height + 20;
    const size = Math.random() * 30 + 20;
    const verticalSpeed = Math.random() + 0.2;
    const horizontalSpeed = (Math.random() - 0.3) * 1.2;
    const color = createRandomColor();
    const alpha = 1;
    const explosionProbability = Math.random() < 0.1;
    const targetHeight = Math.random() * heartCanvas.height * 0.5 + heartCanvas.height * 0.1

    const heart = {
        x: x,
        y: y,
        size: size,
        verticalSpeed: verticalSpeed,
        horizontalSpeed: horizontalSpeed,
        color: color,
        alpha: alpha,
        explosionProbability: explosionProbability,
        targetHeight: targetHeight,
        needsExplosion: false
    };
    hearts.push(heart);
}

function createExplosion(x, y) {
    const numParticles = Math.random() * 40 + 20;

    for (let i = 0; i < numParticles; i++) {
        const maxSpeed = Math.random() * 5;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * maxSpeed;
        const speedX = Math.cos(angle) * speed;
        const speedY = Math.sin(angle) * speed;
        const size = Math.random() * 6 + 3;
        const color = createRandomColor();
        const gravity = 0.01;
        const disappearDistance = Math.random() * 40 + heartCanvas.height * 0.3 + heartCanvas.width * 0.3;
        const alpha = Math.random() * 0.3 + 0.7;

        const particle = {
            x: x,
            y: y,
            size: size,
            speedX: speedX,
            speedY: speedY,
            color: color,
            gravity: gravity,
            disappearDistance: disappearDistance,
            alpha: alpha
        };
        confetti.push(particle);
    }
}

function createRandomColor() {
    let hue, saturation, lightness;
    const range = Math.random();

    if (range < 0.3) {
        hue = Math.random() * 30;
    } else if (range < 0.6) {
        hue = Math.random() * 60 + 180;
    } else {
        hue = Math.random() * 30 + 330;
    }
    saturation = Math.random() * 30 + 70;
    lightness = Math.random() * 60 + 40;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function detectCollision(heart1, heart2) {
    const dx = heart1.x - heart2.x;
    const dy = heart1.y - heart2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (heart1.size + heart2.size) / 2;
}

function findCollisions() {
    let visited = new Array(hearts.length).fill(false);
    let clusters = [];

    function dfs(index, cluster) {
        visited[index] = true;
        cluster.push(index);

        for (let i = 0; i < hearts.length; i++) {
            if (!visited[i] && detectCollision(hearts[index], hearts[i])) {
                dfs(i, cluster);
            }
        }
    }

    for (let i = 0; i < hearts.length; i++) {
        if (!visited[i]) {
            let cluster = [];
            dfs(i, cluster);
            if (cluster.length > 1) {
                clusters.push(cluster);
            }
        }
    }

    clusters.forEach(cluster => {
        cluster.forEach(index => {
            hearts[index].needsExplosion = true;
        });
    });
}

function heartAnimate() {
    heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);

    let mouseOverHeart = false;

    hearts.forEach((heart) => {
        heart.y -= heart.verticalSpeed;
        heart.x += heart.horizontalSpeed;
        heart.horizontalSpeed += (Math.random() - 0.5) * 0.1;
        heart.alpha = 0.2 + (heart.y / heartCanvas.height) * 0.8;

        const dx = mouseX - heart.x;
        const dy = mouseY - heart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < heart.size) {
            mouseOverHeart = true;
        }

        if (heart.y <= heart.targetHeight && heart.explosionProbability) {
            heart.needsExplosion = true;
        } else {
            drawHeart(heart.x, heart.y, heart.size, heart.color, heart.alpha);
        }
    });

    if (mouseOverHeart) {
        heartCanvas.style.cursor = "pointer";
    } else {
        heartCanvas.style.cursor = "default";
    }

    findCollisions();

    hearts = hearts.filter(heart => {
        if (heart.needsExplosion) {
            createExplosion(heart.x, heart.y);
            return false;
        }
        return true;
    });

    let confettiToRemove = [];

    confetti.forEach((confetto, index) => {
        confetto.x += confetto.speedX;
        confetto.y += confetto.speedY;
        confetto.speedY += confetto.gravity;

        if (confetto.y >= confetto.disappearDistance) {
            confetto.alpha -= 0.01;
        }

        if (confetto.alpha <= 0) {
            confettiToRemove.push(index);
        } else {
            drawConfetti(confetto);
        }
    });

    confettiToRemove.forEach((index) => {
        confetti.splice(index, 1);
    });

    heartAnimationFrameId = requestAnimationFrame(heartAnimate);
}

function startHeartAnimation() {
    adjustHeartCanvasSize();
    window.addEventListener("resize", adjustHeartCanvasSize);
    heartAnimationIntervalId = setInterval(createHeart, 300);
    heartAnimate();
}

function stopHeartAnimation() {
    cancelAnimationFrame(heartAnimationFrameId);
    clearInterval(heartAnimationIntervalId);
    heartAnimationIntervalId = null;
    window.removeEventListener("resize", adjustHeartCanvasSize);
}

function resumeHeartAnimation() {
    if (!heartAnimationIntervalId) {
        heartAnimationIntervalId = setInterval(createHeart, 300);
    }

    heartAnimationFrameId = requestAnimationFrame(heartAnimate);
}

function addMouseMoveEventListener(heartCanvas) {
    heartCanvas.addEventListener("mousemove", function (event) {
        const rect = heartCanvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;

        let mouseOverHeart = false;

        hearts.forEach((heart) => {
            const dx = mouseX - heart.x;
            const dy = mouseY - heart.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < heart.size) {
                mouseOverHeart = true;
            }
        });

        if (mouseOverHeart) {
            heartCanvas.style.cursor = "pointer";
        } else {
            heartCanvas.style.cursor = "default";
        }
    });
}

function addClickEventListener(heartCanvas) {
    heartCanvas.addEventListener("click", function (event) {
        const rect = heartCanvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        hearts.forEach((heart) => {
            const dx = mouseX - heart.x;
            const dy = mouseY - heart.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < heart.size) {
                heart.needsExplosion = true;
            }
        });
    });
}

export {
    adjustHeartCanvasSize,
    startHeartAnimation,
    stopHeartAnimation,
    resumeHeartAnimation,
    addMouseMoveEventListener,
    addClickEventListener
}
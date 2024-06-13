(function () {
    class Heart {
        constructor(x, y, size, color, alpha, speedX, speedY) {
            this.init(x, y, size, color, alpha, speedX, speedY);
        }

        init(x, y, size, color, alpha, speedX, speedY) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.alpha = alpha;
            this.speedX = speedX;
            this.speedY = speedY;
            this.shouldExplosion = false;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.moveTo(0, -this.size / 2);
            ctx.bezierCurveTo(this.size / 2, -this.size, this.size, -this.size / 8, 0, this.size * 0.4);
            ctx.bezierCurveTo(-this.size, -this.size / 8, -this.size / 2, -this.size, 0, -this.size / 2);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }

        update(deltaTime, canvasHeight) {
            this.x += this.speedX * deltaTime / 16;
            this.y -= this.speedY * deltaTime / 16;
            this.alpha = 0.7 + (this.y / canvasHeight) * 0.3;
            this.speedX += (Math.random() - 0.5) * 0.1;
            this.speedY += (Math.random() - 0.5) * 0.1;
        }
    }

    class Confetti {
        constructor(x, y, size, color, alpha, speedX, speedY, gravity, disappearDistance) {
            this.init(x, y, size, color, alpha, speedX, speedY, gravity, disappearDistance);
        }

        init(x, y, size, color, alpha, speedX, speedY, gravity, disappearDistance) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.alpha = alpha;
            this.speedX = speedX;
            this.speedY = speedY;
            this.gravity = gravity;
            this.disappearDistance = disappearDistance;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity;

            if (this.y >= this.disappearDistance) {
                this.alpha -= 0.01;
            }
        }
    }

    class HeartWithConfettiAnimation {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext("2d");
            this.paused = false;
            this.hearts = [];
            this.confetti = [];
            this.previousTimeStamp = 0;
            this.previousHeartCreationTime = 0;
            this.heartCreationInterval = 800;
            this.canvasWidth = 0;
            this.canvasHeight = 0;

            this.heartPool = [];
            this.confettiPool = [];

            window.addEventListener("resize", () => this.adjustCanvasSize());
            this.adjustCanvasSize();
        }

        adjustCanvasSize() {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = this.canvas.clientWidth * dpr;
            this.canvas.height = this.canvas.clientHeight * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvasWidth = this.canvas.width / dpr;
            this.canvasHeight = this.canvas.height / dpr;
        }

        getRandomColor() {
            let hue, saturation, lightness;
            const range = Math.random();

            if (range < 0.3) {
                hue = Math.random() * 20;
            } else if (range < 0.6) {
                hue = Math.random() * 30 + 180;
            } else {
                hue = Math.random() * 80 + 280;
            }
            saturation = Math.random() * 30 + 70;
            lightness = Math.random() * 20 + 40;

            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }

        createHeart() {
            const x = Math.random() * this.canvasWidth;
            const y = this.canvasHeight + 20;
            const size = Math.random() * 35 + 15;
            const color = this.getRandomColor();
            const alpha = Math.random() * 0.3 + 0.7;
            const speedX = (Math.random() - 0.3) * 1.2;
            const speedY = Math.random() + 0.2;

            let heart;
            if (this.heartPool.length > 0) {
                heart = this.heartPool.pop();
                heart.init(x, y, size, color, alpha, speedX, speedY);
            } else {
                heart = new Heart(x, y, size, color, alpha, speedX, speedY);
            }

            return heart;
        }

        createExplosion(x, y) {
            const numParticles = Math.random() * 50 + 30;

            for (let i = 0; i < numParticles; i++) {
                const size = Math.random() * 6 + 3;
                const color = this.getRandomColor();
                const alpha = Math.random() * 0.3 + 0.7;
                const angle = Math.random() * Math.PI * 2;
                const speedX = Math.cos(angle) * Math.random() * 5;
                const speedY = Math.sin(angle) * Math.random() * 5;
                const gravity = 0.01;
                const disappearDistance = Math.random() * 40 + this.canvasHeight * 0.3 + this.canvasWidth * 0.3;

                let confetto;
                if (this.confettiPool.length > 0) {
                    confetto = this.confettiPool.pop();
                    confetto.init(x, y, size, color, alpha, speedX, speedY, gravity, disappearDistance);
                } else {
                    confetto = new Confetti(x, y, size, color, alpha, speedX, speedY, gravity, disappearDistance);
                }

                this.confetti.push(confetto);
            }
        }

        findCollisions() {
            let visited = new Array(this.hearts.length).fill(false);
            let clusters = [];

            const detectCollision = (heart1, heart2) => {
                const dx = heart1.x - heart2.x;
                const dy = heart1.y - heart2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < (heart1.size + heart2.size) / 2;
            };

            const dfs = (index, cluster) => {
                visited[index] = true;
                cluster.push(index);

                for (let i = 0; i < this.hearts.length; i++) {
                    if (!visited[i] && detectCollision(this.hearts[index], this.hearts[i])) {
                        dfs(i, cluster);
                    }
                }
            };

            for (let i = 0; i < this.hearts.length; i++) {
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
                    this.hearts[index].shouldExplosion = true;
                });
            });
        }

        startAnimation() {
            this.previousTimeStamp = performance.now();
            window.requestAnimationFrame((timestamp) => this.animateHeartWithConfettiLoop(timestamp));
        }

        animateHeartWithConfettiLoop(timestamp) {
            if (this.paused) return;

            const deltaTime = timestamp - this.previousTimeStamp;
            this.previousTimeStamp = timestamp;

            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            if (timestamp - this.previousHeartCreationTime > this.heartCreationInterval) {
                this.hearts.push(this.createHeart());
                this.previousHeartCreationTime = timestamp;
            }

            this.findCollisions();

            this.hearts = this.hearts.filter(heart => {
                heart.update(deltaTime, this.canvasHeight);
                if (!heart.shouldExplosion) {
                    heart.draw(this.ctx);
                    return true;
                } else {
                    this.createExplosion(heart.x, heart.y);
                    this.heartPool.push(heart);
                    return false;
                }
            });

            this.confetti = this.confetti.filter(confetto => {
                confetto.update();
                if (confetto.alpha > 0) {
                    confetto.draw(this.ctx);
                    return true;
                }
                this.confettiPool.push(confetto);
                return false;
            });

            window.requestAnimationFrame((timestamp) => this.animateHeartWithConfettiLoop(timestamp));
        }
    }

    window.HeartWithConfettiAnimation = HeartWithConfettiAnimation;
})();
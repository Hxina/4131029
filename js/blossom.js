(function () {
    class Blossom {
        constructor(x, y, size, speed, wind, rotation, rotationSpeed, petals) {
            this.init(x, y, size, speed, wind, rotation, rotationSpeed, petals);
        }

        init(x, y, size, speed, wind, rotation, rotationSpeed, petals) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.speed = speed;
            this.wind = wind;
            this.rotation = rotation;
            this.rotationSpeed = rotationSpeed;
            this.petals = petals;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            this.petals.forEach(petal => {
                ctx.save();
                ctx.translate(petal.x, petal.y);
                ctx.rotate(petal.angle);
                this.drawPetal(ctx, petal.size, petal.stamens);
                ctx.restore();
            });

            ctx.restore();
        }

        drawPetal(ctx, size, stamens) {
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

        update(deltaTime, canvasHeight, canvasWidth) {
            this.x += this.wind * deltaTime / 16;
            this.y += this.speed * deltaTime / 16;
            this.rotation += this.rotationSpeed * deltaTime / 16;

            return !(this.x < -50 || this.x > canvasWidth + 50 || this.y > canvasHeight);
        }
    }

    class BlossomAnimation {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext("2d");
            this.blossoms = [];
            this.previousTimeStamp = 0;
            this.previousBlossomCreationTime = 0;
            this.blossomCreationInterval = 2000;
            this.canvasWidth = 0;
            this.canvasHeight = 0;

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

        createBlossom() {
            const x = Math.random() * this.canvas.width;
            const y = -20;
            const size = Math.random() * 30 + 10;
            const speed = Math.random() * 0.5 + 0.5;
            const wind = Math.random() - 0.5;
            const rotation = Math.random() * 2 * Math.PI;
            const rotationSpeed = (Math.random() - 0.5) * 0.02;

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

            const blossom = new Blossom(x, y, size, speed, wind, rotation, rotationSpeed, petals);
            this.blossoms.push(blossom);
        }

        startAnimation() {
            this.previousTimeStamp = performance.now();
            window.requestAnimationFrame((timestamp) => this.animateBlossomLoop(timestamp));
        }

        animateBlossomLoop(timestamp) {
            const deltaTime = timestamp - this.previousTimeStamp;
            this.previousTimeStamp = timestamp;

            if (timestamp - this.previousBlossomCreationTime > this.blossomCreationInterval) {
                this.createBlossom();
                this.previousBlossomCreationTime = timestamp;
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.blossoms = this.blossoms.filter(blossom => {
                blossom.draw(this.ctx);
                return blossom.update(deltaTime, this.canvas.height, this.canvas.width);
            });

            window.requestAnimationFrame((timestamp) => this.animateBlossomLoop(timestamp));
        }
    }

    window.BlossomAnimation = BlossomAnimation;
})();
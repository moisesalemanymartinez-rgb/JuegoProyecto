// --- Game: Bike Lane (SDG 11) ---
window.Microgames = window.Microgames || {};

window.Microgames.bikeLane = {
    instruction: "RIDE THE BIKE LANE! (SDG 11)",
    init: (container, onWin, onLose) => {
        let isActive = true;
        let animationId;
        let frameCount = 0;

        // --- Setup Canvas ---
        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.background = '#3a3'; // Grass Green base
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Layout
        const roadWidth = canvas.width * 0.7;
        const laneWidth = roadWidth / 3;
        const roadX = (canvas.width - roadWidth) / 2;

        // --- Game State ---
        let playerLane = 1; // 0, 1, 2 (Logical)
        let playerLaneVisual = 1; // 0.0 - 2.0 (Visual interpolation)
        let cars = [];
        let scenery = []; // Trees/Lights
        let windParticles = [];
        let roadOffset = 0;
        const speed = 5 + (Game.state.difficulty * 2);

        // --- Assets Generation (Patterns) ---
        // Asphalt Noise Pattern (Smoother/Less Contrast)
        const asphaltCanvas = document.createElement('canvas');
        asphaltCanvas.width = 128; // Larger pattern to reduce flicker
        asphaltCanvas.height = 128;
        const actx = asphaltCanvas.getContext('2d');
        actx.fillStyle = '#555';
        actx.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 300; i++) {
            // Lower contrast: #5a5a5a vs #505050 instead of #666 vs #444
            actx.fillStyle = Math.random() > 0.5 ? '#5a5a5a' : '#505050';
            actx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
        }
        const asphaltPattern = ctx.createPattern(asphaltCanvas, 'repeat');

        // --- Input Handling ---
        const handleInput = (e) => {
            if (!isActive) return;
            if (e.key === 'ArrowLeft') {
                playerLane = Math.max(0, playerLane - 1);
            } else if (e.key === 'ArrowRight') {
                playerLane = Math.min(2, playerLane + 1);
            }
        };

        const handleTouch = (e) => {
            if (!isActive) return;
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;

            if (x < canvas.width / 2) {
                playerLane = Math.max(0, playerLane - 1);
            } else {
                playerLane = Math.min(2, playerLane + 1);
            }
        };

        window.addEventListener('keydown', handleInput);
        canvas.addEventListener('mousedown', handleTouch);
        canvas.addEventListener('touchstart', handleTouch);

        // --- Win Condition (Survival) ---
        const timeAvailable = Math.max(3000, Game.config.baseTime / Game.state.difficulty);
        const survivalTime = timeAvailable - 200;
        let winTimeout = setTimeout(() => {
            if (isActive) {
                isActive = false;
                onWin();
            }
        }, survivalTime);

        // --- Entities ---
        class Car {
            constructor() {
                this.lane = Math.floor(Math.random() * 3);
                this.y = -150;
                this.width = laneWidth * 0.55;
                this.height = 90;
                this.color = Math.random() > 0.5 ? '#d00' : '#0066cc';
                this.speed = speed * (0.9 + Math.random() * 0.3);
            }
            update() { this.y += this.speed; }
            draw() {
                const x = roadX + (this.lane * laneWidth) + (laneWidth - this.width) / 2;
                const r = 5;
                ctx.save();
                ctx.translate(x, this.y);

                // Drop Shadow
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 10;

                // Body
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.roundRect(0, 0, this.width, this.height, r);
                ctx.fill();

                // Reset shadow for details
                ctx.shadowColor = 'transparent';

                // Windshield
                ctx.fillStyle = '#111';
                ctx.beginPath();
                ctx.moveTo(5, 60); ctx.lineTo(this.width - 5, 60);
                ctx.lineTo(this.width - 8, 45); ctx.lineTo(8, 45);
                ctx.fill();

                // Roof
                ctx.fillStyle = 'rgba(0,0,0,0.2)'; // Darker tint of body color essentially
                ctx.fillRect(8, 25, this.width - 16, 25);

                // Rear Window
                ctx.fillStyle = '#111';
                ctx.beginPath();
                ctx.moveTo(8, 25); ctx.lineTo(this.width - 8, 25);
                ctx.lineTo(this.width - 5, 15); ctx.lineTo(5, 15);
                ctx.fill();

                // Headlights
                ctx.fillStyle = '#ffeb3b';
                ctx.beginPath();
                ctx.ellipse(8, this.height - 2, 4, 2, 0, 0, Math.PI * 2);
                ctx.ellipse(this.width - 8, this.height - 2, 4, 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Beams
                ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
                ctx.beginPath();
                ctx.moveTo(5, this.height); ctx.lineTo(-10, this.height + 80); ctx.lineTo(15, this.height + 80); ctx.lineTo(11, this.height);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(this.width - 5, this.height); ctx.lineTo(this.width + 10, this.height + 80); ctx.lineTo(this.width - 15, this.height + 80); ctx.lineTo(this.width - 11, this.height);
                ctx.fill();

                ctx.restore();
            }
        }

        class Prop {
            constructor(side) { // -1 left, 1 right
                this.side = side;
                this.y = -100;
                this.type = Math.random() > 0.7 ? 'tree' : 'light';
                // Move them further out to reduce peripheral motion sickness
                this.x = side === -1 ? (roadX - 60 - Math.random() * 20) : (roadX + roadWidth + 60 + Math.random() * 20);
            }
            update() { this.y += speed; } // Move at same speed as road, consistent
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                if (this.type === 'tree') {
                    // Tree Shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.beginPath(); ctx.ellipse(5, 5, 20, 10, 0, 0, Math.PI * 2); ctx.fill();
                    // Trunk
                    ctx.fillStyle = '#643';
                    ctx.fillRect(-5, 0, 10, -20);
                    // Foliage
                    ctx.fillStyle = '#262';
                    ctx.beginPath(); ctx.arc(0, -30, 20, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#383';
                    ctx.beginPath(); ctx.arc(-5, -35, 15, 0, Math.PI * 2); ctx.fill();
                } else {
                    // Streetlight post
                    ctx.fillStyle = '#444';
                    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
                    // Shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.fillRect(0, 0, 2, 30); // shadow cast
                }
                ctx.restore();
            }
        }

        class Wind {
            constructor() {
                this.x = roadX + Math.random() * roadWidth;
                this.y = -50;
                this.len = 20 + Math.random() * 40;
                this.speed = speed * 1.5;
            }
            update() { this.y += this.speed; }
            draw() {
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y - this.len);
                ctx.stroke();
            }
        }

        // --- Render Loop ---
        function animate() {
            if (!isActive) return;

            // 0. Update Visual State (Lerp)
            // Move visual position 20% of the way to the target position each frame
            playerLaneVisual += (playerLane - playerLaneVisual) * 0.2;

            // Snap if very close to avoid micro-jitters
            if (Math.abs(playerLane - playerLaneVisual) < 0.01) playerLaneVisual = playerLane;


            // 1. Grass Background
            ctx.fillStyle = '#3a3';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Road Body
            ctx.fillStyle = asphaltPattern;
            ctx.fillRect(roadX, 0, roadWidth, canvas.height);

            // Sidewalks
            ctx.fillStyle = '#ccc';
            ctx.fillRect(roadX - 15, 0, 15, canvas.height); // Left
            ctx.fillRect(roadX + roadWidth, 0, 15, canvas.height); // Right
            ctx.strokeStyle = '#aaa';
            ctx.beginPath(); // Kerb lines
            ctx.moveTo(roadX - 15, 0); ctx.lineTo(roadX - 15, canvas.height);
            ctx.moveTo(roadX + roadWidth + 15, 0); ctx.lineTo(roadX + roadWidth + 15, canvas.height);
            ctx.stroke();

            // Bike Lane Marking (Right Lane = Green)
            ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';
            ctx.fillRect(roadX + laneWidth * 2, 0, laneWidth, canvas.height);
            // Bike icon on road?
            if (frameCount % 60 < 30) {
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '30px Arial';
                ctx.fillText("🚲", roadX + laneWidth * 2 + laneWidth / 2 - 15, (roadOffset + 200) % canvas.height);
            }

            // Lane Dividers (Wider spacing/longer dash to reduce flicker speed)
            ctx.strokeStyle = '#fff';
            ctx.setLineDash([40, 60]); // Longer dash, more space
            ctx.lineWidth = 4;
            ctx.lineDashOffset = -roadOffset;

            ctx.beginPath();
            ctx.moveTo(roadX + laneWidth, 0); ctx.lineTo(roadX + laneWidth, canvas.height);
            ctx.moveTo(roadX + laneWidth * 2, 0); ctx.lineTo(roadX + laneWidth * 2, canvas.height);
            ctx.stroke();

            roadOffset = (roadOffset + speed) % 100; // Adjusted for new dash pattern

            // 3. Update & Draw Scenery (Under Player)
            // Reduced spawn rate to avoid "crowded" scrolling
            if (frameCount % 20 === 0) {
                if (Math.random() > 0.5) scenery.push(new Prop(-1));
                if (Math.random() > 0.5) scenery.push(new Prop(1));
            }
            for (let i = scenery.length - 1; i >= 0; i--) {
                const s = scenery[i];
                s.update();
                s.draw();
                if (s.y > canvas.height + 50) scenery.splice(i, 1);
            }

            // 4. Player (Cyclist)
            const px = roadX + (playerLaneVisual * laneWidth) + (laneWidth / 2);
            const py = canvas.height - 120;
            drawCyclist(ctx, px, py);

            // 5. Cars
            if (frameCount % 50 === 0) {
                cars.push(new Car());
            }
            for (let i = cars.length - 1; i >= 0; i--) {
                const c = cars[i];
                c.update();
                c.draw();

                // Collision Detection (Use Visual Box for Fairness if moving? Or Logical?)
                // Use Logical for consistency, but maybe Visual is better if we want "dodge at last second"?
                // Let's stick to simple "Lane Match" logical collision for now, as it's cleaner.
                // BUT, if visual is sliding, user might think they are safe.
                // Let's check proximity on X axis instead of exact lane match for collision.

                const carX = roadX + (c.lane * laneWidth) + (laneWidth - c.width) / 2;
                // Simple AABB
                if (px + 10 > carX && px - 10 < carX + c.width &&
                    py + 20 > c.y && py - 60 < c.y + c.height) {
                    isActive = false;
                    onLose();
                    return;
                }

                if (c.y > canvas.height) cars.splice(i, 1);
            }

            // 6. Wind Effect (Over Player)
            if (frameCount % 5 === 0) windParticles.push(new Wind());
            for (let i = windParticles.length - 1; i >= 0; i--) {
                const w = windParticles[i];
                w.update();
                w.draw();
                if (w.y > canvas.height) windParticles.splice(i, 1);
            }

            frameCount++;
            animationId = requestAnimationFrame(animate);
        }

        // --- Helper: Draw Cyclist (Rear View) ---
        function drawCyclist(ctx, x, y) {
            ctx.save();
            ctx.translate(x, y);

            // Cast Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 10, 15, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Rear Wheel
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(0, 0, 4, 15, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Frame stays
            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-4, 0); ctx.lineTo(0, -25);
            ctx.moveTo(4, 0); ctx.lineTo(0, -25);
            ctx.stroke();

            // Seat
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.moveTo(-8, -25); ctx.lineTo(8, -25);
            ctx.lineTo(5, -20); ctx.lineTo(-5, -20);
            ctx.fill();

            // Body
            ctx.fillStyle = '#d00';
            ctx.fillRect(-10, -55, 20, 30);

            // Head (bobbing slightly)
            const bob = Math.sin(frameCount * 0.1) * 2;
            ctx.fillStyle = '#fb0';
            ctx.beginPath();
            ctx.arc(0, -65 + bob, 8, 0, Math.PI * 2);
            ctx.fill();

            // Arms
            ctx.strokeStyle = '#d00';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-10, -50 + bob); ctx.lineTo(-20, -35); // Elbow?
            ctx.moveTo(10, -50 + bob); ctx.lineTo(20, -35);
            ctx.stroke();

            // Legs
            const pedal = Math.sin(frameCount * 0.3) * 6;
            ctx.strokeStyle = '#00f';
            ctx.lineWidth = 5;
            // Left
            ctx.beginPath();
            ctx.moveTo(-6, -25); ctx.lineTo(-10, -10 - pedal); ctx.lineTo(-8, 5 - pedal);
            ctx.stroke();
            // Right
            ctx.beginPath();
            ctx.moveTo(6, -25); ctx.lineTo(10, -10 + pedal); ctx.lineTo(8, 5 + pedal);
            ctx.stroke();

            ctx.restore();
        }

        animate();

        // Cleanup
        this._cleanup = () => {
            isActive = false;
            clearTimeout(winTimeout);
            window.removeEventListener('keydown', handleInput);
            canvas.removeEventListener('mousedown', handleTouch);
            canvas.removeEventListener('touchstart', handleTouch);
            cancelAnimationFrame(animationId);
        };
    },
    cleanup: () => {
        if (window.Microgames.bikeLane._cleanup) {
            window.Microgames.bikeLane._cleanup();
        }
        const container = document.getElementById('game-area');
        if (container) container.innerHTML = '';
    }
};

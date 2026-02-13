// --- Microgames (SDG 3 Edition - Good Health and Wellbeing) ---
window.Microgames = window.Microgames || {};

window.Microgames.heartBeat = {
    instruction: "SURVIVE THE BEAT!",
    survive: true, // Survive until timer ends to win
    init: (container, onWin, onLose) => {
        let isGameOver = false;
        let isHolding = false;

        // Visual Setup
        container.style.background = "#4a2c0a"; // Base color
        container.style.position = 'relative';
        container.style.overflow = 'hidden';

        // Background Grid Effect
        const gridBg = document.createElement('div');
        gridBg.style.position = 'absolute';
        gridBg.style.width = '200%';
        gridBg.style.height = '100%';
        gridBg.style.backgroundImage = `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
        `;
        gridBg.style.backgroundSize = '40px 40px';
        gridBg.style.top = '0';
        gridBg.style.left = '0';
        gridBg.style.pointerEvents = 'none';
        container.appendChild(gridBg);

        const animateBg = gridBg.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-40px)' }
        ], {
            duration: 1000,
            iterations: Infinity,
            easing: 'linear'
        });

        // Pixel Heart (SVG based for perfection)
        const heartContainer = document.createElement('div');
        heartContainer.style.position = 'absolute';
        heartContainer.style.width = '40px';
        heartContainer.style.height = '40px';
        heartContainer.style.left = '50px';
        heartContainer.style.top = '50%';
        heartContainer.style.transform = 'translateY(-50%)';
        heartContainer.style.zIndex = '10';

        heartContainer.innerHTML = `
            <svg viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
                <path fill="#ff0000" d="M3 1h2v1h2v1h2V2h2V1h2v1h1v1h1v5h-1v1h-1v1h-1v1h-1v1h-1v1h-2v-1H6v-1H5v-1H4v-1H3v-1H2v-5h1V2h1V1z" />
            </svg>
        `;
        container.appendChild(heartContainer);
        const heart = heartContainer; // Alias for logic

        // Physics State
        let heartY = container.clientHeight / 2;
        let velocityY = 0;
        const gravity = 0.8;    // Stronger gravity (was 0.35)
        const lift = -1.6;       // Stronger lift (was -0.7)
        const friction = 0.92;  // Added friction to reduce inertia
        const maxVelocity = 8;  // Cap speed
        const speed = 8;        // Horizontal speed

        // Obstacles Layer
        const obstacles = [];
        let obstacleTimer = 0;

        // Trail / Trail Effect
        const trailCanvas = document.createElement('canvas');
        trailCanvas.width = container.clientWidth;
        trailCanvas.height = container.clientHeight;
        trailCanvas.style.position = 'absolute';
        trailCanvas.style.top = '0';
        trailCanvas.style.left = '0';
        container.appendChild(trailCanvas);
        const ctx = trailCanvas.getContext('2d');
        let trailPoints = [];

        // Input Listeners
        const startHold = (e) => { e.preventDefault(); isHolding = true; };
        const endHold = () => { isHolding = false; };

        container.addEventListener('mousedown', startHold);
        container.addEventListener('touchstart', startHold);
        window.addEventListener('mouseup', endHold);
        window.addEventListener('touchend', endHold);

        // Game Loop
        let lastTime = 0;
        const loop = (time) => {
            if (isGameOver) return;
            if (!lastTime) lastTime = time;
            const dt = (time - lastTime) / 16;
            lastTime = time;

            // Physics with Friction and Clamping
            if (isHolding) {
                velocityY += lift;
            } else {
                velocityY += gravity;
            }
            velocityY *= friction;
            velocityY = Math.max(-maxVelocity, Math.min(maxVelocity, velocityY));
            heartY += velocityY;

            // Strict Boundary Clamp
            const heartSize = 40;
            if (heartY < 0) {
                heartY = 0;
                velocityY = 0;
            } else if (heartY > container.clientHeight - heartSize) {
                heartY = container.clientHeight - heartSize;
                velocityY = 0;
            }

            heart.style.top = heartY + 'px';

            // Trail
            trailPoints.push({ x: 50 + 20, y: heartY + 20 });
            if (trailPoints.length > 50) trailPoints.shift();

            ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
            ctx.beginPath();
            ctx.strokeStyle = '#ffff00'; // Yellow neon line
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            for (let i = 0; i < trailPoints.length; i++) {
                const p = trailPoints[i];
                // Move trail backwards to simulate movement
                p.x -= speed;
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            // Obstacles Generation
            obstacleTimer++;
            // Increased spawn rate: 25 frames instead of 40
            if (obstacleTimer > 25 / (Game.state.difficulty || 1)) {
                obstacleTimer = 0;
                createObstacle();
            }

            // Move & Check Collision
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.x -= speed * (Game.state.difficulty || 1);
                obs.el.style.left = obs.x + 'px';

                // Simple collision
                const hRect = heart.getBoundingClientRect();
                const oRect = obs.el.getBoundingClientRect();

                if (hRect.left < oRect.right &&
                    hRect.right > oRect.left &&
                    hRect.top < oRect.bottom &&
                    hRect.bottom > oRect.top) {
                    gameOver();
                    return;
                }

                if (obs.x < -100) {
                    obs.el.remove();
                    obstacles.splice(i, 1);
                }
            }

            requestAnimationFrame(loop);
        };

        const createObstacle = () => {
            const r = Math.random();
            const isTop = r > 0.7;
            const isBottom = r < 0.3;
            const isMiddle = !isTop && !isBottom;

            // Variety of sizes
            const width = Math.floor(Math.random() * 60) + 60;
            const height = Math.floor(Math.random() * 100) + 90;
            const el = document.createElement('div');
            el.className = 'gd-block';
            el.style.position = 'absolute';
            el.style.width = width + 'px';
            el.style.height = height + 'px';

            // Neon Colors
            const neonColors = ['#00f2ff', '#00ff9d', '#ff0055', '#ffff00', '#ff00ff'];
            const color = neonColors[Math.floor(Math.random() * neonColors.length)];

            // Premium Styling (Geometry Dash like)
            el.style.background = '#000';
            el.style.border = `3px solid ${color}`;
            el.style.boxShadow = `0 0 20px ${color}, inset 0 0 15px ${color}`;
            el.style.left = container.clientWidth + 'px';
            el.style.zIndex = '5';

            // Internal Details
            const details = document.createElement('div');
            details.style.position = 'absolute';
            details.style.top = '5px';
            details.style.left = '5px';
            details.style.right = '5px';
            details.style.bottom = '5px';
            details.style.display = 'grid';
            details.style.gridTemplateColumns = 'repeat(2, 1fr)';
            details.style.gridTemplateRows = 'repeat(3, 1fr)';
            details.style.gap = '4px';

            for (let i = 0; i < 6; i++) {
                const dot = document.createElement('div');
                dot.style.background = `${color}44`;
                dot.style.border = `1px solid ${color}88`;
                details.appendChild(dot);
            }
            el.appendChild(details);

            if (isTop) {
                el.style.top = '0';
                el.style.clipPath = 'polygon(0 0, 100% 0, 85% 85%, 50% 100%, 15% 85%)';
            } else if (isBottom) {
                el.style.bottom = '0';
                el.style.clipPath = 'polygon(50% 0%, 85% 15%, 100% 100%, 0% 100%, 15% 15%)';
            } else {
                const midY = Math.random() * (container.clientHeight - height);
                el.style.top = midY + 'px';
                if (Math.random() > 0.5) {
                    el.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'; // Diamond
                } else {
                    el.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; // Star
                }
            }

            container.appendChild(el);
            obstacles.push({ el, x: container.clientWidth });
        };

        const gameOver = () => {
            if (isGameOver) return;
            isGameOver = true;
            // Broken heart effect
            heart.querySelector('path').setAttribute('fill', '#555');
            onLose();
        };

        requestAnimationFrame(loop);

        window.Microgames.heartBeat.cleanupFunc = () => {
            isGameOver = true;
            container.removeEventListener('mousedown', startHold);
            container.removeEventListener('touchstart', startHold);
            window.removeEventListener('mouseup', endHold);
            window.removeEventListener('touchend', endHold);
        };
    },
    cleanup: () => {
        if (window.Microgames.heartBeat.cleanupFunc) window.Microgames.heartBeat.cleanupFunc();
    }
};

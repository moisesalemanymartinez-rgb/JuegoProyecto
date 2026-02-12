// --- Microgames (SDG Edition) ---
window.Microgames = window.Microgames || {};

window.Microgames.smogHunt = {
    instruction: "SHOOT THE SMOG! (SDG 13)",
    init: (container, onWin, onLose) => {
        let score = 0;
        const targetScore = 5; // Increased target for more fun
        let isActive = true;

        // --- Visual Setup (Canvas Background) ---
        // We replace the CSS background with a high-quality Canvas render
        container.style.background = "#000";
        container.style.cursor = "crosshair";

        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '0'; // Behind everything
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Draw City Scene
        const drawCity = () => {
            const w = canvas.width;
            const h = canvas.height;

            // 1. Photorealistic Sky Gradient
            const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, '#050a15'); // Midnight Blue
            skyGrad.addColorStop(0.4, '#1a1826'); // Dark smoggy purple
            skyGrad.addColorStop(1, '#504030'); // Pollution Brown Horizon
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, h);

            // 2. Far Background Layer (Silhouettes)
            ctx.fillStyle = '#0d0d10';
            let bx = 0;
            while (bx < w) {
                const bw = 20 + Math.random() * 40;
                const bh = 50 + Math.random() * 100;
                ctx.fillRect(bx, h - bh, bw + 1, bh);
                bx += bw - 2;
            }

            // 3. Foreground Realistic Skyscrapers (3D Perspective)
            let fx = 20;
            while (fx < w - 40) {
                const fw = 60 + Math.random() * 50;
                const fh = 180 + Math.random() * 250;

                // Draw with 3D effect
                drawRealisticBuilding(ctx, fx, h, fw, fh);

                fx += fw + 10 + Math.random() * 20; // Varied gaps
            }

            // 4. Heavy Smog Overlay
            const haze = ctx.createLinearGradient(0, h - 300, 0, h);
            haze.addColorStop(0, 'rgba(80, 60, 40, 0)');
            haze.addColorStop(1, 'rgba(80, 60, 40, 0.6)');
            ctx.fillStyle = haze;
            ctx.fillRect(0, 0, w, h);
        };

        const drawRealisticBuilding = (ctx, x, groundY, width, height) => {
            const y = groundY - height;
            const depth = 15; // 3D side depth

            // --- 1. Side Face (Depth) ---
            // Draw this first so it's behind the front face
            ctx.fillStyle = '#111'; // Very dark side
            ctx.beginPath();
            ctx.moveTo(x + width, y);
            ctx.lineTo(x + width + depth, y - 10); // Perspective angle up
            ctx.lineTo(x + width + depth, groundY);
            ctx.lineTo(x + width, groundY);
            ctx.fill();

            // --- 2. Front Face (Main) ---
            const bldGrad = ctx.createLinearGradient(x, y, x + width, groundY);
            const hue = 210 + Math.random() * 20; // Cool blues
            bldGrad.addColorStop(0, `hsla(${hue}, 20%, 30%, 1)`); // Top (Lighter)
            bldGrad.addColorStop(1, `hsla(${hue}, 30%, 10%, 1)`); // Bottom (Shadow)

            ctx.fillStyle = bldGrad;
            ctx.fillRect(x, y, width, height);

            // --- 3. Texture (Noise) ---
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for (let i = 0; i < 50; i++) {
                ctx.fillRect(
                    x + Math.random() * width,
                    y + Math.random() * height,
                    2, 2
                );
            }

            // --- 4. Windows (Office Lights) ---
            const rows = Math.floor(height / 8);
            const cols = Math.floor(width / 6);
            const gapX = 2;
            const gapY = 4;

            ctx.fillStyle = '#ffdb8b'; // Warm office light

            // Randomly light up clusters
            for (let r = 2; r < rows - 1; r++) {
                if (Math.random() > 0.7) continue; // Skip some rows (dark floors)

                for (let c = 1; c < cols - 1; c++) {
                    if (Math.random() > 0.3) { // 70% lit in active rows
                        // Variance in window opacity for realism
                        ctx.globalAlpha = 0.3 + Math.random() * 0.7;
                        ctx.fillRect(
                            x + c * (4 + gapX),
                            y + r * (4 + gapY),
                            3, 4
                        );
                    }
                }
            }
            ctx.globalAlpha = 1.0;

            // --- 5. Roof / Spire ---
            ctx.fillStyle = '#080808';
            if (Math.random() > 0.5) {
                // Antenna
                ctx.fillRect(x + width / 2 - 1, y - 40, 2, 40);
                // Red warning light
                ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
                ctx.beginPath();
                ctx.arc(x + width / 2, y - 40, 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // BOX bevel
                ctx.fillRect(x + 5, y - 10, width - 10, 10);
            }

            // Edge Highlight
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, height);
        };

        drawCity();

        // --- Interaction Effects ---

        const flashDiv = document.createElement('div');
        flashDiv.className = 'muzzle-flash';
        flashDiv.style.opacity = 0;
        container.appendChild(flashDiv);

        const shootEffect = () => {
            const consoleContainer = document.getElementById('console-container');
            consoleContainer.classList.remove('shake');
            void consoleContainer.offsetWidth; // trigger reflow
            consoleContainer.classList.add('shake');

            flashDiv.style.opacity = 0.6;
            setTimeout(() => flashDiv.style.opacity = 0, 50);
        };

        const spawnParticles = (x, y) => {
            for (let i = 0; i < 8; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.left = x + 'px';
                p.style.top = y + 'px';
                p.style.background = Math.random() > 0.5 ? '#555' : '#888'; // Grey smoke parts
                container.appendChild(p);

                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 5;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;

                p.animate([
                    { transform: 'translate(0,0) scale(1)', opacity: 1 },
                    { transform: `translate(${vx * 20}px, ${vy * 20}px) scale(0)`, opacity: 0 }
                ], { duration: 500, easing: 'ease-out' }).onfinish = () => p.remove();
            }
        };

        // --- Gameplay Logic (Clouds) ---

        const spawnCloud = () => {
            if (!isActive || score >= targetScore) return;

            const cloud = document.createElement('div');
            cloud.innerText = '☁️';
            cloud.className = 'smog-cloud';
            // Scale cloud bigger
            cloud.style.fontSize = (40 + Math.random() * 30) + 'px';
            cloud.style.filter = 'grayscale(100%) brightness(50%)'; // Dark dirty clouds

            // Random start position
            const fromLeft = Math.random() > 0.5;
            const startX = fromLeft ? -100 : container.clientWidth;
            const endX = fromLeft ? container.clientWidth : -100;
            // Higher up in sky
            const y = Math.random() * (container.clientHeight * 0.4);

            cloud.style.left = startX + 'px';
            cloud.style.top = y + 'px';

            container.appendChild(cloud);

            const duration = (3000 + Math.random() * 2000) / Game.state.difficulty; // Slower, heavier
            const anim = cloud.animate([
                { left: startX + 'px' },
                { left: endX + 'px' }
            ], {
                duration: duration,
                easing: 'linear'
            });

            anim.onfinish = () => {
                cloud.remove();
                if (isActive && score < targetScore) {
                    spawnCloud();
                }
            };

            cloud.onmousedown = (e) => {
                e.preventDefault();
                e.stopPropagation(); // Stop bg click

                shootEffect();
                const rect = container.getBoundingClientRect();
                spawnParticles(e.clientX - rect.left, e.clientY - rect.top);

                score++;
                cloud.style.pointerEvents = 'none';

                // Explode animation
                cloud.animate([
                    { transform: 'scale(1)', opacity: 1 },
                    { transform: 'scale(1.5)', opacity: 0 }
                ], { duration: 100, fill: 'forwards' });

                setTimeout(() => cloud.remove(), 100);

                if (score >= targetScore) {
                    isActive = false;
                    onWin();
                } else {
                    spawnCloud();
                    if (Math.random() > 0.5) spawnCloud(); // Occasionally spawn double
                }
            };
        };

        // Background click (miss)
        container.onmousedown = (e) => {
            if (e.target === container || e.target === canvas) {
                shootEffect();
            }
        };

        // Initial spawn
        for (let i = 0; i < 3; i++) setTimeout(spawnCloud, i * 500);

        // Cleanup closure
        this._cleanup = () => {
            isActive = false;
            container.innerHTML = ''; // Clear everything (canvas, clouds)
            container.style.background = "";
            container.style.cursor = "";
            container.onmousedown = null;
        };

    },
    cleanup: () => {
        if (window.Microgames.smogHunt._cleanup) {
            window.Microgames.smogHunt._cleanup();
        }
    }
};

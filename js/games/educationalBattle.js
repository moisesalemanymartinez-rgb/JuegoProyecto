// --- Microgames (SDG 4 Edition - Quality Education) ---
window.Microgames = window.Microgames || {};

window.Microgames.educationalBattle = {
    instruction: "DODGE THE FAILURES!",
    survive: true, // Survive until timer ends to win
    init: (container, onWin, onLose) => {
        let isGameOver = false;
        let animationId = null;

        // --- Visual Setup ---
        container.style.background = "#000"; // Classic Undertale black
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';

        // Battle Box
        const battleBox = document.createElement('div');
        battleBox.style.position = 'absolute';
        battleBox.style.width = '200px';
        battleBox.style.height = '200px';
        battleBox.style.border = '4px solid white';
        battleBox.style.background = 'black';
        battleBox.style.boxSizing = 'border-box';
        battleBox.style.overflow = 'hidden';
        container.appendChild(battleBox);

        // Player (Heart)
        const player = document.createElement('div');
        player.style.position = 'absolute';
        player.style.width = '16px';
        player.style.height = '16px';
        // Simple red heart using SVG or CSS. Let's use a simple character or red square for hitbox precision
        // but visually look like a heart.
        player.innerHTML = `
            <svg viewBox="0 0 16 16" width="100%" height="100%">
                <path fill="#ff0000" d="M3 1h2v1h2v1h2V2h2V1h2v1h1v1h1v5h-1v1h-1v1h-1v1h-1v1h-1v1h-2v-1H6v-1H5v-1H4v-1H3v-1H2v-5h1V2h1V1z" />
            </svg>
        `;
        player.style.left = '90px'; // Center of 200px box (approx)
        player.style.top = '90px';
        player.style.zIndex = '10';
        battleBox.appendChild(player);

        // --- Game State ---
        let playerX = 90;
        let playerY = 90;
        const speed = 3;
        const boxSize = 200;
        const playerSize = 16;
        const keys = {};

        // Obstacles
        const obstacles = [];
        let frameCount = 0;

        // --- Input Handling ---
        const handleDown = (e) => { keys[e.key] = true; };
        const handleUp = (e) => { keys[e.key] = false; };

        // Mouse/Touch Handling for "Follow" mode (Accessibility/Mobile)
        // Since it's a small box, relative movement might be better, but absolute follow is easier for touch.
        const battleBoxRect = battleBox.getBoundingClientRect();

        const updateTouch = (clientX, clientY) => {
            const rect = battleBox.getBoundingClientRect();
            let x = clientX - rect.left - (playerSize / 2);
            let y = clientY - rect.top - (playerSize / 2);

            // Clamp
            x = Math.max(0, Math.min(boxSize - playerSize, x));
            y = Math.max(0, Math.min(boxSize - playerSize, y));

            playerX = x;
            playerY = y;
        };

        const handleTouch = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            updateTouch(touch.clientX, touch.clientY);
        };

        const handleMouse = (e) => {
            if (e.buttons > 0) { // Only if clicked
                updateTouch(e.clientX, e.clientY);
            }
        };

        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        battleBox.addEventListener('touchmove', handleTouch, { passive: false });
        battleBox.addEventListener('mousemove', handleMouse);
        battleBox.addEventListener('mousedown', (e) => updateTouch(e.clientX, e.clientY));


        // --- Helper Functions ---
        const createObstacle = (type) => {
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.background = 'white';
            el.style.color = 'black';
            el.style.display = 'flex';
            el.style.justifyContent = 'center';
            el.style.alignItems = 'center';
            el.style.fontWeight = 'bold';
            el.style.fontFamily = 'monospace';

            let obs = { el, type, title: 'obs' };

            if (type === 'book') {
                // Horizontal projectile
                obs.width = 30;
                obs.height = 20;
                obs.y = Math.random() * (boxSize - 20);
                obs.x = boxSize;
                obs.vx = -3.5; // Slightly slower
                obs.vy = 0;
                el.innerText = "BOOK";
                el.style.fontSize = "8px";
                el.style.border = "1px solid white";
            } else if (type === 'ruler') {
                // Vertical falling
                obs.width = 10;
                obs.height = 60;
                obs.x = Math.random() * (boxSize - 10);
                obs.y = -60;
                obs.vx = 0;
                obs.vy = 4; // Slightly slower
                el.style.background = 'white';
                // Markings
                el.style.backgroundImage = "linear-gradient(black 1px, transparent 1px)";
                el.style.backgroundSize = "100% 10px";
            } else if (type === 'grade') {
                // Bouncing F
                obs.width = 20;
                obs.height = 20;
                obs.x = Math.random() * (boxSize - 20);
                obs.y = -20;
                obs.vx = (Math.random() - 0.5) * 4;
                obs.vy = 3;
                el.innerText = "F";
                el.style.fontSize = "16px";
                el.style.background = 'transparent';
                el.style.color = 'red';
            }

            el.style.width = obs.width + 'px';
            el.style.height = obs.height + 'px';
            el.style.left = obs.x + 'px';
            el.style.top = obs.y + 'px';

            battleBox.appendChild(el);
            obstacles.push(obs);
        };

        // --- Game Loop ---
        const loop = () => {
            if (isGameOver) return;

            // 1. Player Movement (Keyboard)
            if (keys['ArrowUp'] || keys['w']) playerY -= speed;
            if (keys['ArrowDown'] || keys['s']) playerY += speed;
            if (keys['ArrowLeft'] || keys['a']) playerX -= speed;
            if (keys['ArrowRight'] || keys['d']) playerX += speed;

            // Clamp Player
            playerX = Math.max(4, Math.min(boxSize - playerSize - 4, playerX));
            playerY = Math.max(4, Math.min(boxSize - playerSize - 4, playerY));

            player.style.left = playerX + 'px';
            player.style.top = playerY + 'px';

            // 2. Obstacle Spawning
            frameCount++;
            if (frameCount % 40 === 0) { // Every ~0.66s (Slightly easier)
                const r = Math.random();
                if (r < 0.33) createObstacle('book');
                else if (r < 0.66) createObstacle('ruler');
                else createObstacle('grade');
            }

            // 3. Update Obstacles & Collision
            const playerRect = { x: playerX + 2, y: playerY + 2, w: playerSize - 4, h: playerSize - 4 }; // Smaller hitbox

            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.x += obs.vx;
                obs.y += obs.vy;

                // Bounce logic for 'grade'
                if (obs.type === 'grade') {
                    if (obs.x <= 0 || obs.x >= boxSize - obs.width) obs.vx *= -1;
                    // Only bounce Y if it's inside (simple gravity maybe later, just linear for now)
                }

                obs.el.style.left = obs.x + 'px';
                obs.el.style.top = obs.y + 'px';

                // Cleanup if out of bounds
                if (obs.x < -50 || obs.x > boxSize + 50 || obs.y < -70 || obs.y > boxSize + 50) {
                    obs.el.remove();
                    obstacles.splice(i, 1);
                    continue;
                }

                // Collision
                // Simple AABB
                if (playerRect.x < obs.x + obs.width &&
                    playerRect.x + playerRect.w > obs.x &&
                    playerRect.y < obs.y + obs.height &&
                    playerRect.y + playerRect.h > obs.y) {

                    gameOver();
                    return;
                }
            }

            animationId = requestAnimationFrame(loop);
        };

        const gameOver = () => {
            if (isGameOver) return;
            isGameOver = true;
            cancelAnimationFrame(animationId);
            // Shatter effect?
            player.style.opacity = '0.5';
            onLose();
        };

        // Start
        animationId = requestAnimationFrame(loop);

        // --- Cleanup Hook ---
        window.Microgames.educationalBattle.cleanupFunc = () => {
            isGameOver = true;
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
            // Mouse listeners on battleBox are removed when battleBox is removed from DOM by engine
        };
    },
    cleanup: () => {
        if (window.Microgames.educationalBattle.cleanupFunc) {
            window.Microgames.educationalBattle.cleanupFunc();
        }
    }
};

// --- Microgames (SDG Edition - Isolated) ---
window.Microgames = window.Microgames || {};
window.Microgames.smogHunt = {
    instruction: "SHOOT THE SMOG! (SDG 13)",
    init: (container, onWin, onLose) => {
        let score = 0;
        const targetScore = 3;

        // Visual Setup
        container.style.background = "linear-gradient(#444 0%, #87CEEB 100%)"; // Polluted sky gradient
        container.style.cursor = "crosshair";

        // Add city background
        const city = document.createElement('div');
        city.className = 'city-bg';
        container.appendChild(city);

        const flashDiv = document.createElement('div');
        flashDiv.className = 'muzzle-flash';
        flashDiv.style.opacity = 0;
        container.appendChild(flashDiv);

        // Shoot Effect
        const shootEffect = () => {
            // Screen Shake
            const consoleContainer = document.getElementById('console-container');
            consoleContainer.classList.remove('shake');
            void consoleContainer.offsetWidth; // trigger reflow
            consoleContainer.classList.add('shake');

            // Muzzle Flash
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

        const spawnCloud = () => {
            if (score >= targetScore) return;

            const cloud = document.createElement('div');
            cloud.innerText = '☁️';
            cloud.className = 'smog-cloud';

            // Random start position
            const fromLeft = Math.random() > 0.5;
            const startX = fromLeft ? -100 : container.clientWidth;
            const endX = fromLeft ? container.clientWidth : -100;
            const y = Math.random() * (container.clientHeight - 250); // Keep well above city

            cloud.style.left = startX + 'px';
            cloud.style.top = y + 'px';

            container.appendChild(cloud);

            const duration = (2000 + Math.random() * 2000) / Game.state.difficulty; // Speed up with difficulty
            const anim = cloud.animate([
                { left: startX + 'px' },
                { left: endX + 'px' }
            ], {
                duration: duration,
                easing: 'linear'
            });

            anim.onfinish = () => {
                cloud.remove();
                // If game is still active, spawn replacement
                const gameScreen = document.getElementById('screen-game');
                if (gameScreen && gameScreen.classList.contains('active') && score < targetScore) {
                    spawnCloud();
                }
            };

            cloud.onmousedown = (e) => {
                e.preventDefault();
                e.stopPropagation(); // Stop bg click

                shootEffect();
                spawnParticles(e.clientX - container.getBoundingClientRect().left, e.clientY - container.getBoundingClientRect().top);

                score++;
                cloud.style.pointerEvents = 'none';
                cloud.style.opacity = 0; // Instant hide

                // Remove cloud after short delay for particles to show above
                setTimeout(() => cloud.remove(), 100);

                if (score >= targetScore) {
                    onWin();
                } else {
                    spawnCloud();
                }
            };
        };

        // Background click (miss)
        container.onmousedown = (e) => {
            if (e.target === container || e.target === city) {
                shootEffect();
            }
        };

        // Initial spawn - more clouds for more action!
        for (let i = 0; i < 4; i++) spawnCloud();
    },
    cleanup: () => {
        const gameArea = document.getElementById('game-area');
        if (gameArea) {
            gameArea.style.background = "";
            gameArea.style.cursor = "";
            gameArea.onmousedown = null;
        }
        const consoleContainer = document.getElementById('console-container');
        if (consoleContainer) {
            consoleContainer.classList.remove('shake');
        }
    }
};

window.Microgames = window.Microgames || {};
window.Microgames.energyBalance = {
    instruction: "GRAB THE WEALTH! (SPACE)",
    init: (container, onWin, onLose) => {
        // Visual Style Setup - Gritty Urban Theme
        container.style.background = "linear-gradient(180deg, #1a1a1a 0%, #2c3e50 100%)";
        container.style.position = "relative";
        container.style.overflow = "hidden";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";

        // Add CSS Styles
        const style = document.head.appendChild(document.createElement('style'));
        style.id = 'wealth-collection-styles';
        style.textContent = `
            .wealth-meter {
                width: 80%;
                height: 50px;
                background: #34495e; /* Concrete/Poverty background */
                border: 4px solid #2c3e50;
                border-radius: 12px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.5);
            }
            .balance-zone-green {
                position: absolute;
                height: 100%;
                top: 0;
                background: linear-gradient(to bottom, #2ecc71, #27ae60);
                opacity: 0.9;
                box-shadow: 0 0 25px rgba(46, 204, 113, 0.6);
                transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 5;
                border-left: 2px solid rgba(255,255,255,0.3);
                border-right: 2px solid rgba(255,255,255,0.3);
            }
            .wealth-needle {
                width: 6px;
                height: 75px;
                background: #f1c40f; /* Gold needle */
                position: absolute;
                left: 0%;
                top: -12px;
                transform: translateX(-50%);
                border-radius: 3px;
                box-shadow: 0 0 20px #f1c40f;
                z-index: 10;
            }
            .wealth-label {
                color: #ecf0f1;
                font-family: 'Arial Black', sans-serif;
                font-size: 24px;
                margin-top: 30px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .savings-counter {
                color: #2ecc71;
                font-size: 22px;
                font-family: 'Courier New', monospace;
                margin-top: 10px;
                font-weight: bold;
            }
            .money-particle {
                position: absolute;
                font-size: 30px;
                pointer-events: none;
                z-index: 20;
                animation: fallAndFade 0.8s ease-out forwards;
            }
            @keyframes fallAndFade {
                0% { transform: translateY(0) rotate(0deg) scale(0.5); opacity: 1; }
                100% { transform: translateY(200px) rotate(360deg) scale(1.5); opacity: 0; }
            }
            .flash-success {
                animation: flashGold 0.3s;
            }
            @keyframes flashGold {
                0% { background-color: rgba(241, 196, 15, 0.2); }
                100% { background-color: transparent; }
            }
        `;

        // Create UI Elements
        const meter = document.createElement('div');
        meter.className = 'wealth-meter';

        const zoneGreen = document.createElement('div');
        zoneGreen.className = 'balance-zone-green';
        meter.appendChild(zoneGreen);

        const needle = document.createElement('div');
        needle.className = 'wealth-needle';
        meter.appendChild(needle);

        const label = document.createElement('div');
        label.className = 'wealth-label';
        label.innerText = "FINANCIAL STRUGGLE";

        const counter = document.createElement('div');
        counter.className = 'savings-counter';
        counter.innerText = "SAVINGS: $0 / $500";

        container.appendChild(meter);
        container.appendChild(label);
        container.appendChild(counter);

        // Money Rain Function
        const spawnMoney = (x) => {
            const particles = ['💸', '💰', '🪙', '💵'];
            for (let i = 0; i < 8; i++) {
                const p = document.createElement('div');
                p.className = 'money-particle';
                p.innerText = particles[Math.floor(Math.random() * particles.length)];
                p.style.left = `${x}%`;
                p.style.top = `40%`;
                p.style.transform = `translateX(${(Math.random() - 0.5) * 100}px)`;
                container.appendChild(p);
                setTimeout(() => p.remove(), 1000);
            }
        };

        // Game State
        let currentWidth = 70; // Percentage
        let currentLeft = 15;  // Initial left (centered: 50 - 70/2)
        let hits = 0;
        const targetHits = 5;
        let isGameOver = false;

        let needlePos = 0;
        let needleDir = 1;
        const needleSpeed = 2.5 * (Game?.state?.difficulty || 1);

        const updateZone = () => {
            zoneGreen.style.width = `${currentWidth}%`;
            zoneGreen.style.left = `${currentLeft}%`;
        };
        updateZone();

        // Loop
        let animFrame;
        const update = () => {
            if (isGameOver) return;

            needlePos += needleDir * needleSpeed;
            if (needlePos >= 100) {
                needlePos = 100;
                needleDir = -1;
            } else if (needlePos <= 0) {
                needlePos = 0;
                needleDir = 1;
            }

            needle.style.left = `${needlePos}%`;
            animFrame = requestAnimationFrame(update);
        };
        update();

        // Handle Input
        const handleKeyDown = (e) => {
            if (isGameOver) return;
            if (e.code === 'Space') {
                const greenLeft = currentLeft;
                const greenRight = currentLeft + currentWidth;

                if (needlePos >= greenLeft && needlePos <= greenRight) {
                    hits++;
                    counter.innerText = `SAVINGS: $${hits * 100} / $500`;

                    spawnMoney(needlePos);

                    currentWidth *= 0.75;
                    currentLeft = Math.random() * (100 - currentWidth);
                    updateZone();

                    container.classList.add('flash-success');
                    setTimeout(() => container.classList.remove('flash-success'), 300);

                    if (hits >= targetHits) {
                        isGameOver = true;
                        label.innerText = "SAVINGS SECURED!";
                        label.style.color = "#f1c40f";
                        setTimeout(onWin, 1000);
                    }
                } else {
                    isGameOver = true;
                    needle.style.background = "#c0392b";
                    label.innerText = "BANKRUPT!";
                    label.style.color = "#c0392b";
                    setTimeout(onLose, 1000);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup
        window.Microgames.energyBalance._cleanup = () => {
            window.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(animFrame);
            if (style.parentNode) style.parentNode.removeChild(style);
        };
    },
    survive: false,
    cleanup: () => {
        if (window.Microgames.energyBalance._cleanup) {
            window.Microgames.energyBalance._cleanup();
        }
    }
};

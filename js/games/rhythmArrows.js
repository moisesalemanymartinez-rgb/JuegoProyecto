window.Microgames = window.Microgames || {};
window.Microgames.rhythmArrows = {
    instruction: "HIT THE ARROWS!",
    init: (container, onWin, onLose) => {
        // Deep Space Cyberpunk background
        container.style.background = "linear-gradient(135deg, #020111 0%, #050531 25%, #0c0c52 50%, #050531 75%, #020111 100%)";
        container.style.position = "relative";
        container.style.overflow = "hidden";

        // Custom SVG Arrows
        const getArrowSVG = (direction, color, isReceptor = false) => {
            // Corrected rotations: Up:0, Right:90, Down:180, Left:270
            const rotations = { 'ArrowLeft': 270, 'ArrowDown': 180, 'ArrowUp': 0, 'ArrowRight': 90 };
            const opacity = isReceptor ? 0.3 : 1;
            const fill = isReceptor ? 'none' : color;
            const stroke = color;
            const glow = isReceptor ? '' : `filter: drop-shadow(0 0 8px ${color});`;

            return `
                <svg width="60" height="60" viewBox="0 0 60 60" style="transform: rotate(${rotations[direction]}deg); ${glow} opacity: ${opacity};">
                    <path d="M30 5 L55 35 L40 35 L40 55 L20 55 L20 35 L5 35 Z" 
                          fill="${fill}" 
                          stroke="${stroke}" 
                          stroke-width="3" 
                          stroke-linejoin="round" />
                </svg>
            `;
        };

        const arrowColors = {
            'ArrowLeft': '#4ecdc4',  // Cyan
            'ArrowDown': '#ff6b6b',  // Red/Pink
            'ArrowUp': '#ffe66d',    // Yellow
            'ArrowRight': '#ff9f43'  // Orange
        };

        // Add Style for animations
        const style = document.head.appendChild(document.createElement('style'));
        style.textContent = `
            @keyframes gridScroll {
                0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
                100% { transform: perspective(500px) rotateX(60deg) translateY(40px); }
            }
            @keyframes starTwinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            @keyframes nebulaDrift {
                0% { transform: scale(1) translate(0, 0); }
                50% { transform: scale(1.2) translate(5%, 5%); }
                100% { transform: scale(1) translate(0, 0); }
            }
            @keyframes pulseBg {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.2); }
            }
            @keyframes shootingStar {
                0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 0; }
                10% { opacity: 1; }
                20% { transform: translateX(-500px) translateY(500px) rotate(-45deg); opacity: 0; }
                100% { opacity: 0; }
            }
            @keyframes neonFloat {
                0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.2; }
                50% { transform: translate(20px, -20px) rotate(10deg); opacity: 0.5; }
            }
            @keyframes electricFlicker {
                0%, 100% { opacity: 0; }
                10%, 30%, 50% { opacity: 0.8; }
                20%, 40%, 60% { opacity: 0; }
            }
            .lane-glow {
                position: absolute;
                top: 0;
                width: 2px;
                height: 100%;
                background: linear-gradient(to bottom, transparent, rgba(78, 205, 196, 0.3), transparent);
                box-shadow: 0 0 15px rgba(78, 205, 196, 0.2);
                z-index: 1;
            }
            .neon-shape {
                position: absolute;
                border: 2px solid rgba(78, 205, 196, 0.5);
                box-shadow: 0 0 15px rgba(78, 205, 196, 0.3);
                pointer-events: none;
                z-index: 0;
            }
        `;

        // Add Nebula Clouds for depth
        const colors = ['rgba(138, 43, 226, 0.15)', 'rgba(75, 0, 130, 0.15)', 'rgba(0, 0, 255, 0.1)'];
        for (let i = 0; i < 4; i++) {
            const nebula = document.createElement('div');
            nebula.style.position = 'absolute';
            nebula.style.width = '300px';
            nebula.style.height = '300px';
            nebula.style.background = `radial-gradient(circle, ${colors[i % colors.length]} 0%, transparent 70%)`;
            nebula.style.left = `${Math.random() * 80 - 10}%`;
            nebula.style.top = `${Math.random() * 80 - 10}%`;
            nebula.style.filter = 'blur(60px)';
            nebula.style.animation = `nebulaDrift ${15 + i * 5}s infinite ease-in-out`;
            nebula.style.zIndex = '0';
            container.appendChild(nebula);
        }

        // Add Neon Shapes
        for (let i = 0; i < 5; i++) {
            const shape = document.createElement('div');
            shape.className = 'neon-shape';
            const size = 50 + Math.random() * 100;
            shape.style.width = `${size}px`;
            shape.style.height = `${size}px`;
            shape.style.left = `${Math.random() * 100}%`;
            shape.style.top = `${Math.random() * 100}%`;
            shape.style.borderRadius = Math.random() > 0.5 ? '50%' : '10%';
            shape.style.animation = `neonFloat ${10 + Math.random() * 10}s infinite ease-in-out`;
            container.appendChild(shape);
        }

        // Electric Flicker Effect
        const spawnElectricFlicker = () => {
            const f = document.createElement('div');
            f.style.position = 'absolute';
            f.style.left = `${Math.random() * 100}%`;
            f.style.top = `${Math.random() * 100}%`;
            f.style.width = '4px';
            f.style.height = '4px';
            f.style.backgroundColor = '#4ecdc4';
            f.style.boxShadow = '0 0 20px #4ecdc4, 0 0 40px #4ecdc4';
            f.style.borderRadius = '50%';
            f.style.animation = 'electricFlicker 0.5s linear forwards';
            f.style.zIndex = '1';
            container.appendChild(f);
            setTimeout(() => f.remove(), 500);
            setTimeout(spawnElectricFlicker, 2000 + Math.random() * 4000);
        };
        spawnElectricFlicker();

        // Add animated Cyber Grid
        const grid = document.createElement('div');
        grid.style.position = 'absolute';
        grid.style.top = '0';
        grid.style.left = '-50%';
        grid.style.width = '200%';
        grid.style.height = '200%';
        grid.style.backgroundImage = 'radial-gradient(circle, rgba(78, 205, 196, 0.1) 1px, transparent 1px)';
        grid.style.backgroundSize = '40px 40px';
        grid.style.transform = 'perspective(500px) rotateX(60deg)';
        grid.style.transformOrigin = 'center bottom';
        grid.style.animation = 'gridScroll 10s linear infinite';
        grid.style.zIndex = '0';
        container.appendChild(grid);

        // Add Stars
        for (let i = 0; i < 40; i++) {
            const star = document.createElement('div');
            star.style.position = 'absolute';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.width = Math.random() > 0.8 ? '3px' : '1px';
            star.style.height = star.style.width;
            star.style.backgroundColor = 'white';
            star.style.borderRadius = '50%';
            star.style.opacity = Math.random();
            star.style.animation = `starTwinkle ${2 + Math.random() * 3}s infinite ease-in-out`;
            star.style.zIndex = '0';
            container.appendChild(star);
        }

        // Add Shooting Star (randomly)
        const spawnShootingStar = () => {
            const s = document.createElement('div');
            s.style.position = 'absolute';
            s.style.top = `${Math.random() * 50}%`;
            s.style.right = '-100px';
            s.style.width = '100px';
            s.style.height = '1px';
            s.style.background = 'linear-gradient(to right, transparent, white)';
            s.style.animation = 'shootingStar 2s linear forwards';
            s.style.zIndex = '0';
            container.appendChild(s);
            setTimeout(() => s.remove(), 2000);
            setTimeout(spawnShootingStar, 5000 + Math.random() * 10000);
        };
        setTimeout(spawnShootingStar, 3000);

        // Add Lane Dividers
        for (let i = 1; i < 4; i++) {
            const divider = document.createElement('div');
            divider.className = 'lane-glow';
            divider.style.left = `${i * 25}%`;
            container.appendChild(divider);
        }

        // Vignette & Scanline
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.6) 100%), linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.1) 50%)';
        overlay.style.backgroundSize = '100% 100%, 100% 4px';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '5';
        container.appendChild(overlay);

        const columns = ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight'];
        let containerHeight = container.clientHeight || 400;
        let receptorY = containerHeight - 150;
        const hitZone = 60; // Widened for better balance
        const activeNotes = [];
        let isGameOver = false;

        // Create Receptors
        columns.forEach((key, i) => {
            const col = document.createElement('div');
            col.style.position = 'absolute';
            col.style.left = `${i * 25}%`;
            col.style.width = '25%';
            col.style.height = '100%';
            col.style.zIndex = '2';
            container.appendChild(col);

            const receptor = document.createElement('div');
            receptor.innerHTML = getArrowSVG(key, arrowColors[key], true);
            receptor.style.position = 'absolute';
            receptor.style.left = '50%';
            receptor.style.top = `${receptorY}px`;
            receptor.style.transform = 'translateX(-50%)';
            receptor.style.transition = 'all 0.1s ease';
            receptor.id = `receptor-${key}`;
            col.appendChild(receptor);
        });

        const spawnNote = () => {
            if (isGameOver) return;
            const key = columns[Math.floor(Math.random() * columns.length)];
            const note = document.createElement('div');
            note.innerHTML = getArrowSVG(key, arrowColors[key], false);
            note.style.position = 'absolute';
            note.style.left = `${columns.indexOf(key) * 25 + 12.5}%`;
            note.style.top = '-60px';
            note.style.transform = 'translateX(-50%)';
            note.style.transition = 'none';
            note.style.zIndex = '10';
            container.appendChild(note);

            activeNotes.push({
                element: note,
                key: key,
                y: -60,
                hit: false
            });
        };

        let lastSpawn = 0;
        const baseSpawnInterval = 800;
        const spawnInterval = baseSpawnInterval / (Game?.state?.difficulty || 1);
        const speed = 4 * (Game?.state?.difficulty || 1);

        const animate = (timestamp) => {
            if (isGameOver) return;

            // Constantly update height logic safely
            if (container.clientHeight > 0 && Math.abs(containerHeight - container.clientHeight) > 10) {
                containerHeight = container.clientHeight;
                receptorY = containerHeight - 150;
                columns.forEach(key => {
                    const r = document.getElementById(`receptor-${key}`);
                    if (r) r.style.top = `${receptorY}px`;
                });
            }

            if (timestamp - lastSpawn > spawnInterval) {
                spawnNote();
                lastSpawn = timestamp;
            }

            for (let i = activeNotes.length - 1; i >= 0; i--) {
                const note = activeNotes[i];
                note.y += speed;
                note.element.style.top = `${note.y}px`;

                // If note passes the hitzone floor without being hit
                if (note.y > receptorY + hitZone && !note.hit) {
                    isGameOver = true;
                    onLose();
                    return;
                }

                if (note.y > containerHeight + 60) {
                    note.element.remove();
                    activeNotes.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);

        const keyMap = {
            // Arrow keys
            'ArrowLeft': 'ArrowLeft', 'ArrowDown': 'ArrowDown', 'ArrowUp': 'ArrowUp', 'ArrowRight': 'ArrowRight',
            'Left': 'ArrowLeft', 'Down': 'ArrowDown', 'Up': 'ArrowUp', 'Right': 'ArrowRight',
            // WASD
            'KeyA': 'ArrowLeft', 'KeyS': 'ArrowDown', 'KeyW': 'ArrowUp', 'KeyD': 'ArrowRight',
            'a': 'ArrowLeft', 's': 'ArrowDown', 'w': 'ArrowUp', 'd': 'ArrowRight',
            'A': 'ArrowLeft', 'S': 'ArrowDown', 'W': 'ArrowUp', 'D': 'ArrowRight'
        };

        const handleKeyDown = (e) => {
            if (isGameOver) return;
            // Support code (modern), key (legacy/fallback), and even key mapping
            const mappedKey = keyMap[e.code] || keyMap[e.key];

            if (mappedKey && columns.includes(mappedKey)) {
                e.preventDefault();

                // Prioritize the note closest to the receptor
                const notesInZone = activeNotes
                    .filter(n => n.key === mappedKey && Math.abs(n.y - receptorY) <= hitZone && !n.hit)
                    .sort((a, b) => Math.abs(a.y - receptorY) - Math.abs(b.y - receptorY));

                if (notesInZone.length > 0) {
                    const note = notesInZone[0];
                    note.hit = true;
                    // Visual feedback
                    note.element.style.transform = 'translateX(-50%) scale(2.5)';
                    note.element.style.opacity = '0';
                    note.element.style.transition = 'all 0.1s ease-out';
                    note.element.style.filter = 'brightness(300%)';

                    const receptor = document.getElementById(`receptor-${mappedKey}`);
                    if (receptor) {
                        const svg = receptor.querySelector('svg');
                        const path = receptor.querySelector('path');
                        if (svg) svg.style.opacity = '1';
                        if (path) {
                            path.style.fill = arrowColors[mappedKey];
                            path.style.stroke = 'white';
                        }
                        receptor.style.filter = `drop-shadow(0 0 25px ${arrowColors[mappedKey]}) brightness(1.5)`;
                        receptor.style.transform = 'translateX(-50%) scale(1.15)';
                    }

                    container.style.boxShadow = `inset 0 0 100px ${arrowColors[mappedKey]}44`;
                    setTimeout(() => {
                        if (receptor) {
                            const svg = receptor.querySelector('svg');
                            const path = receptor.querySelector('path');
                            if (svg) svg.style.opacity = '0.3';
                            if (path) {
                                path.style.fill = 'none';
                                path.style.stroke = arrowColors[mappedKey];
                            }
                            receptor.style.filter = '';
                            receptor.style.transform = 'translateX(-50%) scale(1)';
                        }
                        container.style.boxShadow = 'none';
                    }, 100);
                } else {
                    // Penalty: If a valid game key is pressed but no note is in the hit zone
                    isGameOver = true;
                    onLose();
                    return;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        window.Microgames.rhythmArrows._cleanup = () => {
            window.removeEventListener('keydown', handleKeyDown);
            isGameOver = true;
            if (style.parentNode) style.parentNode.removeChild(style);
        };
    },
    survive: true,
    cleanup: () => {
        if (window.Microgames.rhythmArrows._cleanup) {
            window.Microgames.rhythmArrows._cleanup();
        }
    }
};

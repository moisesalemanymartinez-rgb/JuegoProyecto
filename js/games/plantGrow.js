window.Microgames = window.Microgames || {};
window.Microgames.plantGrow = {
    instruction: "WATER THE SEED! (SPACE)",
    init: (container, onWin, onLose) => {
        // Advanced atmospheric gradient
        container.style.background = "linear-gradient(180deg, #1e3c72 0%, #2a5298 25%, #87CEEB 70%, #E0C097 90%)";

        // Inject Environmental Animations
        if (!document.getElementById('environmental-styles')) {
            const style = document.createElement('style');
            style.id = 'environmental-styles';
            style.innerHTML = `
                @keyframes windSway {
                    0%, 100% { transform: rotate(-1deg) translateX(0); }
                    50% { transform: rotate(1.5deg) translateX(1px); }
                }
                @keyframes cloudDrift {
                    from { left: -150px; }
                    to { left: ${container.clientWidth + 150}px; }
                }
            `;
            document.head.appendChild(style);
        }

        // Sun
        const sun = document.createElement('div');
        sun.style.position = 'absolute';
        sun.style.top = '10%';
        sun.style.right = '10%';
        sun.style.width = '60px';
        sun.style.height = '60px';
        sun.style.background = 'radial-gradient(circle, #FFF9C4 0%, #FFEB3B 50%, #FBC02D 100%)';
        sun.style.borderRadius = '50%';
        sun.style.boxShadow = '0 0 30px #FFD600, 0 0 60px rgba(255, 214, 0, 0.4)';
        sun.style.zIndex = '0';
        container.appendChild(sun);

        const ground = document.createElement('div');
        ground.style.position = 'absolute';
        ground.style.bottom = '0';
        ground.style.width = '100%';
        ground.style.height = '15%';
        ground.style.background = '#5D4037';
        ground.style.zIndex = '10';
        container.appendChild(ground);

        // Background Hills
        const createHills = () => {
            const configs = [
                { bottom: '12%', color: '#388E3C', width: '150%', left: '-25%', opacity: 0.6, z: 1 },
                { bottom: '10%', color: '#2E7D32', width: '130%', left: '10%', opacity: 0.5, z: 2 }
            ];
            configs.forEach(cfg => {
                const hill = document.createElement('div');
                hill.style.position = 'absolute';
                hill.style.bottom = cfg.bottom;
                hill.style.width = cfg.width;
                hill.style.height = '30%';
                hill.style.left = cfg.left;
                hill.style.background = `radial-gradient(circle at 50% 100%, ${cfg.color} 0%, rgba(0,0,0,0.4) 100%)`;
                hill.style.borderRadius = '50% 50% 0 0';
                hill.style.opacity = cfg.opacity;
                hill.style.zIndex = cfg.z;
                container.appendChild(hill);
            });
        };
        createHills();

        // Drifting Clouds
        const spawnCloud = () => {
            const cloud = document.createElement('div');
            cloud.innerHTML = '☁️';
            cloud.style.position = 'absolute';
            cloud.style.top = `${5 + Math.random() * 20}%`;
            cloud.style.left = '-150px';
            cloud.style.fontSize = `${40 + Math.random() * 40}px`;
            cloud.style.opacity = '0.4';
            cloud.style.zIndex = '0';
            cloud.style.pointerEvents = 'none';
            cloud.style.animation = `cloudDrift ${25 + Math.random() * 20}s linear forwards`;
            container.appendChild(cloud);
            cloud.onanimationend = () => cloud.remove();
        };
        const cloudTimer = setInterval(spawnCloud, 8000);
        spawnCloud(); // Initial cloud

        // Forest with organic grouping and wind sway
        const createForest = () => {
            const treeTypes = ['🌳', '🌲'];
            const framingPositions = [
                { x: 0.08, scale: 3.0, z: 3, delay: 0 },   // Left far
                { x: 0.24, scale: 2.2, z: 4, delay: 0.5 }, // Left mid
                { x: 0.76, scale: 2.2, z: 4, delay: 0.8 }, // Right mid
                { x: 0.92, scale: 3.0, z: 3, delay: 0.3 }  // Right far
            ];

            framingPositions.forEach(pos => {
                const tree = document.createElement('div');
                const type = treeTypes[Math.floor(Math.random() * treeTypes.length)];
                tree.innerHTML = type;
                tree.style.position = 'absolute';
                const xPos = pos.x * container.clientWidth;
                const scale = pos.scale;

                tree.style.left = `${xPos - (50 * pos.scale / 2)}px`;
                tree.style.bottom = `${8 + Math.random() * 4}%`;
                tree.style.fontSize = `${50 * scale}px`;
                tree.style.zIndex = pos.z;
                tree.style.pointerEvents = 'none';
                tree.style.animation = `windSway ${4 + Math.random() * 2}s ease-in-out ${pos.delay}s infinite alternate`;
                tree.style.filter = 'drop-shadow(10px 10px 15px rgba(0,0,0,0.4))';
                container.appendChild(tree);

                // Flora at base
                const detail = document.createElement('div');
                detail.innerHTML = Math.random() > 0.5 ? '🌿' : '🌼';
                detail.style.position = 'absolute';
                detail.style.left = `${xPos + (Math.random() * 40 - 20)}px`;
                detail.style.bottom = '12%';
                detail.style.fontSize = '35px';
                detail.style.zIndex = '11';
                detail.style.pointerEvents = 'none';
                container.appendChild(detail);
            });
        };
        createForest();

        // Success zone circle
        const targetX = container.clientWidth / 2;
        const targetY = container.clientHeight * 0.8;
        const zoneRadius = 40;

        const zone = document.createElement('div');
        zone.style.position = 'absolute';
        zone.style.left = `${targetX - zoneRadius}px`;
        zone.style.top = `${targetY - zoneRadius}px`;
        zone.style.width = `${zoneRadius * 2}px`;
        zone.style.height = `${zoneRadius * 2}px`;
        zone.style.border = '4px dashed rgba(255, 255, 255, 0.5)';
        zone.style.borderRadius = '50%';
        zone.style.zIndex = '5';
        container.appendChild(zone);

        // Seed
        const seed = document.createElement('div');
        seed.innerHTML = '🌱';
        seed.style.position = 'absolute';
        seed.style.left = `${targetX - 15}px`;
        seed.style.top = `${targetY - 15}px`;
        seed.style.fontSize = '30px';
        seed.style.zIndex = '50';
        container.appendChild(seed);

        // Droplets container and state
        const droplets = [];
        let dropsCaught = 0;
        const totalNeeded = 3;
        let isGameOver = false;

        const spawnDroplet = () => {
            const droplet = document.createElement('div');
            droplet.innerHTML = '💧';
            droplet.style.position = 'absolute';
            droplet.style.left = `${targetX - 15}px`;
            droplet.style.top = '-50px';
            droplet.style.fontSize = '30px';
            droplet.style.zIndex = '60';
            container.appendChild(droplet);

            // Varied speed: Base (3) * difficulty * random variation (0.8 to 1.4)
            const speed = 3 * (Game?.state?.difficulty || 1) * (0.8 + Math.random() * 0.6);

            droplets.push({
                element: droplet,
                y: -50,
                speed: speed
            });
        };

        let lastSpawn = 0;
        const spawnInterval = 1500 / (Game?.state?.difficulty || 1);

        const animate = (timestamp) => {
            if (isGameOver) return;

            // Spawn logica
            if (timestamp - lastSpawn > spawnInterval) {
                spawnDroplet();
                lastSpawn = timestamp;
            }

            // Update droplets
            for (let i = droplets.length - 1; i >= 0; i--) {
                const d = droplets[i];
                d.y += d.speed;
                d.element.style.top = `${d.y}px`;

                if (d.y > container.clientHeight) {
                    isGameOver = true;
                    wither();
                    return;
                }
            }

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);

        const handleKeyDown = (e) => {
            if (isGameOver) return;
            if (e.code === 'Space') {
                // Find droplet in zone
                let caught = false;
                for (let i = 0; i < droplets.length; i++) {
                    const d = droplets[i];
                    const dist = Math.abs(d.y - (targetY - 15));
                    if (dist < zoneRadius) {
                        // Catch it!
                        container.removeChild(d.element);
                        droplets.splice(i, 1);
                        dropsCaught++;
                        updatePlant();
                        caught = true;

                        if (dropsCaught >= totalNeeded) {
                            isGameOver = true;
                            grow();
                        }
                        break;
                    }
                }

                if (!caught) {
                    isGameOver = true;
                    wither();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        const updatePlant = () => {
            const scale = 1 + (dropsCaught * 0.5);
            seed.style.transform = `scale(${scale})`;
            seed.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        };

        const grow = () => {
            droplets.forEach(d => d.element.style.display = 'none');
            seed.innerHTML = '🌸';
            seed.style.transform = 'scale(2.5) translateY(-10px)';
            seed.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            setTimeout(onWin, 800);
        };

        const wither = () => {
            droplets.forEach(d => d.element.style.display = 'none');
            seed.innerHTML = '🍂';
            seed.style.opacity = '0.5';
            seed.style.transform = 'scale(0.8) rotate(45deg)';
            seed.style.transition = 'all 0.5s ease';
            setTimeout(onLose, 800);
        };

        window.Microgames.plantGrow._cleanup = () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(cloudTimer);
        };
    },
    cleanup: () => {
        if (window.Microgames.plantGrow._cleanup) {
            window.Microgames.plantGrow._cleanup();
        }
        const gameArea = document.getElementById('game-area');
        if (gameArea) {
            gameArea.style.background = "";
        }
    }
};

// --- Microgames (SDG 7 Edition - Clean Energy) ---
Microgames.windTurbine = {
    instruction: "GENERATE WIND ENERGY! (SDG 7)",
    init: (container, onWin, onLose) => {
        // Layout Setup
        container.innerHTML = '';
        container.className = 'wind-game-container';

        // 1. Sky Background (Full Scene)
        const skySection = document.createElement('div');
        skySection.className = 'wind-sky';

        // 2. Multiple Turbines Generator
        const bladesArr = []; // To track for animation
        const turbineCount = 5;

        // Defined fixed positions for better aesthetics - LARGER and CENTERED
        const turbineConfigs = [
            { left: 25, scale: 1.0, z: 20 },
            { left: 40, scale: 1.3, z: 50 },
            { left: 50, scale: 1.6, z: 100 }, // Center, MASSIVE
            { left: 60, scale: 1.3, z: 50 },
            { left: 75, scale: 1.0, z: 20 }
        ];

        turbineConfigs.forEach(conf => {
            const tContainer = document.createElement('div');
            tContainer.className = 'turbine-container';

            const scale = conf.scale;
            const zIndex = conf.z;
            const leftPos = conf.left;

            tContainer.style.transform = `scale(${scale})`;
            tContainer.style.zIndex = zIndex;
            tContainer.style.left = `${leftPos}%`;

            // Ground position adjustment
            const bottomPos = -5 + ((1.0 - scale) * 8);
            tContainer.style.bottom = `${bottomPos}%`;

            const tower = document.createElement('div');
            tower.className = 'turbine-tower';

            const blades = document.createElement('div');
            blades.className = 'turbine-blades';

            // 3 Blades per turbine
            for (let j = 0; j < 3; j++) {
                const blade = document.createElement('div');
                blade.className = 'turbine-blade';
                blade.style.transform = `rotate(${j * 120}deg) translateY(-50px)`;
                blades.appendChild(blade);
            }

            const hub = document.createElement('div');
            hub.className = 'turbine-hub';

            tContainer.appendChild(tower);
            tContainer.appendChild(blades);
            tContainer.appendChild(hub);

            skySection.appendChild(tContainer);

            // Add to array with semi-random initial rotation so they don't look identical
            bladesArr.push({
                element: blades,
                rotation: Math.random() * 360,
                speedMultiplier: 0.9 + (Math.random() * 0.2) // Slight variance in speed
            });
        });

        // 2.5 Clouds
        for (let c = 0; c < 5; c++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.top = (Math.random() * 40) + '%';
            cloud.style.left = (Math.random() * 100) + '%';
            // Random animation delay
            cloud.style.animationDelay = (Math.random() * 5) + 's';
            skySection.appendChild(cloud);
        }

        // 3. Energy Meter (UI Overlay)
        const energyContainer = document.createElement('div');
        energyContainer.className = 'energy-container';
        energyContainer.innerHTML = '<div class="energy-label">ENERGY STORED</div>';
        const energyBar = document.createElement('div');
        energyBar.className = 'energy-bar';
        const energyFill = document.createElement('div');
        energyFill.className = 'energy-fill';
        energyBar.appendChild(energyFill);
        energyContainer.appendChild(energyBar);
        skySection.appendChild(energyContainer);

        // 4. Ground/Controls Overlay
        const groundSection = document.createElement('div');
        groundSection.className = 'wind-ground';

        const windBtn = document.createElement('button');
        windBtn.className = 'wind-button';
        windBtn.innerText = "💨 WIND 💨";

        groundSection.appendChild(windBtn);

        container.appendChild(skySection);
        container.appendChild(groundSection); // Overlay on top

        // Game State
        let globalSpeed = 0; // The wind "force" applied to all
        let energy = 0;
        const maxEnergy = 100;
        let gameActive = true;
        let animFrame;

        // Visual "Wind" Particle spawner (Horizontal)
        const spawnWindParticle = () => {
            const p = document.createElement('div');
            p.className = 'wind-particle';
            // Random vertical start
            p.style.top = (Math.random() * 60 + 10) + '%';
            skySection.appendChild(p);

            // Cleanup
            setTimeout(() => p.remove(), 1500);
        };

        // Wind Sticker Effect (Emoji) using Web Animations API for dynamic movement
        const spawnWindSticker = () => {
            const s = document.createElement('div');
            s.className = 'wind-sticker';
            s.innerText = "💨";
            s.style.top = (35 + Math.random() * 35) + '%';
            s.style.left = '-100px';
            skySection.appendChild(s);

            // Animate horizontally from left to the center (where turbines are)
            // easing: 'ease-out' makes it slow down as it approaches the end
            const anim = s.animate([
                { left: '-100px', transform: 'scale(0.6) rotate(-10deg)', opacity: 0 },
                { left: '10%', transform: 'scale(1.2) rotate(0deg)', opacity: 1, offset: 0.2 },
                { left: '55%', transform: 'scale(1.4) rotate(10deg)', opacity: 0 }
            ], {
                duration: 1500, // Slightly longer to better see the deceleration
                easing: 'ease-out'
            });

            anim.onfinish = () => s.remove();
        };

        // LOOP
        const gameLoop = () => {
            if (!gameActive) return;

            // Update All Turbines
            bladesArr.forEach(item => {
                // Determine speed (base idle speed + forced wind speed)
                // Base idle varies per turbine slightly? No, let's keep it simple.
                // Idle speed = 0.5
                const currentSpeed = 0.5 + (globalSpeed * item.speedMultiplier);

                item.rotation += currentSpeed;
                item.element.style.transform = `rotate(${item.rotation}deg)`;
            });

            // Natural Decay of Wind Force
            if (globalSpeed > 0) {
                globalSpeed *= 0.96; // Friction
                if (globalSpeed < 0.1) globalSpeed = 0;
            }

            // Energy Generation (Only if adequate wind)
            if (globalSpeed > 2) {
                // More turbines spinning = more energy? 
                // Let's just simulate rate based on speed
                energy += (globalSpeed * 0.03);
                if (energy > maxEnergy) energy = maxEnergy;
            }

            // Update UI
            energyFill.style.width = `${energy}%`;

            // Color change based on charge
            if (energy > 80) energyFill.style.background = '#0f0';
            else if (energy > 40) energyFill.style.background = '#ffeb3b';
            else energyFill.style.background = '#f44336';

            // Win Condition
            if (energy >= maxEnergy) {
                gameActive = false;
                onWin();
            }

            animFrame = requestAnimationFrame(gameLoop);
        };

        // Interaction
        windBtn.onclick = () => {
            if (!gameActive) return;

            // Add Wind Force
            globalSpeed += 5;
            if (globalSpeed > 30) globalSpeed = 30; // Cap speed

            // Visuals
            // Spawn multiple particles for effect
            spawnWindParticle();
            spawnWindParticle();
            spawnWindParticle();
            spawnWindSticker(); // <--- New Sticker Effect

            // Button feedback
            windBtn.style.transform = 'scale(0.95)';
            setTimeout(() => windBtn.style.transform = 'scale(1)', 50);
        };

        // Start
        gameLoop();

        // Cleanup Reference
        Microgames.windTurbine.cleanupFunc = () => {
            gameActive = false;
            cancelAnimationFrame(animFrame);
        };
    },
    cleanup: () => {
        if (Microgames.windTurbine.cleanupFunc) Microgames.windTurbine.cleanupFunc();
    }
};

// --- Marine Trash Microgame (Pou-Style) ---
window.Microgames = window.Microgames || {};

Microgames.marineTrash = {
    instruction: "DON'T MISS!",
    survive: true,
    init: (container, onWin, onLose) => {
        let score = 0;
        // No targetScore in survival mode
        let isActive = true;
        let animationFrameId;

        // Visual Setup
        // Lighter, more vibrant ocean gradient
        container.style.background = "linear-gradient(to bottom, #2980b9 0%, #2c3e50 100%)";
        container.style.overflow = "hidden";
        container.style.position = "relative";
        container.style.cursor = "none";

        // --- Background Atmosphere ---

        // Caustics/Light Rays effect
        const caustics = document.createElement('div');
        caustics.style.position = 'absolute';
        caustics.style.top = '0';
        caustics.style.left = '0';
        caustics.style.width = '100%';
        caustics.style.height = '100%';
        caustics.style.background = "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 10px, transparent 10px, transparent 50px)";
        caustics.style.opacity = '0.3';
        caustics.style.pointerEvents = "none";
        caustics.style.zIndex = "0";
        container.appendChild(caustics);

        // Seabed Distant Shadows (Mountains/Rocks) - Improved color blending
        const farRocks = document.createElement('div');
        farRocks.style.position = 'absolute';
        farRocks.style.bottom = '0';
        farRocks.style.left = '0';
        farRocks.style.width = '100%';
        farRocks.style.height = '150px';
        farRocks.style.background = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%231a252f\' fill-opacity=\'1\' d=\'M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")';
        farRocks.style.backgroundSize = 'cover';
        farRocks.style.backgroundRepeat = 'no-repeat';
        farRocks.style.zIndex = '1';
        farRocks.style.opacity = '0.8';
        container.appendChild(farRocks);

        // Sand/Seabed Foreground - textured
        const sand1 = document.createElement('div');
        sand1.style.position = 'absolute';
        sand1.style.bottom = '0';
        sand1.style.left = '0';
        sand1.style.width = '120%';
        sand1.style.height = '60px';
        sand1.style.background = '#e67e22'; // Sand color
        sand1.style.background = 'linear-gradient(to top, #d35400, #e67e22)';
        sand1.style.borderRadius = '50% 50% 0 0 / 25px 25px 0 0';
        sand1.style.zIndex = '2';
        sand1.style.boxShadow = '0 -10px 20px rgba(0,0,0,0.3) inset';
        container.appendChild(sand1);

        // Background Animals (SVG Silhouettes)
        const bgAnimals = [
            // Shark
            {
                svg: `<svg viewBox="0 0 100 50" fill="rgba(0,0,0,0.3)"><path d="M90 25 Q 70 5 50 20 T 10 25 L 10 35 Q 30 35 50 30 T 90 25 L 90 10 Z M 60 10 L 50 20 L 70 20 Z" /></svg>`,
                y: '30%', speed: 20, delay: 0, scale: -1, size: '150px'
            },
            // Whale
            {
                svg: `<svg viewBox="0 0 100 60" fill="rgba(0,0,0,0.3)"><path d="M10 30 Q 30 0 70 10 T 95 30 Q 95 50 70 50 T 20 40 L 5 45 L 10 30 Z" /></svg>`,
                y: '60%', speed: 35, delay: 2000, scale: 1, size: '250px'
            },
            // Turtle
            {
                svg: `<svg viewBox="0 0 100 60" fill="rgba(0,0,0,0.3)"><path d="M20 30 Q 30 15 60 15 T 90 30 Q 90 45 60 45 T 20 30 Z M 10 25 L 25 30 L 10 35 Z M 80 40 L 95 50 L 85 35 Z" /></svg>`,
                y: '20%', speed: 25, delay: 1000, scale: 1, size: '100px'
            },
            // School of fish
            {
                svg: `<svg viewBox="0 0 100 50" fill="rgba(0,0,0,0.3)">
                        <circle cx="10" cy="10" r="5" /> <path d="M15 10 L 20 5 L 20 15 Z" />
                        <circle cx="40" cy="20" r="5" /> <path d="M45 20 L 50 15 L 50 25 Z" />
                        <circle cx="20" cy="35" r="5" /> <path d="M25 35 L 30 30 L 30 40 Z" />
                      </svg>`,
                y: '75%', speed: 15, delay: 4000, scale: 1, size: '120px'
            }
        ];

        // Initialize animals
        bgAnimals.forEach(data => {
            const el = document.createElement('div');
            el.innerHTML = data.svg;
            el.style.position = 'absolute';
            el.style.bottom = data.y;
            el.style.width = data.size;
            el.style.height = 'auto';
            el.style.zIndex = '3';
            el.style.opacity = '0.6';
            el.style.display = 'none'; // Hidden initially

            // Initial scale just for setup
            el.style.transform = `scaleX(${data.scale})`;

            container.appendChild(el);

            const startAnimation = () => {
                if (!isActive) return;

                // Random Direction
                const toRight = Math.random() > 0.5;
                const startX = toRight ? `-${data.size}` : '100%';
                const endX = toRight ? '100%' : `-${data.size}`;

                // Flip scale if moving left
                const currentScale = toRight ? data.scale : -data.scale;
                el.style.transform = `scaleX(${currentScale})`;

                el.style.display = 'block';

                // Add some speed variance
                const duration = (data.speed * 1000) * (0.8 + Math.random() * 0.4);

                const anim = el.animate([
                    { left: startX },
                    { left: endX }
                ], {
                    duration: duration,
                    easing: 'linear',
                    fill: 'forwards'
                });

                anim.onfinish = () => {
                    el.style.display = 'none';
                    if (isActive) {
                        // Random delay before next appearance
                        setTimeout(startAnimation, Math.random() * 2000 + 1000);
                    }
                };
            };

            // Start with initial delay
            setTimeout(startAnimation, data.delay);
        });

        // --- Player Character (The Crab) ---
        const player = document.createElement('div');
        player.innerHTML = `
            <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                <!-- Bottom Shell -->
                <path d="M10 60 Q 50 100 90 60 Q 90 40 50 40 Q 10 40 10 60" fill="#a29bfe" stroke="#6c5ce7" stroke-width="2"/>
                <path d="M20 60 Q 50 85 80 60" fill="none" stroke="#6c5ce7" stroke-width="1" opacity="0.5"/>
                
                <!-- Pearl -->
                <circle cx="50" cy="50" r="10" fill="url(#pearlGradient)">
                    <animate attributeName="r" values="9;11;9" dur="2s" repeatCount="indefinite" />
                </circle>
                <defs>
                    <radialGradient id="pearlGradient">
                        <stop offset="0%" stop-color="#fff" />
                        <stop offset="100%" stop-color="#dcdde1" />
                    </radialGradient>
                </defs>

                <!-- Top Shell -->
                <g class="top-shell">
                    <path d="M10 60 Q 50 20 90 60 Q 90 45 50 45 Q 10 45 10 60" fill="#a29bfe" stroke="#6c5ce7" stroke-width="2">
                        <animateTransform 
                            attributeName="transform" 
                            type="rotate" 
                            values="-20 50 60; -50 50 60; -20 50 60" 
                            dur="3s" 
                            repeatCount="indefinite" />
                    </path>
                    <!-- Shell Ridges -->
                    <path d="M30 50 Q 50 35 70 50" fill="none" stroke="#6c5ce7" stroke-width="1" opacity="0.3" transform="rotate(-5 50 60)"/>
                </g>

                <!-- Eyes (Cute Peeking Eyes) -->
                <g class="eyes">
                    <circle cx="42" cy="55" r="3" fill="black" />
                    <circle cx="58" cy="55" r="3" fill="black" />
                    <circle cx="41" cy="54" r="1" fill="white" />
                    <circle cx="57" cy="54" r="1" fill="white" />
                </g>
            </svg>
        `;
        player.style.position = 'absolute';
        player.style.bottom = '10px';
        player.style.left = '50%';
        player.style.transform = 'translateX(-50%)';
        player.style.width = '80px';
        player.style.height = '70px';
        player.style.zIndex = '100';
        player.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))';
        container.appendChild(player);

        // Movement Handler
        const updatePlayerPos = (x) => {
            const rect = container.getBoundingClientRect();
            let newLeft = x - rect.left;
            // Clamp
            newLeft = Math.max(40, Math.min(rect.width - 40, newLeft));
            player.style.left = newLeft + 'px';
        };

        const mouseMoveHandler = (e) => {
            if (!isActive) return;
            updatePlayerPos(e.clientX);
        };
        document.addEventListener('mousemove', mouseMoveHandler);

        // --- Arrays to track items ---
        let items = [];

        // --- Spawner ---
        const spawnItem = () => {
            if (!isActive) return;

            const isTrash = Math.random() > 0.4; // 60% trash
            const item = document.createElement('div');

            // Visuals
            const trashIcons = ['🥤', '🥡', '🛍️', '🥫', '🥾'];
            const fishIcons = ['🐟', '🐠', '🐡', '🦈', '🐙'];
            const icon = isTrash ? trashIcons[Math.floor(Math.random() * trashIcons.length)] : fishIcons[Math.floor(Math.random() * fishIcons.length)];

            item.innerText = icon;
            item.style.position = 'absolute';
            item.style.fontSize = '42px';
            item.style.width = '50px';
            item.style.height = '50px';
            item.style.display = 'flex';
            item.style.justifyContent = 'center';
            item.style.alignItems = 'center';
            item.style.borderRadius = '50%';
            item.style.top = '-50px';

            // VISUAL FIX: Glassmorphism background for item visibility (Blends with sea)
            item.style.background = 'rgba(255, 255, 255, 0.15)';
            item.style.backdropFilter = 'blur(6px) saturate(120%)';
            item.style.webkitBackdropFilter = 'blur(6px) saturate(120%)'; // Safari support
            item.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            item.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2), inset 0 0 10px rgba(255,255,255,0.2)';

            // Random horizontal position
            const maxLeft = container.clientWidth - 50;
            item.style.left = Math.random() * maxLeft + 'px';

            // Distinct Styles for Trash vs Fish
            if (isTrash) {
                // Trash: Grayscale, subtle shadow
                item.style.filter = "grayscale(0.2) drop-shadow(0 0 4px rgba(0,0,0,0.8))";
            } else {
                // Fish: Bright, glowy shadow
                item.style.filter = "drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))";
            }

            item.style.zIndex = "10"; // Above background, below player
            container.appendChild(item);

            items.push({
                el: item,
                isTrash: isTrash,
                speed: (Math.random() * 2 + 2) * (Game.state.difficulty || 1), // Base speed + difficulty
                y: -50,
                x: parseFloat(item.style.left)
            });
        };

        // --- Game Loop ---
        const loop = () => {
            if (!isActive) return;

            // Update Items
            for (let i = items.length - 1; i >= 0; i--) {
                const item = items[i];
                item.y += item.speed;
                item.el.style.top = item.y + 'px';

                // Collision Detection (Circle/Box approx)
                // Player is at bottom, fixed Y.
                // Player Rect:
                const playerRect = player.getBoundingClientRect();
                const itemRect = item.el.getBoundingClientRect();

                // Simple AABB collision
                const overlap = !(playerRect.right < itemRect.left ||
                    playerRect.left > itemRect.right ||
                    playerRect.bottom < itemRect.top ||
                    playerRect.top > itemRect.bottom);

                if (overlap) {
                    // HIT!
                    if (item.isTrash) {
                        // Good catch
                        score++;

                        // Clam Snap Animation (using the same player ref)
                        player.animate([
                            { transform: 'translateX(-50%) scale(1.1)' },
                            { transform: 'translateX(-50%) scale(1)' }
                        ], { duration: 100, easing: 'ease-out' });

                        // Feedback
                        const scorePop = document.createElement('div');
                        scorePop.innerText = "+1";
                        scorePop.style.position = 'absolute';
                        scorePop.style.left = item.x + 'px';
                        scorePop.style.top = item.y + 'px';
                        scorePop.style.color = '#0f0';
                        scorePop.style.fontWeight = 'bold';
                        scorePop.style.fontSize = '24px';
                        scorePop.animate([{ opacity: 1, top: item.y + 'px' }, { opacity: 0, top: (item.y - 50) + 'px' }], 500);
                        container.appendChild(scorePop);
                        setTimeout(() => scorePop.remove(), 500);

                        item.el.remove();
                        items.splice(i, 1);
                    } else {
                        // Bad catch (Fish)
                        isActive = false;
                        item.el.style.filter = "drop-shadow(0 0 20px red) brightness(2)";
                        onLose();
                    }
                } else if (item.y > container.clientHeight) {
                    // Reached bottom
                    if (item.isTrash) {
                        // Missed trash -> LOSE!
                        isActive = false;
                        onLose();
                    } else {
                        // Fish reached bottom -> OK
                        item.el.remove();
                        items.splice(i, 1);
                    }
                }
            }

            if (isActive) {
                animationFrameId = requestAnimationFrame(loop);
            }
        };

        // Start Loop
        animationFrameId = requestAnimationFrame(loop);

        // Spawn Interval
        const spawnLoop = setInterval(spawnItem, 1000 / (Game.state.difficulty || 1));


        // Bubbles effect (Ambient)
        const createBubble = () => {
            if (!isActive) return;
            const bubble = document.createElement('div');
            bubble.innerText = '∘';
            bubble.style.position = 'absolute';
            bubble.style.color = 'rgba(255, 255, 255, 0.3)';
            bubble.style.fontSize = Math.random() * 10 + 5 + 'px';
            bubble.style.left = Math.random() * 100 + '%';
            bubble.style.bottom = '-20px';
            container.appendChild(bubble);

            const anim = bubble.animate([
                { bottom: '-20px', opacity: 0 },
                { bottom: '100%', opacity: 0.8 },
                { bottom: '110%', opacity: 0 }
            ], {
                duration: Math.random() * 5000 + 3000,
                easing: 'linear'
            });

            anim.onfinish = () => bubble.remove();
            setTimeout(createBubble, Math.random() * 500 + 200);
        };
        createBubble();


        // Cleanup function
        Microgames.marineTrash.cleanup = () => {
            isActive = false;
            cancelAnimationFrame(animationFrameId);
            clearInterval(spawnLoop);
            document.removeEventListener('mousemove', mouseMoveHandler);
            container.innerHTML = '';
        };
    }
};

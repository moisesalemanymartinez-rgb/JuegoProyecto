window.Microgames = window.Microgames || {};

window.Microgames.finalBoss = {
    isBoss: true,
    instruction: "¡SUPER BARRIL BROS!",
    survive: false, // Wait until goal is reached (to be added)
    gameContainer: null,
    onWin: null,
    onLose: null,
    loopId: null,

    // Entities
    player: null,
    platforms: [],
    keys: {},

    // Camera/World
    worldWidth: 1000000,     // A virtually infinite width
    worldHeight: 0,

    // --- PLAYER STATE ---
    px: 50,
    py: 60,
    vx: 0,
    vy: 0,
    isGrounded: false,
    playerDir: 1,
    playerW: 100, // Adjusted for new proportions roughly
    playerH: 180,
    rotation: 0,

    // Animation Properties
    spriteFrames: 8, // Assuming 8 frames for a 824 width sprite
    frameIndex: 0,
    animTimer: 0,
    animSpeed: 100, // ms per frame

    init(container, winCallback, loseCallback) {
        this.gameContainer = container;
        this.onWin = winCallback;
        this.onLose = loseCallback;
        this.worldHeight = this.gameContainer.offsetHeight;

        // Container rules
        this.gameContainer.style.position = 'relative';
        this.gameContainer.style.width = '100%';
        this.gameContainer.style.height = '100%';
        this.gameContainer.style.overflow = 'hidden';
        // Set background image and properties explicitly
        this.gameContainer.style.background = "url('assets/bg.png') repeat-x center bottom";
        this.gameContainer.style.backgroundSize = "auto 100%"; // Scale to fit height, repeat width

        // We will move backgroundPosition manually instead of translating the world
        // so the background loops infinitely.

        // World wrapper
        this.world = document.createElement('div');
        this.world.style.position = 'absolute';
        this.world.style.width = `${this.worldWidth}px`;
        this.world.style.height = '100%';
        this.gameContainer.appendChild(this.world);

        // Generate Terrain (One continuous invisible floor for "infinite" running)
        this.platforms = [];
        const floorY = this.worldHeight - 60;

        // Single massive floor block
        this.createPlatform(0, floorY, this.worldWidth, 60);

        // --- PLAYER ELEMENT (SPRITE) ---
        this.player = document.createElement('div');
        this.player.style.position = 'absolute';
        this.player.style.width = `${this.playerW}px`;
        this.player.style.height = `${this.playerH}px`;
        this.player.style.backgroundImage = "url('assets/boss_sprite.png')";
        this.player.style.backgroundSize = `${this.spriteFrames * 100}% 100%`; // Scale to show 1 frame at a time
        this.player.style.backgroundRepeat = 'no-repeat';
        this.player.style.backgroundPosition = '0% 0%';
        this.player.style.transformOrigin = 'center';
        this.player.style.filter = "drop-shadow(2px 4px 6px rgba(0,0,0,0.3))";
        this.world.appendChild(this.player);

        // Start position
        this.px = 50;
        this.py = floorY - this.playerH;

        // Input
        this.keys = {};
        this.keyhandler = (e) => {
            // Prevent default scrolling for arrows and space
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = e.type === 'keydown';
        };
        this.blurhandler = () => { this.keys = {}; };
        window.addEventListener('keydown', this.keyhandler, { passive: false });
        window.addEventListener('keyup', this.keyhandler);
        window.addEventListener('blur', this.blurhandler);

        let lastTime = performance.now();
        const loop = (time) => {
            const dt = Math.min(time - lastTime, 50);
            lastTime = time;
            this.update(dt);
            this.draw();
            this.loopId = requestAnimationFrame(loop);
        };
        this.loopId = requestAnimationFrame(loop);
    },

    createPlatform(x, y, w, h) {
        const plat = document.createElement('div');
        plat.style.position = 'absolute';
        plat.style.left = `${x}px`;
        plat.style.top = `${y}px`;
        plat.style.width = `${w}px`;
        plat.style.height = `${h}px`;
        // Make the platform completely invisible for the illusion
        plat.style.opacity = '0';
        plat.style.background = 'transparent';

        this.world.appendChild(plat);
        this.platforms.push({ x, y, w, h, element: plat });
    },

    update(dt) {
        // ============================
        // 1. PLAYER INPUT & PHYSICS
        // ============================
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.vx -= 1.5;
            this.playerDir = -1;
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.vx += 1.5;
            this.playerDir = 1;
        }

        this.vx *= 0.8; // Friction

        if (Math.abs(this.vx) < 0.5) this.vx = 0;

        if ((this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space']) && this.isGrounded) {
            this.vy = -18; // Increased jump force slightly to compensate for feeling heavier
            this.isGrounded = false;
        }

        this.vy += 0.6; // Gravity

        if (this.vy > 15) this.vy = 15; // Terminal velocity

        // Move X and Check Collisions
        this.px += this.vx;
        this.checkCollisionsX();

        // Move Y and Check Collisions
        this.py += this.vy;
        this.checkCollisionsY();

        // Screen constraints (left only)
        if (this.px < 0) {
            this.px = 0;
            this.vx = 0;
        }

        // Endless fall check
        if (this.py > this.worldHeight + 100) {
            this.px = 50; // respawn at start instead of lose menu so player can test
            this.py = 50;
            this.vx = 0;
            this.vy = 0;
        }

        // ============================
        // 2. ANIMATION (Walking Spritesheet)
        // ============================
        if (Math.abs(this.vx) > 0.5) {
            // Player is moving
            this.animTimer += dt;
            if (this.animTimer >= this.animSpeed) {
                this.animTimer = 0;
                this.frameIndex = (this.frameIndex + 1) % this.spriteFrames;
            }
        } else {
            // Idle state
            this.frameIndex = 0;
            this.animTimer = 0;
        }
    },

    checkCollisionsX() {
        const pRect = { x: this.px, y: this.py, w: this.playerW, h: this.playerH };

        for (let plat of this.platforms) {
            if (this.isAABBIntersecting(pRect, plat)) {
                // Moving right
                if (this.vx > 0) {
                    this.px = plat.x - pRect.w;
                }
                // Moving left
                else if (this.vx < 0) {
                    this.px = plat.x + plat.w;
                }
                this.vx = 0;
            }
        }
    },

    checkCollisionsY() {
        const pRect = { x: this.px, y: this.py, w: this.playerW, h: this.playerH };
        let wasGrounded = this.isGrounded;
        this.isGrounded = false;

        for (let plat of this.platforms) {
            if (this.isAABBIntersecting(pRect, plat)) {
                // Falling down
                if (this.vy > 0) {
                    this.py = plat.y - pRect.h;
                    this.vy = 0;
                    this.isGrounded = true;
                }
                // Jumping up into something
                else if (this.vy < 0) {
                    this.py = plat.y + plat.h;
                    this.vy = 0;
                }
            }
        }

        // Squash and stretch effect on landing
        if (!wasGrounded && this.isGrounded) {
            this.player.style.transition = 'transform 0.1s ease-out';
            this.player.style.transform = `scale(1.2, 0.8)`;
            setTimeout(() => {
                if (this.player) {
                    this.player.style.transition = 'none';
                    this.player.style.transform = `scale(1, 1)`;
                }
            }, 100);
        }
    },

    isAABBIntersecting(r1, r2) {
        return r1.x < r2.x + r2.w &&
            r1.x + r1.w > r2.x &&
            r1.y < r2.y + r2.h &&
            r1.y + r1.h > r2.y;
    },

    draw() {
        // Camera Follow Logic (Infinite scrolling to the right)
        let cameraX = this.px - this.gameContainer.offsetWidth / 3;
        if (cameraX < 0) cameraX = 0;

        // Move the world container for entities
        this.world.style.transform = `translateX(${-cameraX}px)`;

        // Parallax/Scrolling Background Effect - move background position inversely
        this.gameContainer.style.backgroundPosition = `${-cameraX * 0.5}px bottom`;

        // Draw Player
        this.player.style.left = `${this.px}px`;
        this.player.style.top = `${this.py}px`;

        // Player Direction (Flip horizontally if moving left)
        let scaleX = this.playerDir === -1 ? -1 : 1;
        let scaleY = 1;

        // Set squash ONLY if transitioning (handled by landing timeout)
        if (this.player.style.transition && this.player.style.transition !== 'none' && this.player.style.transition !== 'none 0s ease 0s') {
            // Keep the scale set by the squashing timeout, but incorporate direction
            scaleY = 0.8;
            scaleX = scaleX * 1.2;
        }

        this.player.style.transform = `scale(${scaleX}, ${scaleY})`;

        // Update Sprite Frame (using percentages)
        let bgPos = 0;
        if (this.spriteFrames > 1) {
            bgPos = (this.frameIndex / (this.spriteFrames - 1)) * 100;
        }
        this.player.style.backgroundPosition = `${bgPos}% 0%`;
    },

    cleanup() {
        cancelAnimationFrame(this.loopId);
        window.removeEventListener('keydown', this.keyhandler);
        window.removeEventListener('keyup', this.keyhandler);
    }
};

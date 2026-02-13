window.Microgames.spaceInvaders = {
    instruction: "BATTLE FOR PROFIT!",
    isBoss: true,
    init: (container, onWin, onLose) => {
        // Ship state
        let shipX = 50;
        const ship = document.createElement('div');
        ship.className = 'space-ship';
        ship.style.left = shipX + '%';
        container.appendChild(ship);

        // State
        const bullets = [];
        const enemies = [];
        // Unique ODS-like colors
        const colors = ['#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2', '#FCC30B', '#A21942'];

        let lastShot = 0;
        let score = 0;
        const targetLines = 4;
        const targetCols = 8;
        const totalEnemies = targetLines * targetCols;

        // Create Enemies
        for (let r = 0; r < targetLines; r++) {
            for (let c = 0; c < targetCols; c++) {
                const enemy = document.createElement('div');
                enemy.className = 'enemy-logo';
                enemy.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                enemy.style.borderRadius = '4px';
                enemy.style.left = (15 + c * 10) + '%';
                enemy.style.top = (10 + r * 10) + '%';
                container.appendChild(enemy);
                enemies.push({
                    el: enemy,
                    x: 15 + c * 10,
                    y: 10 + r * 10,
                    alive: true
                });
            }
        }

        // Controls
        const keys = {};
        const onKeyDown = (e) => keys[e.code] = true;
        const onKeyUp = (e) => keys[e.code] = false;
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        let enemyDir = 1;

        const loop = () => {
            // Ship Movement
            if (keys['ArrowLeft'] || keys['KeyA']) shipX = Math.max(5, shipX - 1.5);
            if (keys['ArrowRight'] || keys['KeyD']) shipX = Math.min(95, shipX + 1.5);
            ship.style.left = shipX + '%';

            // Shooting
            if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && Date.now() - lastShot > 400) {
                const bullet = document.createElement('div');
                bullet.className = 'bullet';
                bullet.style.left = shipX + '%';
                bullet.style.bottom = '60px';
                container.appendChild(bullet);
                bullets.push({ el: bullet, x: shipX, y: 10 });
                lastShot = Date.now();
            }

            // Move Bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.y += 2.5;
                b.el.style.bottom = (60 + b.y * 10) + 'px';

                const bRect = b.el.getBoundingClientRect();
                enemies.forEach(e => {
                    if (e.alive) {
                        const eRect = e.el.getBoundingClientRect();
                        if (bRect.left < eRect.right && bRect.right > eRect.left &&
                            bRect.top < eRect.bottom && bRect.bottom > eRect.top) {
                            e.alive = false;
                            e.el.style.opacity = '0';
                            b.y = 200; // Despawn
                            score++;
                        }
                    }
                });

                if (b.y > 100) {
                    b.el.remove();
                    bullets.splice(i, 1);
                }
            }

            // Move Enemies
            let hitEdge = false;
            enemies.forEach(e => {
                if (e.alive) {
                    e.x += 0.3 * enemyDir;
                    e.el.style.left = e.x + '%';
                    if (e.x > 90 || e.x < 5) hitEdge = true;
                }
            });

            if (hitEdge) {
                enemyDir *= -1;
                enemies.forEach(e => {
                    if (e.alive) {
                        e.y += 3;
                        e.el.style.top = e.y + '%';
                        if (e.y > 75) onLose();
                    }
                });
            }

            if (score >= totalEnemies) {
                onWin();
                return;
            }

            window.Microgames.spaceInvaders.raf = requestAnimationFrame(loop);
        };
        loop();

        window.Microgames.spaceInvaders.cleanup = () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            cancelAnimationFrame(window.Microgames.spaceInvaders.raf);
        };
    }
};

// --- Microgames (SDG 2 Edition - Zero Hunger) ---
Microgames.pizzaZero = {
    instruction: "MAKE A PIZZA! (SDG 2)",
    init: (container, onWin, onLose) => {
        let score = 0;
        const targetScore = 5;
        // Ingredients mapped to type
        const ingredients = [
            { char: '🍅', type: 'sauce' },
            { char: '🧀', type: 'cheese' },
            { char: '🌿', type: 'topping' },
            { char: '🍕', type: 'topping' },
            { char: '🥓', type: 'topping' },
            { char: '🧅', type: 'topping' },
            { char: '🫑', type: 'topping' },
            { char: '🥓', type: 'topping' },
            { char: '🍤', type: 'topping' },
            { char: '🍍', type: 'topping' }
        ];
        const trash = [
            '🐟', '🥫', '👞', '☠️', '🕷️',
            '💣', '💩', '🌵', '🔋', '🧦',
            '🧱', '📎'
        ];

        // Visual Setup
        container.style.background = "#f4a460"; // Wooden table color
        container.style.position = 'relative';

        // Pizza Dough Group
        const dough = document.createElement('div');
        dough.className = 'pizza-dough';

        // Layers
        const sauceLayer = document.createElement('div');
        sauceLayer.className = 'pizza-layer sauce';
        dough.appendChild(sauceLayer);

        const cheeseLayer = document.createElement('div');
        cheeseLayer.className = 'pizza-layer cheese';
        dough.appendChild(cheeseLayer);

        container.appendChild(dough);

        // State tracking
        let hasSauce = false;
        let hasCheese = false;

        // Spawn Interval
        let spawnTimer;

        const spawnIngredient = () => {
            if (Game.state.lives <= 0) return;

            const isGood = Math.random() > 0.4;
            let contentObj = null;
            let char = '';

            if (isGood) {
                // Logic: Prioritize sauce, then cheese, then toppings
                if (!hasSauce && Math.random() > 0.2) {
                    contentObj = ingredients.find(i => i.type === 'sauce');
                } else if (hasSauce && !hasCheese && Math.random() > 0.3) {
                    contentObj = ingredients.find(i => i.type === 'cheese');
                } else {
                    // Filter out sauce/cheese if already present to avoid duplicates
                    const available = ingredients.filter(i => {
                        if (i.type === 'sauce' && hasSauce) return false;
                        if (i.type === 'cheese' && hasCheese) return false;
                        return true;
                    });
                    contentObj = available[Math.floor(Math.random() * available.length)];
                }
                char = contentObj.char;
            } else {
                char = trash[Math.floor(Math.random() * trash.length)];
            }

            const item = document.createElement('div');
            item.className = 'ingredient-item';
            item.innerText = char;
            item.dataset.type = isGood ? 'good' : 'bad';
            if (isGood) item.dataset.ingType = contentObj.type;

            // Position
            const size = 80; // Bigger Ingredients
            const x = Math.random() * (container.clientWidth - size);
            item.style.left = x + 'px';
            item.style.top = '-80px';

            container.appendChild(item);

            const duration = (1500 + Math.random() * 1000) / Game.state.difficulty;
            const anim = item.animate([
                { top: '-80px', transform: 'rotate(0deg)' },
                { top: (container.clientHeight + 80) + 'px', transform: `rotate(${Math.random() * 360}deg)` }
            ], {
                duration: duration,
                easing: 'linear'
            });

            anim.onfinish = () => item.remove();

            // INTERACTION LOGIC
            const startDrag = (e) => {
                // 1. Check for Bad Item -> Instant Loss
                if (item.dataset.type === 'bad') {
                    item.style.background = 'red';
                    clearInterval(spawnTimer);
                    onLose();
                    return;
                }

                // 2. Check for Sauce/Cheese -> Click Logic
                const type = item.dataset.ingType;
                if (type === 'sauce' || type === 'cheese') {
                    score++;
                    item.remove();

                    if (type === 'sauce') {
                        sauceLayer.style.transform = 'scale(1)';
                        sauceLayer.style.opacity = '1';
                        hasSauce = true;
                    } else if (type === 'cheese') {
                        cheeseLayer.style.transform = 'scale(1)';
                        cheeseLayer.style.opacity = '1';
                        hasCheese = true;
                    }

                    if (score >= targetScore) {
                        clearInterval(spawnTimer);
                        onWin();
                    }
                    return;
                }

                // 3. Toppings -> Drag Logic
                e.preventDefault();
                e.stopPropagation();

                let isDragging = true;

                // We must cancel the animation to free the 'top' property
                // But first, capture the current position/transform so it doesn't jump
                const computed = window.getComputedStyle(item);
                const currentTop = computed.top;
                const currentLeft = computed.left;
                const currentTransform = computed.transform;

                item.style.top = currentTop;
                item.style.left = currentLeft;
                item.style.transform = currentTransform;

                anim.cancel();
                item.style.zIndex = 1000;

                const rect = item.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Mouse/Touch coordinates
                const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
                const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);

                // Offset to grab point (optional, centering is easier)
                const offsetWidth = rect.width;
                const offsetHeight = rect.height;

                const moveHandler = (moveEvent) => {
                    if (!isDragging) return;
                    const mx = moveEvent.clientX || (moveEvent.touches ? moveEvent.touches[0].clientX : 0);
                    const my = moveEvent.clientY || (moveEvent.touches ? moveEvent.touches[0].clientY : 0);

                    // Move centered on cursor
                    item.style.left = (mx - containerRect.left - offsetWidth / 2) + 'px';
                    item.style.top = (my - containerRect.top - offsetHeight / 2) + 'px';
                };

                const upHandler = () => {
                    isDragging = false;
                    document.removeEventListener('mousemove', moveHandler);
                    document.removeEventListener('mouseup', upHandler);
                    document.removeEventListener('touchmove', moveHandler);
                    document.removeEventListener('touchend', upHandler);

                    // Collision Check
                    const itemRect = item.getBoundingClientRect();
                    const doughRect = dough.getBoundingClientRect();

                    const centerX = itemRect.left + itemRect.width / 2;
                    const centerY = itemRect.top + itemRect.height / 2;
                    const doughCX = doughRect.left + doughRect.width / 2;
                    const doughCY = doughRect.top + doughRect.height / 2;

                    const dist = Math.sqrt(Math.pow(centerX - doughCX, 2) + Math.pow(centerY - doughCY, 2));

                    if (dist < doughRect.width / 2) {
                        // Success Drop
                        score++;
                        item.remove();

                        const topping = document.createElement('div');
                        topping.innerText = char;
                        topping.className = 'topping-on-pizza';
                        // Rel position
                        topping.style.left = (150 + (centerX - doughCX)) + 'px';
                        topping.style.top = (150 + (centerY - doughCY)) + 'px';
                        dough.appendChild(topping);

                        if (score >= targetScore) {
                            clearInterval(spawnTimer);
                            onWin();
                        }
                    } else {
                        // Failed Drop - Remove item or let it fall? Removing is cleaner for now.
                        item.remove();
                    }
                };

                document.addEventListener('mousemove', moveHandler);
                document.addEventListener('mouseup', upHandler);
                document.addEventListener('touchmove', moveHandler, { passive: false });
                document.addEventListener('touchend', upHandler);
            };

            item.onmousedown = startDrag;
            item.ontouchstart = startDrag;
        };

        const spawnRate = 800 / Game.state.difficulty;
        spawnTimer = setInterval(spawnIngredient, spawnRate);
        spawnIngredient();

        Microgames.pizzaZero.cleanupFunc = () => {
            clearInterval(spawnTimer);
        };
    },
    cleanup: () => {
        if (Microgames.pizzaZero.cleanupFunc) Microgames.pizzaZero.cleanupFunc();
        const gameArea = document.getElementById('game-area');
        if (gameArea) {
            gameArea.style.background = "";
        }
    }
};

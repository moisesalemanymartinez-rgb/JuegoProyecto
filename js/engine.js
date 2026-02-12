// --- Game Engine ---
const Game = {
    state: {
        score: 0,
        lives: 4,
        difficulty: 1.0,
        isPlaying: false
    },
    config: {
        baseTime: 10000, // 10s base time
        transitionTime: 2000,
        resultTime: 1000
    },
    timer: {
        id: null,
        start: 0,
        duration: 0
    },

    // Core DOM Elements
    screens: {
        start: document.getElementById('screen-start'),
        transition: document.getElementById('screen-transition'),
        game: document.getElementById('screen-game'),
        result: document.getElementById('screen-result'),
        gameover: document.getElementById('screen-gameover')
    },

    hud: {
        score: document.getElementById('score-val'),
        lives: document.querySelector('.lives'),
        resultMsg: document.getElementById('result-msg'),
        timerBar: document.getElementById('timer-bar')
    },

    mascot: {
        bubble: document.getElementById('mascot-bubble'),
        timeout: null,
        say(text, duration = 2000) {
            clearTimeout(this.timeout);
            this.bubble.innerText = text;
            this.bubble.classList.add('visible');
            this.timeout = setTimeout(() => {
                this.bubble.classList.remove('visible');
            }, duration);
        },
        react(type) {
            const lines = {
                win: ["Nice Shot!", "Eco-Warrior!", "Clean Air!", "Ice Work!", "Cool!", "Awesome!"],
                lose: ["Oh no!", "Pollution!", "Cough Cough!", "Help me!", "Focus!", "Smoggy..."],
                start: ["Let's clean up!", "Save the planet!", "Ready?"],
                gameover: ["We failed...", "Try again!", "Don't give up!"]
            };
            const choice = lines[type][Math.floor(Math.random() * lines[type].length)];
            this.say(choice);
        }
    },

    start() {
        this.state.score = 0;
        this.state.lives = 4;
        this.state.difficulty = 1.0;
        this.updateHUD();
        this.mascot.react('start');
        this.nextRound();
    },

    updateHUD() {
        this.hud.score.innerText = this.state.score;
        this.hud.lives.innerText = '♥'.repeat(Math.max(0, this.state.lives));
    },

    showScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[name].classList.add('active');
    },

    nextRound() {
        if (this.state.lives <= 0) {
            this.gameOver();
            return;
        }

<<<<<<< HEAD
        // DYNAMIC GAME SELECTION (SHUFFLE BAG)
        const availableGames = Object.keys(window.Microgames || {});

        if (availableGames.length === 0) {
            console.error("No games loaded!");
            return;
        }

        // Initialize or Refill Bag if empty
        if (!this.state.gameBag || this.state.gameBag.length === 0) {
            console.log("Refilling Game Bag...");
            this.state.gameBag = [...availableGames];

            // Fisher-Yates Shuffle
            for (let i = this.state.gameBag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.state.gameBag[i], this.state.gameBag[j]] = [this.state.gameBag[j], this.state.gameBag[i]];
            }
        }

        const nextKey = this.state.gameBag.pop();
        console.log("Selected Game:", nextKey, "Remaining in Bag:", this.state.gameBag);

        const gameModule = window.Microgames[nextKey];

=======
        // Bag Randomization (Play all games before repeating)
        if (!this.gameQueue || this.gameQueue.length === 0) {
            const games = Object.keys(Microgames);
            // Shuffle
            for (let i = games.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [games[i], games[j]] = [games[j], games[i]];
            }

            // Prevent duplicate across bag boundaries
            if (this.lastGameKey && games[0] === this.lastGameKey && games.length > 1) {
                // Swap first with end to avoid repetition
                [games[0], games[games.length - 1]] = [games[games.length - 1], games[0]];
            }

            this.gameQueue = games;
        }

        const nextKey = this.gameQueue.shift();
        this.lastGameKey = nextKey;
        const gameModule = Microgames[nextKey];
>>>>>>> 197a70f0576f20db128d4459a718cf399cc8112e
        this.currentGame = { key: nextKey, module: gameModule };

        // Transition Screen
        document.getElementById('msg-instruction').innerText = gameModule.instruction;
        this.showScreen('transition');

        // Difficulty Speedup
        this.state.difficulty = 1.0 + (this.state.score * 0.1);
        const waitTime = Math.max(1000, this.config.transitionTime - (this.state.score * 50));

        setTimeout(() => {
            this.playGame();
        }, waitTime);
    },

    playGame() {
        this.showScreen('game');
        document.getElementById('game-instruction').innerText = this.currentGame.module.instruction;
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = ''; // Clean previous

        // Start Timer
        const timeAvailable = Math.max(3000, this.config.baseTime / this.state.difficulty);
        console.log(`[Engine] Starting Round. Difficulty: ${this.state.difficulty}, Time: ${timeAvailable}ms`);
        this.startTimer(timeAvailable);

        // Initialize Game
        this.currentGame.module.init(gameArea,
            () => this.onWin(),
            () => this.onLose()
        );
    },

    startTimer(ms) {
        cancelAnimationFrame(this.timer.id);
        this.timer.start = performance.now();
        this.timer.duration = ms;

        const frame = (now) => {
            const elapsed = now - this.timer.start;
            const remaining = Math.max(0, this.timer.duration - elapsed);
            const pct = (remaining / this.timer.duration);

            this.hud.timerBar.style.transform = `scaleX(${pct})`;

            if (remaining > 0) {
                this.timer.id = requestAnimationFrame(frame);
            } else {
                this.onLose(true); // Timeout
            }
        };
        this.timer.id = requestAnimationFrame(frame);
    },

    stopTimer() {
        cancelAnimationFrame(this.timer.id);
    },

    onWin() {
        this.stopTimer();
        this.cleanup();
        this.state.score++;
        this.updateHUD();

        this.hud.resultMsg.innerText = "SUCCESS!";
        this.hud.resultMsg.style.color = "var(--primary)";
        this.showScreen('result');

        this.mascot.react('win');

        setTimeout(() => this.nextRound(), this.config.resultTime);
    },

    onLose(isTimeout = false) {
        console.log(`[Engine] Game Lost. IsTimeout: ${isTimeout}`);
        this.stopTimer();
        this.cleanup();
        this.state.lives--;
        this.updateHUD();

        this.hud.resultMsg.innerText = isTimeout ? "TOO SLOW!" : "FAIL!";
        this.hud.resultMsg.style.color = "var(--secondary)";
        this.showScreen('result');
        document.getElementById('console-container').classList.add('shake');
        setTimeout(() => document.getElementById('console-container').classList.remove('shake'), 500);

        this.mascot.react('lose');

        setTimeout(() => this.nextRound(), this.config.resultTime);
    },

    cleanup() {
        // Generic Cleanup
        const gameArea = document.getElementById('game-area');
        // Remove all listeners by cloning the node? Or rely on innerHTML = '' clearing simple listeners.
        // Best practice: innerHTML='' is usually enough for simple inline/attached listeners if no global refs exist.
        // If specific cleanup is needed, module provides it.
        if (this.currentGame.module.cleanup) {
            this.currentGame.module.cleanup();
        }
        gameArea.innerHTML = '';
    },

    gameOver() {
        document.getElementById('final-score').innerText = this.state.score;
        this.showScreen('gameover');
        this.mascot.react('gameover');
    }
};

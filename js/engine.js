// --- Game Engine ---
const Game = {
    state: {
        score: 0,
        lives: 4,
        difficulty: 1.0,
        isPlaying: false,
        level15Seen: false
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
        container: document.getElementById('mascot-container'),
        penguin: document.querySelector('.penguin'),
        bubble: document.getElementById('mascot-bubble'),
        timeout: null,
        moodTimeout: null,

        say(text, duration = 2000) {
            clearTimeout(this.timeout);
            this.bubble.innerText = text;
            this.bubble.classList.add('visible');
            this.timeout = setTimeout(() => {
                this.bubble.classList.remove('visible');
            }, duration);
        },

        setMood(type) {
            clearTimeout(this.moodTimeout);
            console.log(`[Mascot] Setting Mood: ${type}`);

            const classes = ['mascot-jump', 'mascot-sad', 'mascot-flip', 'mascot-spin', 'mascot-tremble', 'mascot-shrink', 'mascot-bounce', 'mascot-glow', 'mascot-swing', 'mascot-shake-hard'];
            this.penguin.classList.remove(...classes);

            void this.penguin.offsetWidth; // Force reflow

            const moodMap = {
                'win': 'mascot-jump',
                'flip': 'mascot-flip',
                'spin': 'mascot-spin',
                'bounce': 'mascot-bounce',
                'glow': 'mascot-glow',
                'swing': 'mascot-swing',
                'lose': 'mascot-sad',
                'tremble': 'mascot-tremble',
                'shake-hard': 'mascot-shake-hard',
                'gameover': 'mascot-shrink'
            };

            const targetClass = moodMap[type];
            if (targetClass) {
                this.penguin.classList.add(targetClass);
                console.log(`[Mascot] Added Class: ${targetClass}`);
            }
        },

        react(type) {
            const lines = {
                win: [
                    "¡Así me gusta, fiera!",
                    "¡Qué sexy te ves ganando!",
                    "¡Uff, me pones los pelos de punta!",
                    "¡Dominas como nadie, bombón!",
                    "¡Eso ha sido... excitante!",
                    "¡Vaya ritmo llevas, tigre!",
                    "¿Ya has acabado? Pensaba que durarías menos...",
                    "No está mal para ser tú, pero no te acostumbres.",
                    "¡Uy! Casi parece que sabes lo que haces.",
                    "¿Te doy un aplauso o seguimos con la humillación?",
                    "Mira qué orgulloso... si solo has pulsado un botón.",
                    "Aceptable. Ni que fueras un genio, pero aceptable.",
                    "¡Esa es mi marioneta favorita!",
                    "¡Uf, casi me haces sudar de la emoción (es broma)!",
                    "¿Ha sido suerte o es que hoy te has tomado la medicación?",
                    "¡Brillante! Bueno, 'brillante' según tus estándares.",
                    "¡Toma ya! ¿Ves como si te grito funcionas mejor?",
                    "¡Eso es! Sigue así y quizá te deje limpiar mis pies."
                ],
                lose: [
                    "¡¿Pero qué haces, inútil?!",
                    "¡Mi abuela juega mejor y está muerta!",
                    "¡¿Tienes muñones en vez de manos?!",
                    "¡Me das vergüenza ajena!",
                    "¡Espabila o te meto en el congelador!",
                    "¡Vaya desastre de humano!",
                    "¿Eso es todo? Qué decepción más previsible.",
                    "Si el fracaso fuera un arte, tú serías el Louvre.",
                    "¿Buscas el botón de 'Soy un manco'? No existe.",
                    "¡Patético! Hasta un percebe tendría mejores reflejos.",
                    "¿Te has distraído con una mosca o es que eres así de lento?",
                    "¡Ugh! Mis ojos... me duelen de verte fallar tanto.",
                    "¿En serio? ¿Ese es tu máximo esfuerzo? Da lástima.",
                    "¡Vaya tela! Para esto mejor quédate en la cama.",
                    "¡Ni con un mapa encontrarías la victoria!"
                ],
                start: [
                    "¡Muéveme ese cuerpo!",
                    "¿A ver de qué eres capaz, guapo?",
                    "¡Dale caña o vete a casa!",
                    "¡Enséñame lo que tienes!",
                    "¿Vas a jugar o vas a mirar mis curvas?",
                    "¡Venga, demuéstrame que no eres un completo inútil!",
                    "¡Muévete! Que el tiempo es oro y mi paciencia es poca.",
                    "¿Preparado para fallar miserablemente ante mis ojos?",
                    "¡A por ellos, tigre! (Intenta no caerte de camino)."
                ],
                gameover: [
                    "¡A la calle por paquete!",
                    "¡Das pena, retírate!",
                    "¡Vuelve cuando no seas un manco!",
                    "¡Ni para limpiar sirves!",
                    "Game Over. Como tu dignidad.",
                    "¡A llorar a la llorería! Aquí no queremos perdedores.",
                    "¡Menudo espectáculo más bochornoso! ¡Fuera!",
                    "¿Ya te vas? Normal, yo también me daría asco.",
                    "¡Hala, a pastar! No vuelvas hasta que aprendas a usar los dedos."
                ]
            };

            let phraseList = lines[type];

            // Level 14: English Mode (President Style)
            // Use Game.state.score if this.state is not available (checking context)
            const currentScore = Game.state.score;

            if (currentScore >= 14) {
                const linesEnglish = {
                    win: ["Tremendous!", "Huge win!", "Make Gaming Great Again!", "Bigly!", "You're a winner!", "I know winning.", "So much winning!", "Best score ever.", "China can't beat this."],
                    lose: ["Sad!", "Fake news!", "You're fired!", "Low energy.", "Disaster!", "Total disaster!", "Rigged!", "Nasty!", "I don't like losers."],
                    start: ["Let's make it great!", "It's gonna be huge.", "Believe me.", "I have the best words.", "I build the best levels."],
                    gameover: ["STOP THE COUNT!", "Witch hunt!", "I won, by a lot!", "Fake media!", "Rigged election!"]
                };
                if (linesEnglish[type]) {
                    phraseList = linesEnglish[type];
                }
            }

            if (phraseList && phraseList.length > 0) {
                const choice = phraseList[Math.floor(Math.random() * phraseList.length)];
                this.say(choice);
            }

            // Logic to choose animation based on type (High Frequency)
            if (type === 'win') {
                const winAnims = ['flip', 'spin', 'bounce', 'glow', 'swing', 'win'];
                const special = winAnims[Math.floor(Math.random() * winAnims.length)];
                this.setMood(special);
            } else if (type === 'lose') {
                const loseAnims = ['tremble', 'shake-hard', 'lose'];
                const special = loseAnims[Math.floor(Math.random() * loseAnims.length)];
                this.setMood(special);
            } else if (type === 'gameover') {
                this.setMood('gameover');
            } else {
                this.setMood(type);
            }

            // Reset mood after a while if not gameover
            if (type !== 'gameover') {
                this.moodTimeout = setTimeout(() => {
                    this.penguin.classList.remove('mascot-jump', 'mascot-sad', 'mascot-flip', 'mascot-spin', 'mascot-tremble', 'mascot-shrink', 'mascot-bounce', 'mascot-glow', 'mascot-swing', 'mascot-shake-hard');
                }, 1500); // Shorter cooldown
            }
        }
    },

    start() {
        this.state.score = 0;
        this.state.lives = 4;
        this.state.difficulty = 1.0;
        this.state.level15Seen = false;
        // Reset console destruction
        document.querySelectorAll('.screen-crack').forEach(c => c.remove());
        const damage = document.getElementById('damage-overlay');
        if (damage) damage.style.opacity = 0;
        const frame = document.getElementById('console-frame');
        frame.classList.remove('console-broken');
        frame.style.display = '';
        frame.style.visibility = '';
        this.mascot.container.classList.remove('mascot-ascended');

        this.updateHUD();
        this.mascot.penguin.classList.remove('gentleman');
        this.mascot.penguin.classList.remove('president');
        this.mascot.react('start');
        this.nextRound();
    },

    updateHUD() {
        const frame = document.getElementById('console-frame');
        const isBroken = frame && frame.classList.contains('console-broken');
        const bossLayer = document.getElementById('boss-layer');

        if (isBroken && !bossLayer.querySelector('#hud')) {
            const hud = document.getElementById('hud');
            if (hud) bossLayer.appendChild(hud);
        }

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

        // --- SPECIAL EVENT: Level 15 ---
        if (this.state.score === 15 && !this.state.level15Seen) {
            this.startLevel15Sequence();
            return;
        }

        // DYNAMIC GAME SELECTION (SHUFFLE BAG)
        // const availableGames = Object.keys(window.Microgames || {});
        const availableGames = ['educationalBattle'];

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

            // Prevent duplicate across bag boundaries
            // We pop from the end, so the next game is gameBag[gameBag.length - 1]
            if (this.lastGameKey && this.state.gameBag[this.state.gameBag.length - 1] === this.lastGameKey && this.state.gameBag.length > 1) {
                // Swap the last element with one that is not the last
                const swapIdx = Math.floor(Math.random() * (this.state.gameBag.length - 1));
                [this.state.gameBag[this.state.gameBag.length - 1], this.state.gameBag[swapIdx]] = [this.state.gameBag[swapIdx], this.state.gameBag[this.state.gameBag.length - 1]];
            }
        }

        const nextKey = this.state.gameBag.pop();
        this.lastGameKey = nextKey;
        console.log("Selected Game:", nextKey);

        const gameModule = window.Microgames[nextKey];
        this.currentGame = { key: nextKey, module: gameModule };

        // Transition Screen
        document.getElementById('msg-instruction').innerText = gameModule.instruction;
        this.showScreen('transition');

        // Difficulty Speedup
        this.state.difficulty = 1.0 + (this.state.score * 0.05);
        const waitTime = Math.max(1000, this.config.transitionTime - (this.state.score * 50));

        setTimeout(() => {
            this.playGame();
        }, waitTime);
    },

    playGame() {
        this.showScreen('game');
        document.getElementById('game-instruction').innerText = this.currentGame.module.instruction;

        // --- Use boss-layer if console is broken ---
        const frame = document.getElementById('console-frame');
        const isBroken = frame && frame.classList.contains('console-broken');
        const bossLayer = document.getElementById('boss-layer');

        let gameArea;
        if (isBroken) {
            bossLayer.classList.add('active');
            gameArea = bossLayer;
        } else {
            bossLayer.classList.remove('active');
            gameArea = document.getElementById('game-area');
        }

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
                if (this.currentGame.module.survive) {
                    this.onWin(); // Survived!
                } else {
                    this.onLose(true); // Timeout
                }
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
        this.updateCracks();

        this.hud.resultMsg.innerText = "SUCCESS!";
        this.hud.resultMsg.style.color = "var(--primary)";
        this.showScreen('result');

        this.mascot.react('win');

        // Check for Transformation (Score 5 -> Level 5, Score 10 -> Level 10)
        if (this.state.score >= 10) {
            this.mascot.penguin.classList.remove('gentleman');
            this.mascot.penguin.classList.add('president');
        } else if (this.state.score >= 5) {
            this.mascot.penguin.classList.add('gentleman');
        }

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
    },

    updateCracks() {
        if (this.state.score > 0 && this.state.score < 15) {
            // Progressive damage overlay
            const damage = document.getElementById('damage-overlay');
            if (damage) {
                damage.style.opacity = (this.state.score / 15) * 0.8;
            }

            // Periodic cracks (every 2 levels now for more progression)
            if (this.state.score % 2 === 0) {
                const crackNum = Math.min(7, Math.floor(this.state.score / 2));
                const wrapper = document.getElementById('console-screen-wrapper');
                if (wrapper && !document.querySelector(`.crack-${crackNum}`)) {
                    const crack = document.createElement('div');
                    crack.className = `screen-crack crack-${crackNum}`;
                    wrapper.appendChild(crack);
                    console.log(`[Engine] Added Crack ${crackNum}`);
                }
            }
        }
    },

    // --- LEVEL 15 SEQUENCE ---
    startLevel15Sequence() {
        console.log("[Engine] Starting Level 15 Special Sequence");
        this.state.level15Seen = true;
        this.state.dialogueIndex = 0;
        this.state.dialogues = [
            "¿Sí? ¿Así que te crees el mejor?",
            "Parece que no has tenido suficiente, parece que no has aprendido que los ODS no importan, lo único importante es el dinero...",
            "¡MAKE AMERICA GREAT AGAIN!"
        ];

        // Transition Screen as backdrop (Cracked)
        document.getElementById('msg-instruction').innerText = "ERROR 404";
        this.showScreen('transition');

        // Initial dialogue
        this.mascot.say(this.state.dialogues[0], 60000);

        const advance = (e) => {
            if (e.type === 'keydown' || e.type === 'mousedown') {
                this.state.dialogueIndex++;
                if (this.state.dialogueIndex < this.state.dialogues.length) {
                    this.mascot.say(this.state.dialogues[this.state.dialogueIndex], 60000);
                } else {
                    window.removeEventListener('keydown', advance);
                    window.removeEventListener('mousedown', advance);

                    // --- DESTRUCTION ---
                    const frame = document.getElementById('console-frame');
                    frame.classList.add('console-broken');
                    this.mascot.container.classList.add('mascot-ascended');

                    // Force Boss Fight
                    const nextKey = 'spaceInvaders';
                    const gameModule = window.Microgames[nextKey];
                    this.currentGame = { key: nextKey, module: gameModule };
                    this.lastGameKey = nextKey;

                    setTimeout(() => {
                        console.log("[Engine] Climax reached. Starting Boss Fight!");
                        this.playGame();
                    }, 1500); // Wait for explosion animation
                }
            }
        };

        window.addEventListener('keydown', advance);
        window.addEventListener('mousedown', advance);
    }
};
// --- Cheat Code ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'k' || e.key === 'K') {
        if (!Game.state.isPlaying && Game.state.lives > 0) {
            // Maybe allow outside game? Or only in game. Let's allow anytime for testing.
        }
        Game.state.score++;
        Game.updateHUD();
        console.log(`[Cheat] Score: ${Game.state.score}`);

        // Trigger Tuxedo Check
        if (Game.state.score >= 10) {
            Game.mascot.penguin.classList.remove('gentleman');
            Game.mascot.penguin.classList.add('president');
        } else if (Game.state.score >= 5) {
            Game.mascot.penguin.classList.add('gentleman');
        }
    }
});

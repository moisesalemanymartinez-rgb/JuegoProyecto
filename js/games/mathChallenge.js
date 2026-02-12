// --- Microgames (SDG 4 Edition - Quality Education) ---
window.Microgames = window.Microgames || {};

window.Microgames.mathChallenge = {
    instruction: "SOLVE 3 OPERATIONS!",
    init: (container, onWin, onLose) => {
        let currentScore = 0;
        const targetScore = 3;
        let isGameOver = false;

        // Visual Setup
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.background = '#2c3e50';
        container.style.color = 'white';
        container.style.fontFamily = "'VT323', monospace";

        // Progress Text
        const progressDiv = document.createElement('div');
        progressDiv.style.fontSize = '2rem';
        progressDiv.style.marginBottom = '10px';
        container.appendChild(progressDiv);

        // Operation Text
        const opDiv = document.createElement('div');
        opDiv.style.fontSize = '4.5rem';
        opDiv.style.marginBottom = '20px';
        container.appendChild(opDiv);

        // Grid for Buttons
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        grid.style.gap = '15px';
        grid.style.width = '80%';
        container.appendChild(grid);

        const updateUI = () => {
            progressDiv.innerText = `PROGRESS: ${currentScore}/${targetScore}`;
            grid.innerHTML = '';

            // Generate Operation - Increased Difficulty
            // Level 1: Addition/Subtraction up to 50
            // Level 2: Multiplication up to 12
            // Level 3: Mixed

            let num1, num2, operation, correctAnswer;
            const level = currentScore; // 0, 1, 2

            if (level === 0) {
                // Hard addition/subtraction
                num1 = Math.floor(Math.random() * 40) + 10;
                num2 = Math.floor(Math.random() * 40) + 10;
                operation = Math.random() > 0.5 ? '+' : '-';
                correctAnswer = operation === '+' ? (num1 + num2) : (num1 - num2);
            } else if (level === 1) {
                // Multiplication
                num1 = Math.floor(Math.random() * 8) + 3;
                num2 = Math.floor(Math.random() * 9) + 2;
                operation = '×';
                correctAnswer = num1 * num2;
            } else {
                // Complex mix or higher numbers
                const type = Math.random();
                if (type < 0.4) {
                    num1 = Math.floor(Math.random() * 12) + 2;
                    num2 = Math.floor(Math.random() * 12) + 2;
                    operation = '×';
                    correctAnswer = num1 * num2;
                } else {
                    num1 = Math.floor(Math.random() * 100) + 20;
                    num2 = Math.floor(Math.random() * 100) + 20;
                    operation = Math.random() > 0.5 ? '+' : '-';
                    correctAnswer = operation === '+' ? (num1 + num2) : (num1 - num2);
                }
            }

            opDiv.innerText = `${num1} ${operation} ${num2} = ?`;

            // Generate Options
            const options = new Set();
            options.add(correctAnswer);
            while (options.size < 4) {
                let offset;
                if (operation === '×') {
                    offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
                } else {
                    offset = Math.floor(Math.random() * 21) - 10;
                }
                const wrongAnswer = correctAnswer + offset;
                if (wrongAnswer !== correctAnswer) {
                    options.add(wrongAnswer);
                }
            }

            const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

            shuffledOptions.forEach(val => {
                const btn = document.createElement('button');
                btn.className = 'btn-retro';
                btn.style.fontSize = '2.5rem';
                btn.style.padding = '10px';
                btn.style.width = '100%';
                btn.innerText = val;

                btn.onclick = () => {
                    if (isGameOver) return;

                    if (val === correctAnswer) {
                        currentScore++;
                        btn.style.background = '#2ecc71';
                        btn.style.color = 'white';

                        if (currentScore >= targetScore) {
                            isGameOver = true;
                            onWin();
                        } else {
                            // Flash effect and next
                            setTimeout(updateUI, 200);
                        }
                    } else {
                        isGameOver = true;
                        btn.style.background = '#e74c3c';
                        btn.style.color = 'white';
                        onLose();
                    }
                };
                grid.appendChild(btn);
            });
        };

        updateUI();

        window.Microgames.mathChallenge.cleanupFunc = () => {
            isGameOver = true;
        };
    },
    cleanup: () => {
        if (window.Microgames.mathChallenge.cleanupFunc) window.Microgames.mathChallenge.cleanupFunc();
        const gameArea = document.getElementById('game-area');
        if (gameArea) {
            gameArea.style.display = "";
            gameArea.style.flexDirection = "";
            gameArea.style.alignItems = "";
            gameArea.style.justifyContent = "";
            gameArea.style.background = "";
            gameArea.style.color = "";
            gameArea.style.fontFamily = "";
        }
    }
};

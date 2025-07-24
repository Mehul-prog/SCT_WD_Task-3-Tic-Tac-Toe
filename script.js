let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'easy'; 
let scores = { player: 0, computer: 0, tie: 0 };
let moveCount = 0;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6] 
];

const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('statusText');
const statusSubtext = document.getElementById('statusSubtext');
const gameBoard = document.getElementById('gameBoard');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const modeTabs = document.querySelectorAll('.mode-tab');
const aiOptions = document.getElementById('aiOptions');
const pvpIndicator = document.getElementById('pvpIndicator');

initializeGame();
createFloatingParticles();
updateScoreDisplay();

function initializeGame() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', changeDifficulty);
    });

    modeTabs.forEach(tab => {
        tab.addEventListener('click', changeTab);
    });

    updateStatus('Ready to play?', 'Select AI difficulty or 1v1 mode and click any cell');
}

function createFloatingParticles() {
    const particlesContainer = document.getElementById('particles');

    setInterval(() => {
        if (Math.random() < 0.3) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 2) + 's';

            const colors = ['#6c5ce7', '#00b894', '#e17055', '#fdcb6e'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            particlesContainer.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 4000);
        }
    }, 1000);
}

function changeTab(e) {
    modeTabs.forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');

    const selectedTab = e.target.getAttribute('data-tab');

    if (selectedTab === 'ai') {
        aiOptions.classList.remove('hidden');
        pvpIndicator.classList.remove('active');
        const activeAiBtn = document.querySelector('.difficulty-btn.active');
        if (activeAiBtn) {
            gameMode = activeAiBtn.getAttribute('data-mode');
        } else {
            gameMode = 'easy';
            difficultyBtns[0].classList.add('active');
        }
    } else {
        aiOptions.classList.add('hidden');
        pvpIndicator.classList.add('active');
        gameMode = 'pvp';
    }

    updateGameModeUI();
    resetGame();
}

function changeDifficulty(e) {
    if (gameMode === 'pvp') return;

    difficultyBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    gameMode = e.target.getAttribute('data-mode');

    updateGameModeUI();

    if (gameActive && moveCount > 0) {
        updateStatus('Difficulty changed!', 'Start a new game to apply the new difficulty');
    } else {
        resetGame();
    }
}

function updateGameModeUI() {
    const playerLabel = document.getElementById('playerLabel');
    const computerLabel = document.getElementById('computerLabel');
    const computerIcon = document.querySelector('#computerCard .score-icon');

    if (gameMode === 'pvp') {
        playerLabel.textContent = 'Player 1 (X)';
        computerLabel.textContent = 'Player 2 (O)';
        computerIcon.textContent = '🎮';
    } else {
        playerLabel.textContent = 'You (X)';
        computerLabel.textContent = 'AI (O)';
        computerIcon.textContent = '🤖';
    }
}

function handleCellClick(e) {
    const index = parseInt(e.target.getAttribute('data-index'));

    if (board[index] !== '' || !gameActive) return;

    if (gameMode === 'pvp') {
        makeMove(index, currentPlayer);
        return;
    }

    if (currentPlayer !== 'X') return;

    makeMove(index, 'X');

    if (gameActive && currentPlayer === 'O') {
        gameBoard.classList.add('game-disabled');
        showThinkingStatus();

        const delay = gameMode === 'easy' ? 800 : gameMode === 'medium' ? 1200 : 1800;
        setTimeout(() => {
            gameBoard.classList.remove('game-disabled');
            computerMove();
        }, delay);
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];

    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    cell.classList.add('cell-enter');
    cell.disabled = true;
    moveCount++;

    if (checkWin(player)) {
        handleGameEnd(player);
        return;
    }

    if (board.every(cell => cell !== '')) {
        handleGameEnd('tie');
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    if (gameMode === 'pvp') {
        const playerName = currentPlayer === 'X' ? 'Player 1' : 'Player 2';
        updateStatus(`${playerName}'s Turn!`, `${playerName} (${currentPlayer}) - Choose your move`);
    } else if (currentPlayer === 'X') {
        updateStatus('Your turn!', 'Choose your next move wisely');
    }
}

function showThinkingStatus() {
    const thinkingTexts = [
        'AI is analyzing...',
        'Computing best move...',
        'Strategic thinking...',
        'Processing options...'
    ];

    const randomText = thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)];

    statusText.innerHTML = `
        <div class="thinking-indicator">
            ${randomText}
            <div class="thinking-dots">
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
            </div>
        </div>
    `;
    statusSubtext.textContent = 'AI difficulty: ' + gameMode.charAt(0).toUpperCase() + gameMode.slice(1);
}

function computerMove() {
    if (!gameActive) return;

    let bestMove = findBestMove();
    makeMove(bestMove, 'O');
}

function findBestMove() {
    const availableMoves = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            availableMoves.push(i);
        }
    }

    if (availableMoves.length === 0) return -1;

    if (gameMode === 'easy' && Math.random() < 0.7) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    if (gameMode === 'medium' && Math.random() < 0.4) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    return minimax(board, 0, true).index;
}

function minimax(newBoard, depth, isMaximizing) {
    const scores = { 'O': 10, 'X': -10, 'tie': 0 };

    if (checkWinForMinimax(newBoard, 'O')) return { score: scores['O'] - depth };
    if (checkWinForMinimax(newBoard, 'X')) return { score: scores['X'] + depth };

    const availableSpots = [];
    for (let i = 0; i < 9; i++) {
        if (newBoard[i] === '') availableSpots.push(i);
    }
    if (availableSpots.length === 0) return { score: scores['tie'] };

    if (isMaximizing) {
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let index of availableSpots) {
            newBoard[index] = 'O';
            const result = minimax(newBoard, depth + 1, false);
            newBoard[index] = '';

            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = index;
            }
        }
        return { score: bestScore, index: bestMove };
    } else {
        let bestScore = Infinity;
        let bestMove = -1;

        for (let index of availableSpots) {
            newBoard[index] = 'X';
            const result = minimax(newBoard, depth + 1, true);
            newBoard[index] = '';

            if (result.score < bestScore) {
                bestScore = result.score;
                bestMove = index;
            }
        }
        return { score: bestScore, index: bestMove };
    }
}

function checkWinForMinimax(boardState, player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (boardState[a] === player && boardState[b] === player && boardState[c] === player) {
            return true;
        }
    }
    return false;
}

function checkWin(player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === player && board[b] === player && board[c] === player) {
            highlightWinningLine(condition);
            return true;
        }
    }
    return false;
}

function highlightWinningLine(condition) {
    condition.forEach(index => {
        cells[index].classList.add('winning');
    });
}

function handleGameEnd(winner) {
    gameActive = false;

    if (gameMode === 'pvp') {
        if (winner === 'X') {
            updateStatus('🎉 Player 1 Wins!', 'Congratulations Player 1! You got three in a row!');
            scores.player++;
            updateScoreDisplay('player');
            createCelebration();
        } else if (winner === 'O') {
            updateStatus('🎉 Player 2 Wins!', 'Congratulations Player 2! You got three in a row!');
            scores.computer++;
            updateScoreDisplay('computer');
            createCelebration();
        } else {
            updateStatus('🤝 Draw!', 'Great game! Nobody wins this round.');
            scores.tie++;
            updateScoreDisplay('tie');
        }
    } else {
        if (winner === 'X') {
            updateStatus('🎉 Victory!', 'Congratulations! You defeated the AI!');
            scores.player++;
            updateScoreDisplay('player');
            createCelebration();
        } else if (winner === 'O') {
            updateStatus('🤖 AI Wins!', 'The AI outsmarted you this time. Try again!');
            scores.computer++;
            updateScoreDisplay('computer');
        } else {
            updateStatus('🤝 Draw!', 'Great game! You matched the AI\'s strategy.');
            scores.tie++;
            updateScoreDisplay('tie');
        }
    }

    cells.forEach(cell => cell.disabled = true);
}

function createCelebration() {
    const celebration = document.getElementById('celebration');

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.background = ['#fdcb6e', '#e17055', '#00b894', '#6c5ce7'][Math.floor(Math.random() * 4)];

        celebration.appendChild(confetti);

        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 3000);
    }
}

function updateStatus(main, sub) {
    statusText.textContent = main;
    statusSubtext.textContent = sub;
}

function updateScoreDisplay(winner = null) {
    document.getElementById('playerScore').textContent = scores.player;
    document.getElementById('computerScore').textContent = scores.computer;
    document.getElementById('tieScore').textContent = scores.tie;

    document.querySelectorAll('.score-card').forEach(card => card.classList.remove('winner'));
    if (winner === 'player') {
        document.getElementById('playerCard').classList.add('winner');
    } else if (winner === 'computer') {
        document.getElementById('computerCard').classList.add('winner');
    } else if (winner === 'tie') {
        document.getElementById('tieCard').classList.add('winner');
    }

    if (winner) {
        setTimeout(() => {
            document.querySelectorAll('.score-card').forEach(card => card.classList.remove('winner'));
        }, 2000);
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    moveCount = 0;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.disabled = false;
        cell.className = 'cell';
    });

    gameBoard.classList.remove('game-disabled');

    if (gameMode === 'pvp') {
        updateStatus('Game Reset!', 'Player 1 (X) starts first. Click any cell to begin.');
    } else {
        updateStatus('Game Reset!', 'Click any cell to start your first move');
    }
}

function resetScores() {
    scores = { player: 0, computer: 0, tie: 0 };
    updateScoreDisplay();
    updateStatus('Scores Reset!', 'All statistics have been cleared');
}

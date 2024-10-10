document.addEventListener("DOMContentLoaded", () => {
    const boardSize = 6;
    const board = [];
    let currentPlayer = 1;
    let gameStarted = false;
    let moveCount = 0;
    let numPlayers = 2; // default to 2 players
    let activePlayers = []; // array to track active players
    let playerColors = []; // array to store player colors

    const gameBoard = document.getElementById("game-board");
    const playerIndicators = document.getElementById("player-indicators");
    const playerSelect = document.getElementById("player-count");
    const startButton = document.getElementById("start-button");
    const winnerMessage = document.getElementById("winner-message");

    startButton.addEventListener("click", startGame);

    function startGame() {
        numPlayers = parseInt(playerSelect.value);
        gameStarted = true;
        moveCount = 0;
        currentPlayer = 1;
        activePlayers = Array.from({ length: numPlayers }, (_, i) => i + 1);
        initializeColors();
        initializeBoard();
        createPlayerIndicators();
        updatePlayerIndicator();
        winnerMessage.textContent = '';
    }

    function initializeColors() {
        // Initialize player colors array
        playerColors = [];
        for (let i = 0; i < numPlayers; i++) {
            let color;
            do {
                color = getRandomColor();
            } while (playerColors.includes(color));
            playerColors.push(color);
        }
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function initializeBoard() {
        gameBoard.innerHTML = '';
        for (let row = 0; row < boardSize; row++) {
            board[row] = [];
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener("click", () => handleCellClick(row, col));
                gameBoard.appendChild(cell);
                board[row][col] = { count: 0, player: 0 };
            }
        }
    }

    function createPlayerIndicators() {
        playerIndicators.innerHTML = '';
        for (let i = 1; i <= numPlayers; i++) {
            const playerDiv = document.createElement("div");
            playerDiv.id = `player${i}`;
            playerDiv.className = "player";
            playerDiv.style.backgroundColor = playerColors[i - 1];
            playerDiv.textContent = `Player ${i}`;
            playerIndicators.appendChild(playerDiv);
        }
    }

    function handleCellClick(row, col) {
        if (!gameStarted) return;
        const cell = board[row][col];
        if (cell.player !== 0 && cell.player !== currentPlayer) return;
        cell.count++;
        cell.player = currentPlayer;
        moveCount++;
        updateBoard();
        checkExplosions(row, col);
        switchPlayer();
        if (moveCount > numPlayers) {
            checkWinCondition();
        }
    }

    function updateBoard() {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const cellData = board[row][col];
                cell.textContent = cellData.count > 0 ? cellData.count : '';
                cell.style.backgroundColor = getPlayerColor(cellData.player);
            }
        }
    }

    function getPlayerColor(player) {
        return player === 0 ? "#fff" : playerColors[player - 1];
    }

    function switchPlayer() {
        currentPlayer = getNextActivePlayer(currentPlayer);
        updatePlayerIndicator();
    }

    function getNextActivePlayer(currentPlayer) {
        let currentIndex = activePlayers.indexOf(currentPlayer);
        currentIndex = (currentIndex + 1) % activePlayers.length;
        return activePlayers[currentIndex];
    }

    function updatePlayerIndicator() {
        for (let i = 1; i <= numPlayers; i++) {
            const playerElem = document.getElementById(`player${i}`);
            if (!activePlayers.includes(i)) {
                playerElem.classList.add("inactive");
            } else {
                playerElem.classList.remove("inactive");
            }
            playerElem.classList.toggle("active", currentPlayer === i && gameStarted);
        }
    }

    function checkExplosions(startRow, startCol) {
        const queue = [{ row: startRow, col: startCol }];

        while (queue.length > 0) {
            const { row, col } = queue.shift();
            const cell = board[row][col];
            const maxCount = getMaxCount(row, col);

            if (cell.count > maxCount) {
                const overflow = cell.count - maxCount - 1;
                cell.count = overflow >= 0 ? overflow : 0;
                cell.player = 0; 

                const neighbors = getNeighbors(row, col);
                neighbors.forEach(({ row, col }) => {
                    addOrb(row, col);
                    if (board[row][col].count > getMaxCount(row, col)) {
                        queue.push({ row, col });
                    }
                });

                updateBoard();
            }
        }
    }

    function getMaxCount(row, col) {
        if ((row === 0 || row === boardSize - 1) && (col === 0 || col === boardSize - 1)) return 1;
        if (row === 0 || row === boardSize - 1 || col === 0 || col === boardSize - 1) return 2;
        return 3;
    }

    function getNeighbors(row, col) {
        const neighbors = [];
        if (row > 0) neighbors.push({ row: row - 1, col: col });
        if (row < boardSize - 1) neighbors.push({ row: row + 1, col: col });
        if (col > 0) neighbors.push({ row: row, col: col - 1 });
        if (col < boardSize - 1) neighbors.push({ row: row, col: col + 1 });
        return neighbors;
    }

    function addOrb(row, col) {
        const cell = board[row][col];
        cell.count++;
        cell.player = currentPlayer;
    }

    function checkWinCondition() {
        const playerOrbs = Array(numPlayers).fill(0);
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const player = board[row][col].player;
                if (player > 0) {
                    playerOrbs[player - 1]++;
                }
            }
        }

        activePlayers = activePlayers.filter(player => playerOrbs[player - 1] > 0);

        if (activePlayers.length <= 1) {
            const winner = activePlayers[0];
            winnerMessage.textContent = `Player ${winner} wins! Press "Start Game" to Restart the game.`;
            gameStarted = false;
            updatePlayerIndicator();
        } else {
            for (let i = 1; i <= numPlayers; i++) {
                const playerElem = document.getElementById(`player${i}`);
                playerElem.classList.toggle("inactive", !activePlayers.includes(i));
            }
        }
    }
});

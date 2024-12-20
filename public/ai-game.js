document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".cell");
    const statusText = document.getElementById("status");
    const restartButton = document.getElementById("restartButton");
    const backButton = document.getElementById("backButton");
    const settingsForm = document.getElementById("settingsForm");
    const gameBoard = document.querySelector(".game-board");



    let playerSymbol = "X";
    let aiSymbol = "O";
    let difficulty = "hard";
    let board = ["", "", "", "", "", "", "", "", ""];
    let gameActive = false;

    settingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        playerSymbol = document.getElementById("playerChoice").value;
        aiSymbol = playerSymbol === "X" ? "O" : "X";
        difficulty = document.getElementById("difficulty").value;

        settingsForm.style.display = "none";
        gameBoard.style.display = "grid";
        backButton.style.display = "block";
        statusText.textContent = `Your turn (${playerSymbol})`;
        gameActive = true;

        if (aiSymbol === "X") aiMove(); // AI starts if it's X
    });

    cells.forEach(cell => {
        cell.addEventListener("click", () => {
            if (!gameActive || cell.textContent !== "") return;

            const cellIndex = cell.getAttribute("data-index");
            board[cellIndex] = playerSymbol;
            cell.textContent = playerSymbol;

            if (checkWinner(playerSymbol)) {
                statusText.textContent = "You win!";
                gameActive = false;
                restartButton.style.display = "block";
            } else if (board.every(cell => cell !== "")) {
                statusText.textContent = "It's a draw!";
                gameActive = false;
                restartButton.style.display = "block";
            } else {
                aiMove();
            }
        });
    });

    function aiMove() {
        if (!gameActive) return;

        const move = difficulty === "easy" ? getRandomMove() : getBestMove();
        if (move !== null) {
            board[move] = aiSymbol;
            cells[move].textContent = aiSymbol;

            if (checkWinner(aiSymbol)) {
                statusText.textContent = "AI wins!";
                gameActive = false;
                restartButton.style.display = "block";
            } else if (board.every(cell => cell !== "")) {
                statusText.textContent = "It's a draw!";
                gameActive = false;
                restartButton.style.display = "block";
            } else {
                statusText.textContent = `Your turn (${playerSymbol})`;
            }
        }
    }

    function getRandomMove() {
        const emptyCells = board.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);
        return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
    }

    function getBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = aiSymbol;
                let score = minimax(board, false);
                board[i] = "";

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    function minimax(board, isMaximizing) {
        if (checkWinner(aiSymbol)) return 10;
        if (checkWinner(playerSymbol)) return -10;
        if (board.every(cell => cell !== "")) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = aiSymbol;
                    let score = minimax(board, false);
                    board[i] = "";
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = playerSymbol;
                    let score = minimax(board, true);
                    board[i] = "";
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function checkWinner(symbol) {
        const winningCombos = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        return winningCombos.some(combo => combo.every(index => board[index] === symbol));
    }

    restartButton.addEventListener("click", () => {
        resetGame();
    });

    backButton.addEventListener("click", () => {
    resetGame();
    gameBoard.style.display = "none";
    settingsForm.style.display = "block";
    backButton.style.display = "none";
    statusText.textContent = "Set up the game to start."; // Reset to initial setup message
});

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    cells.forEach(cell => (cell.textContent = ""));
    gameActive = true;
    restartButton.style.display = "none";
    // statusText is not updated here to allow flexibility for different contexts
    if (aiSymbol === "X") aiMove();
}

});

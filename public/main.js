document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "https://tic-tac-toe-p5xh.onrender.com"; // Замените на ваш URL Render

    const cells = document.querySelectorAll(".cell");
    const statusText = document.getElementById("status");
    const restartButton = document.getElementById("restartButton");
    const backButton = document.getElementById("backButton");
    const playerForm = document.getElementById("playerForm");
    const namePlayer1 = document.getElementById("namePlayer1");
    const namePlayer2 = document.getElementById("namePlayer2");

    let player1 = "Player 1";
    let player2 = "Player 2";
    let currentPlayer = "X";
    let board = ["", "", "", "", "", "", "", "", ""];
    let gameActive = false;

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

    // Загрузка рейтинга
    await updateScoreboard();

    // Отправка данных игрока
    async function sendPlayerData(name, points) {
        try {
            await fetch(`${API_URL}/player`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, points }),
            });
        } catch (error) {
            console.error("Error sending player data:", error);
        }
    }

    // Обновление рейтинга
    async function updateScoreboard() {
        try {
            const response = await fetch(`${API_URL}/players`);
            const players = await response.json();

            const scoreboard = document.querySelector(".scoreboard");
            const playersListHTML = players.map(player => `
                <div class="score-entry">
                    <p>${player.name}</p>
                    <p>Games: <span>${player.games_played}</span></p>
                    <p>Points: <span>${player.points}</span></p>
                </div>
            `).join("");

            scoreboard.innerHTML = `
                <h2>Scoreboard</h2>
                ${playersListHTML}
            `;
        } catch (error) {
            console.error("Error fetching players:", error);
        }
    }

    // Обработка завершения игры
    async function handleGameEnd(winner, isDraw) {
        if (isDraw) {
            await sendPlayerData(player1, 1);
            await sendPlayerData(player2, 1);
        } else {
            const loser = winner === player1 ? player2 : player1;
            await sendPlayerData(winner, 2);
            await sendPlayerData(loser, 0);
        }
        await updateScoreboard();
    }

    // Обработка отправки формы
    playerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        player1 = document.getElementById("player1").value || "Player 1";
        player2 = document.getElementById("player2").value || "Player 2";

        namePlayer1.textContent = player1;
        namePlayer2.textContent = player2;

        await updateScoreboard();
        statusText.textContent = `${player1}'s turn (X)`;
        gameActive = true;
        playerForm.style.display = "none";
        document.querySelector(".game-board").style.display = "grid"; // Показываем игровое поле
        backButton.style.display = "block"; // Показываем кнопку "Назад"
    });

    // Обработка клика по ячейкам
    cells.forEach(cell => {
        cell.addEventListener("click", async () => {
            if (!gameActive || cell.textContent !== "") return;
            const cellIndex = cell.getAttribute("data-index");
            board[cellIndex] = currentPlayer;
            cell.textContent = currentPlayer;

            if (checkWinner()) {
                const winner = currentPlayer === "X" ? player1 : player2;
                statusText.textContent = `${winner} wins!`;
                gameActive = false;
                restartButton.style.display = "block";
                await handleGameEnd(winner, false);
            } else if (board.every(cell => cell !== "")) {
                statusText.textContent = "It's a draw!";
                gameActive = false;
                restartButton.style.display = "block";
                await handleGameEnd(null, true);
            } else {
                currentPlayer = currentPlayer === "X" ? "O" : "X";
                statusText.textContent = `${currentPlayer === "X" ? player1 : player2}'s turn (${currentPlayer})`;
            }
        });
    });

    // Обработка кнопки "Restart"
    restartButton.addEventListener("click", () => {
        board = ["", "", "", "", "", "", "", "", ""];
        cells.forEach(cell => (cell.textContent = ""));
        currentPlayer = "X";
        gameActive = true;
        restartButton.style.display = "none";
        statusText.textContent = `${player1}'s turn (X)`;
    });

    // Обработка кнопки "Назад"
    backButton.addEventListener("click", () => {
        // Сбрасываем игру
        board = ["", "", "", "", "", "", "", "", ""];
        cells.forEach(cell => (cell.textContent = ""));
        currentPlayer = "X";
        gameActive = false;

        // Скрываем игровое поле и показываем форму
        document.querySelector(".game-board").style.display = "none";
        playerForm.style.display = "block";
        restartButton.style.display = "none";
        backButton.style.display = "none";

        statusText.textContent = "Enter player names and start the game.";
    });

    // Проверка победителя
    function checkWinner() {
        return winningCombos.some(combo => 
            combo.every(index => board[index] === currentPlayer)
        );
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const cells = document.querySelectorAll(".cell");
    const statusText = document.getElementById("status");
    const restartButton = document.getElementById("restartButton");
    const playerForm = document.getElementById("playerForm");
    const namePlayer1 = document.getElementById("namePlayer1");
    const namePlayer2 = document.getElementById("namePlayer2");
    const gamesPlayer1 = document.getElementById("gamesPlayer1");
    const gamesPlayer2 = document.getElementById("gamesPlayer2");
    const pointsPlayer1 = document.getElementById("pointsPlayer1");
    const pointsPlayer2 = document.getElementById("pointsPlayer2");

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
        [2, 4, 6]
    ];

    // Загрузка рейтинга при заходе на страницу
    await updateScoreboard();

    async function sendPlayerData(name, points) {
    try {
        await fetch("http://localhost:3000/player", {
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



    // Получение данных об игроках
    async function fetchPlayerData(playerName) {
        try {
            const response = await fetch("http://localhost:3000/players");
            const players = await response.json();
            const player = players.find(p => p.name === playerName);
            return player || { games_played: 0, points: 0 };
        } catch (error) {
            console.error("Error fetching player data:", error);
            return { games_played: 0, points: 0 };
        }
    }

// Обновление информации о рейтинге игроков
async function updateScoreboard() {
    try {
        const response = await fetch("http://localhost:3000/players");
        const players = await response.json();

        // Динамически генерируем HTML для всех игроков
        const scoreboard = document.querySelector(".scoreboard");
        const playersListHTML = players.map(player => `
            <div class="score-entry">
                <p>${player.name}</p>
                <p>Games: <span>${player.games_played}</span></p>
                <p>Points: <span>${player.points}</span></p>
            </div>
        `).join("");

        // Обновляем HTML в блоке рейтинга
        scoreboard.innerHTML = `
            <h2>Scoreboard</h2>
            ${playersListHTML}
        `;
    } catch (error) {
        console.error("Error fetching players:", error);
    }
}



    // Обновление данных после игры
    async function handleGameEnd(winner, isDraw) {
    if (isDraw) {
        // Если ничья, обеим сторонам добавляется 1 очко
        await sendPlayerData(player1, 1);
        await sendPlayerData(player2, 1);
    } else {
        // Если есть победитель
        const loser = winner === player1 ? player2 : player1;
        await sendPlayerData(winner, 2); // Победитель получает 2 очка
        await sendPlayerData(loser, 0); // Проигравший увеличивает количество игр
    }
    await updateScoreboard();
}


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
    });

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

    restartButton.addEventListener("click", () => {
        board = ["", "", "", "", "", "", "", "", ""];
        cells.forEach(cell => (cell.textContent = ""));
        currentPlayer = "X";
        gameActive = true;
        restartButton.style.display = "none";
        statusText.textContent = `${player1}'s turn (X)`;
    });

    function checkWinner() {
        return winningCombos.some(combo => 
            combo.every(index => board[index] === currentPlayer)
        );
    }
});

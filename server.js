const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 3000;

// Настройка подключения к PostgreSQL через переменные окружения
const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "tic-tac-toeDB",
    password: process.env.DB_PASSWORD || "barys",
    port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Настройка статических файлов
app.use(express.static("public"));

// Проверка подключения к базе данных
pool.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch(err => {
        console.error("Error connecting to PostgreSQL:", err);
        process.exit(1);
    });

// Маршрут: Добавление или обновление игрока
app.post("/player", async (req, res) => {
    const { name, points } = req.body;

    if (!name || typeof points !== "number") {
        return res.status(400).send("Invalid input data");
    }

    try {
        const player = await pool.query(
            `INSERT INTO players (name, games_played, points)
             VALUES ($1, 1, $2)
             ON CONFLICT (name)
             DO UPDATE SET 
             games_played = players.games_played + 1,
             points = players.points + $2
             RETURNING *`,
            [name, points]
        );
        res.status(200).json(player.rows[0]);
    } catch (err) {
        console.error("Error saving player data:", err);
        res.status(500).send("Error saving player data");
    }
});

// Маршрут: Получение списка игроков
app.get("/players", async (req, res) => {
    try {
        const players = await pool.query("SELECT * FROM players ORDER BY points DESC");
        res.status(200).json(players.rows);
    } catch (err) {
        console.error("Error retrieving players:", err);
        res.status(500).send("Error retrieving players");
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

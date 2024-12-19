const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;
const host = "0.0.0.0";

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
app.use(morgan("dev"));

// Настройка статических файлов
app.use(express.static("public"));

// Проверка подключения к базе данных
pool.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch(err => {
        console.error("Error connecting to PostgreSQL:", err);
        process.exit(1);
    });

// Корневой маршрут для загрузки HTML
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Маршрут: Добавление или обновление игрока
app.post("/player", async (req, res) => {
    const { name, points } = req.body;

    if (!name || typeof points !== "number") {
        console.error("Invalid input data:", { name, points });
        return res.status(400).send("Invalid input data");
    }

    try {
        console.log("Incoming data:", { name, points });

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

        console.log("Updated player:", player.rows[0]);
        res.status(200).json(player.rows[0]);
    } catch (err) {
        console.error("Error saving player data:", err);
        res.status(500).send("Error saving player data");
    }
});

// Маршрут: Получение списка игроков
app.get("/players", async (req, res) => {
    try {
        console.log("Fetching players...");
        const players = await pool.query("SELECT * FROM players ORDER BY points DESC");
        console.log("Players retrieved:", players.rows);
        res.status(200).json(players.rows);
    } catch (err) {
        console.error("Error retrieving players:", err);
        res.status(500).send("Error retrieving players");
    }
});

// Запуск сервера
app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});

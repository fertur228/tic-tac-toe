require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;
const host = "0.0.0.0";

// Настройка подключения к базе данных
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Используем переменную окружения
    ssl: {
        rejectUnauthorized: false, // Требуется для Render
    },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(express.static("public")); // Для загрузки статических файлов (HTML, CSS, JS)

// Проверка подключения к базе данных
pool.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch(err => {
        console.error("Error connecting to PostgreSQL:", err);
        process.exit(1);
    });

// Инициализация базы данных
app.get("/init-db", async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS players (
                name TEXT PRIMARY KEY,
                games_played INT DEFAULT 0,
                points INT DEFAULT 0
            );
        `);
        res.send("Database initialized");
    } catch (err) {
        console.error("Error initializing database:", err);
        res.status(500).send("Error initializing database");
    }
});

// Добавление или обновление игрока
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
        res.json(player.rows[0]);
    } catch (err) {
        console.error("Error saving player data:", err);
        res.status(500).send("Error saving player data");
    }
});

// Получение списка игроков
app.get("/players", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM players ORDER BY points DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error retrieving players:", err);
        res.status(500).send("Error retrieving players");
    }
});

// Запуск сервера
app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});

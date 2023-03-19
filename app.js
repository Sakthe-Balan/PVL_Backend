const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
    host: "pvl.c9rz0vjywjf8.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "S@si2014",
    database: "mydatabase",
});

function generateToken(user) {
    return jwt.sign(user, "your-secret-key");
}

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    connection.query(query, [username, password], (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else if (results.length === 0) {
            res.status(401).json({ error: "Invalid Credentials" });
        } else {
            const user = { id: results[0].id, username: results[0].username };
            const token = generateToken(user);
            res.json({ token });
        }
    });
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    connection.query(query, [username, password], (error, results) => {
        if (error) {
            console.log(username, password);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            console.log(username,password);
            res.json({ message: "Registration Successful" });
        }
    });
});

app.get("/posts", (req, res) => {
    const query =
        "SELECT posts.id, posts.title, posts.content, users.username FROM posts INNER JOIN users ON posts.user_id = users.id";
    connection.query(query, (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(results);
        }
    });
});

app.get("/posts/:userId", (req, res) => {
    const userId = req.params.userId;
    const query = "SELECT id, title, content FROM posts WHERE user_id = ?";
    connection.query(query, [userId], (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(results);
        }
    });
});

app.post("/posts/new", (req, res) => {
    const { title, content, userId } = req.body;
    const query = "INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)";
    connection.query(query, [title, content, userId], (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json({ message: "Post Successful" });
        }
    });
});

app.listen(9002, () => {
    console.log("Server is listening on port 9002");
});
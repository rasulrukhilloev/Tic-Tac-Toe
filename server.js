const express = require('express');
const app = express();
const port = 3000;

let allRoundsData = [];
let gameResults = {};

app.get('/allRounds', (req, res) => {
    res.json(allRoundsData);
});

app.get('/gameResults', (req, res) => {
    const results = Object.keys(gameResults).map(winner => ({
        winner,
        win_amount: gameResults[winner]
    }));
    res.json(results);
});

app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});

module.exports = { allRoundsData, gameResults };

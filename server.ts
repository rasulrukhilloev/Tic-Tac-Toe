import express from 'express';

interface GameResults {
    [key: string]: number;
}

interface RoundData {
    winner: string;
    empty_cells: number;
    moves_amount: number;
}


const app = express();
const port = 3000;

let allRoundsData: RoundData[] = [];
let gameResults: GameResults = {};

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

export { allRoundsData, gameResults };

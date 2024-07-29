const WebSocket = require('ws');

const TicTacToe = require('./src/game');
const { allRoundsData, gameResults } = require('./server');

const wss = new WebSocket.Server({ port: 8080 });

let game;
let players = [];

function updateStats() {
    if (!gameResults[game.getCurrentPLayer()]) {
        gameResults[game.getCurrentPLayer()] = 0;
    }
    gameResults[game.getCurrentPLayer()]++;
    game.getRoundsData().forEach(round => allRoundsData.push(round));
}
function broadcast(data) {
    players.forEach(player => player.ws.send(JSON.stringify(data)));
}
function sendToPlayer(playerId, data) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.ws.send(JSON.stringify(data));
    }
}
function startNewGame() {
    if (players.length === 2) {
        game = new TicTacToe(players[0].id, players[1].id);
        console.log("Game Start");
        sendToPlayer(game.getCurrentPLayer(), { board: game.getBoard() }); // initial move
    }
}

wss.on('connection', (ws, req) => {
    const playerId = req.headers['sec-websocket-key'];

    if(players.length >= 2){
        ws.send(JSON.stringify({ message: 'Game is full' }));
        ws.close();
        return;
    }

    players.push({ id: playerId, ws });
    ws.send(JSON.stringify({ message: `Player ${players.length} connected`, playerId }));

    if (players.length === 2) {
        startNewGame()
    } else {
        ws.send(JSON.stringify({ message: 'Waiting for second player' }));
    }

    ws.on('message', (message) => handlePlayerMove(ws, playerId, message));

    ws.on('close', () => {
        players = players.filter(p => p.ws !== ws);
        if (players.length < 2) {
            game = null;
        }
    });
});

function handlePlayerMove(ws, playerId, message) {

    const { move } = JSON.parse(message);

    const moveResult = game.makeMove(game.getCurrentPLayer(), move);

    console.log(`Move: ${move} Player: ${game.getCurrentPLayer()}`);

    if (moveResult.status === 'win' || moveResult.status === 'draw') {
        handleGameOrRoundEnd();
    } else {
        sendToPlayer(game.getCurrentPLayer(), { board: game.getBoard() })
    }
}

function handleGameOrRoundEnd() {
    if (game.isGameOver()) {
        updateStats();
        broadcast({ message: `${game.getCurrentPLayer()} wins the game!` });
        setTimeout(startNewGame, 2000); // Start new game after 2 seconds
    } else {
        game.resetBoard();
        sendToPlayer(game.getCurrentPLayer(), { board: game.getBoard() });
    }
}

console.log('WebSocket server started on ws://localhost:8080');

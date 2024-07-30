import WebSocket, { WebSocketServer } from 'ws';

import TicTacToe from './src/game';
import { allRoundsData, gameResults } from './server';

interface Player {
    id: string;
    ws: WebSocket;
}


const wss = new WebSocketServer({ port: 8080 });

let game: TicTacToe | null = null;
let players: Player[] = [];

function updateStats() {
    if (!gameResults[game!.getCurrentPlayer()]) {
        gameResults[game!.getCurrentPlayer()] = 0;
    }
    gameResults[game!.getCurrentPlayer()]++;
    game!.getRoundsData().forEach(round => allRoundsData.push(round));
}

function broadcast(data: { [key: string]: string }) {
    players.forEach(player => player.ws.send(JSON.stringify(data)));
}

function sendToPlayer(playerId: string, data: { [key: string]: (string | null)[] }) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.ws.send(JSON.stringify(data));
    }
}

function startNewGame() {
    if (players.length === 2) {
        game = new TicTacToe(players[0].id, players[1].id);
        console.log('Game Start');
        sendToPlayer(game.getCurrentPlayer(), { board: game.getBoard() }); // initial move
    }
}

wss.on('connection', (ws, req) => {
    const playerId = req.headers['sec-websocket-key'] as string;

    if (players.length >= 2) {
        ws.send(JSON.stringify({ message: 'Game is full' }));
        ws.close();
        return;
    }

    players.push({ id: playerId, ws });
    ws.send(JSON.stringify({ message: `Player ${players.length} connected`, playerId }));

    if (players.length === 2) {
        startNewGame();
    } else {
        ws.send(JSON.stringify({ message: 'Waiting for second player' }));
    }

    ws.on('message', (message: string) => handlePlayerMove(ws, playerId, message));

    ws.on('close', () => {
        players = players.filter(p => p.ws !== ws);
        if (players.length < 2) {
            game = null;
        }
    });
});

function handlePlayerMove(ws: WebSocket, playerId: string, message: string) {
    const { move }: { [key: string]: number } = JSON.parse(message);

    const moveResult = game!.makeMove(game!.getCurrentPlayer(), move);

    console.log(`Move: ${move} Player: ${game!.getCurrentPlayer()}`);

    if (moveResult.status === 'win' || moveResult.status === 'draw') {
        handleGameOrRoundEnd();
    } else {
        sendToPlayer(game!.getCurrentPlayer(), { board: game!.getBoard() });
    }
}

function handleGameOrRoundEnd() {
    if (game!.isGameOver()) {
        updateStats();
        broadcast({ message: `${game!.getCurrentPlayer()} wins the game!` });
        setTimeout(startNewGame, 2000); // Start new game after 2 seconds
    } else {
        game!.resetBoard();
        sendToPlayer(game!.getCurrentPlayer(), { board: game!.getBoard() });
    }
}

console.log('WebSocket server started on ws://localhost:8080');

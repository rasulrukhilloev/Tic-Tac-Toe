const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('Connected to game socket');
});

ws.on('message', (incomingData) => {
    const data = JSON.parse(incomingData);
    const { board, message } = data;

    if (message) {
        console.log(message);
    }

    if (board) {
        const move = chooseBestMove(board);
        console.log("Move: ", move)
        ws.send(JSON.stringify({ move }));
    }
});

function chooseBestMove(board) {
    const availableMoves = getAvailableMoves(board);

    // Check if can win
    for (const move of availableMoves) {
        board[move] = 'O';
        if (checkWinner(board) === 'O') {
            board[move] = null;
            return move;
        }
        board[move] = null;
    }

    // Check if need to block opponent
    for (const move of availableMoves) {
        board[move] = 'X';
        if (checkWinner(board) === 'X') {
            board[move] = null;
            return move;
        }
        board[move] = null;
    }

    // Take center
    if (board[4] === null) {
        return 4;
    }

    // Take any available move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getAvailableMoves(board) {
    return board.map((value, index) => value === null ? index : null).filter(value => value !== null);
}

function checkWinner(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}
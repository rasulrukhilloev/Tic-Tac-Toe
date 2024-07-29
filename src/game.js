class TicTacToe {
    constructor(playerX, playerO) {
        this.board = Array(9).fill(null);
        this.currentPlayer = playerX;
        this.playerX = playerX;
        this.playerO = playerO;
        this.scores = { [playerX]: 0, [playerO]: 0 };
        this.roundsData = [];
        this.moves_amount = 0
    }
    getCurrentPLayer() {
        return this.currentPlayer
    }
    getBoard() {
        return this.board
    }
    makeMove(playerId, index) {
        this.board[index] = this.currentPlayer;
        this.moves_amount++;

        if (this.checkWin()) {
            this.scores[this.currentPlayer]++;

            this.roundsData.push({
                winner: this.currentPlayer,
                empty_cells: this.board.filter(cell => cell === null).length,
                moves_amount: this.moves_amount
            });

            this.resetBoard();
            this.resetMoves();
            return { status: 'win', message: `${this.currentPlayer} wins the round!` };
        }

        if (this.board.every(cell => cell !== null)) {
            this.resetBoard();
            return { status: 'draw', message: 'Round is a draw!' };
        }

        this.currentPlayer = this.currentPlayer === this.playerX ? this.playerO : this.playerX;

        return { status: 'next', message: 'Next move' };
    }
    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winPatterns.some(pattern =>
            pattern.every(index => this.board[index] === this.currentPlayer)
        );
    }
    resetBoard() {
        this.board.fill(null);
    }
    resetMoves() {
        this.moves_amount = 0
    }
    isGameOver() {
        if(this.scores[this.playerX] === 2 || this.scores[this.playerO] === 2) return true
        return false
    }
    getRoundsData() {
        return this.roundsData;
    }
}

module.exports = TicTacToe;

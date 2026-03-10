/**
 * Chess UI Controller
 * Handles all user interface interactions and board rendering
 */

class ChessUI {
    constructor(engine) {
        this.engine = engine;
        this.boardElement = document.getElementById('chessboard');
        this.selectedSquare = null;
        this.legalMoves = [];

        // SVG Piece Images (Cburnett style from Wikimedia - Professional standard)
        this.pieceImages = {
            white: {
                'k': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
                'q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
                'r': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
                'b': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
                'n': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
                'p': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg'
            },
            black: {
                'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
                'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
                'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
                'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
                'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
                'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg'
            }
        };

        // Fallback Unicode chess pieces
        this.pieceSymbols = {
            white: { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' },
            black: { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' }
        };
    }

    /**
     * Initialize the board UI
     */
    initializeBoard() {
        this.boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;

                // Coordinates removed to match the image perfectly

                square.addEventListener('click', () => this.handleSquareClick(row, col));

                this.boardElement.appendChild(square);
            }
        }

        this.updateBoard();
    }

    /**
     * Update the board display
     */
    updateBoard() {
        const squares = this.boardElement.querySelectorAll('.square');

        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.engine.getPiece(row, col);

            // Clear previous styling
            square.classList.remove('selected', 'legal-move', 'legal-capture', 'in-check', 'last-move');

            // Remove only existing piece elements (preserve coordinate labels)
            const existingPiece = square.querySelector('.piece');
            if (existingPiece) existingPiece.remove();

            // Add piece
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${piece.color}-piece`;

                const img = document.createElement('img');
                img.src = this.pieceImages[piece.color][piece.type];
                img.alt = `${piece.color} ${piece.type}`;

                // Add fallback text if image fails
                img.onerror = () => {
                    pieceElement.innerHTML = `<span class="piece-text">${this.pieceSymbols[piece.color][piece.type]}</span>`;
                };

                pieceElement.appendChild(img);
                square.appendChild(pieceElement);
            }

            // Highlight last move
            if (this.engine.lastMove) {
                if ((row === this.engine.lastMove.fromRow && col === this.engine.lastMove.fromCol) ||
                    (row === this.engine.lastMove.toRow && col === this.engine.lastMove.toCol)) {
                    square.classList.add('last-move');
                }
            }

            // Highlight king in check
            if (piece && piece.type === 'k' && this.engine.isInCheck(piece.color)) {
                square.classList.add('in-check');
            }
        });

        // Update selected square and legal moves
        if (this.selectedSquare) {
            const selectedElement = this.getSquareElement(this.selectedSquare.row, this.selectedSquare.col);
            selectedElement.classList.add('selected');

            this.legalMoves.forEach(move => {
                const moveElement = this.getSquareElement(move.row, move.col);
                if (move.type === 'capture' || move.type === 'enpassant') {
                    moveElement.classList.add('legal-capture');
                } else {
                    moveElement.classList.add('legal-move');
                }
            });
        }

        this.updateGameInfo();
    }

    /**
     * Get square element by row and col
     */
    getSquareElement(row, col) {
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    /**
     * Handle square click
     */
    handleSquareClick(row, col) {
        if (this.engine.gameOver) return;

        const piece = this.engine.getPiece(row, col);

        // If a square is already selected
        if (this.selectedSquare) {
            // Check if clicked square is a legal move
            const move = this.legalMoves.find(m => m.row === row && m.col === col);

            if (move) {
                // Check for pawn promotion
                const selectedPiece = this.engine.getPiece(this.selectedSquare.row, this.selectedSquare.col);
                if (selectedPiece.type === 'p' && (row === 0 || row === 7)) {
                    this.showPromotionDialog(this.selectedSquare.row, this.selectedSquare.col, row, col);
                } else {
                    this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                }
            } else if (piece && piece.color === this.engine.currentTurn) {
                // Select different piece
                this.selectSquare(row, col);
            } else {
                // Deselect
                this.deselectSquare();
            }
        } else {
            // Select a piece
            if (piece && piece.color === this.engine.currentTurn) {
                this.selectSquare(row, col);
            }
        }
    }

    /**
     * Select a square
     */
    selectSquare(row, col) {
        this.selectedSquare = { row, col };
        this.legalMoves = this.engine.getLegalMoves(row, col);
        this.updateBoard();
    }

    /**
     * Deselect square
     */
    deselectSquare() {
        this.selectedSquare = null;
        this.legalMoves = [];
        this.updateBoard();
    }

    /**
     * Make a move
     */
    makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = 'q') {
        const success = this.engine.makeMove(fromRow, fromCol, toRow, toCol, promotionPiece);

        if (success) {
            this.deselectSquare();
            this.updateBoard();
            this.checkGameEnd();
            return true;
        }

        return false;
    }

    /**
     * Show promotion dialog
     */
    showPromotionDialog(fromRow, fromCol, toRow, toCol) {
        const dialog = document.getElementById('promotionDialog');
        dialog.style.display = 'flex';

        const buttons = dialog.querySelectorAll('.promotion-btn');
        buttons.forEach(btn => {
            btn.onclick = () => {
                const piece = btn.dataset.piece;
                dialog.style.display = 'none';
                this.makeMove(fromRow, fromCol, toRow, toCol, piece);
            };
        });
    }

    /**
     * Update game information panel
     */
    updateGameInfo() {
        // Update current turn
        document.getElementById('currentTurn').textContent =
            this.engine.currentTurn.charAt(0).toUpperCase() + this.engine.currentTurn.slice(1);

        // Update check status
        const checkStatus = document.getElementById('checkStatus');
        if (this.engine.isInCheck(this.engine.currentTurn)) {
            checkStatus.style.display = 'block';
        } else {
            checkStatus.style.display = 'none';
        }

        // Update captured pieces
        this.updateCapturedPieces();

        // Update move history
        this.updateMoveHistory();
    }

    /**
     * Update captured pieces display
     */
    updateCapturedPieces() {
        const capturedWhite = document.getElementById('capturedWhite');
        const capturedBlack = document.getElementById('capturedBlack');

        capturedWhite.innerHTML = this.engine.capturedPieces.white
            .map(type => this.pieceSymbols.white[type])
            .join(' ');

        capturedBlack.innerHTML = this.engine.capturedPieces.black
            .map(type => this.pieceSymbols.black[type])
            .join(' ');
    }

    /**
     * Update move history display
     */
    updateMoveHistory() {
        const historyElement = document.getElementById('moveHistory');
        historyElement.innerHTML = '';

        for (let i = 0; i < this.engine.moveHistory.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = this.engine.moveHistory[i];
            const blackMove = this.engine.moveHistory[i + 1] || '';

            const movePair = document.createElement('div');
            movePair.className = 'move-pair';

            const numberSpan = document.createElement('span');
            numberSpan.className = 'move-number';
            numberSpan.textContent = `${moveNumber}.`;

            const whiteSpan = document.createElement('span');
            whiteSpan.className = 'move-notation';
            whiteSpan.textContent = whiteMove;

            const blackSpan = document.createElement('span');
            blackSpan.className = 'move-notation';
            blackSpan.textContent = blackMove;

            movePair.appendChild(numberSpan);
            movePair.appendChild(whiteSpan);
            movePair.appendChild(blackSpan);

            historyElement.appendChild(movePair);
        }

        // Scroll to bottom
        historyElement.scrollTop = historyElement.scrollHeight;
    }

    /**
     * Check for game end and display message
     */
    checkGameEnd() {
        if (this.engine.gameOver) {
            const messageElement = document.getElementById('gameMessage');
            let message = '';
            let className = '';

            if (this.engine.winner === 'white') {
                message = '♔ White wins by checkmate! ♔';
                className = 'checkmate';
            } else if (this.engine.winner === 'black') {
                message = '♚ Black wins by checkmate! ♚';
                className = 'checkmate';
            } else if (this.engine.winner === 'draw') {
                const endReason = this.getDrawReason();
                message = `Game drawn by ${endReason}`;
                className = 'draw';
            }

            messageElement.textContent = message;
            messageElement.className = `game-message ${className}`;
        }
    }

    /**
     * Get the reason for draw
     */
    getDrawReason() {
        if (!this.engine.hasLegalMoves(this.engine.currentTurn) && !this.engine.isInCheck(this.engine.currentTurn)) {
            return 'stalemate';
        }
        if (this.engine.halfMoveClock >= 100) {
            return 'fifty-move rule';
        }
        if (this.engine.isInsufficientMaterial()) {
            return 'insufficient material';
        }

        const currentPosition = this.engine.getBoardHash();
        const repetitions = this.engine.positionHistory.filter(pos => pos === currentPosition).length;
        if (repetitions >= 3) {
            return 'threefold repetition';
        }

        return 'agreement';
    }

    /**
     * Show game message
     */
    showMessage(message, type = '') {
        const messageElement = document.getElementById('gameMessage');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
    }

    /**
     * Clear game message
     */
    clearMessage() {
        const messageElement = document.getElementById('gameMessage');
        messageElement.textContent = '';
        messageElement.className = 'game-message';
    }

    /**
     * Disable board interaction
     */
    disableBoard() {
        this.boardElement.style.pointerEvents = 'none';
    }

    /**
     * Enable board interaction
     */
    enableBoard() {
        this.boardElement.style.pointerEvents = 'auto';
    }

    /**
     * Reset UI
     */
    reset() {
        this.selectedSquare = null;
        this.legalMoves = [];
        this.clearMessage();
        this.enableBoard();
        this.updateBoard();
    }
}

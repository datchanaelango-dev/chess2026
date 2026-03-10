/**
 * Chess Engine - Complete FIDE Rules Implementation
 * Handles all chess logic including piece movement, special moves, and game state
 */

class ChessEngine {
    constructor() {
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.selectedSquare = null;
        this.gameOver = false;
        this.winner = null;

        // Game state tracking
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.enPassantTarget = null;
        this.halfMoveClock = 0; // For fifty-move rule
        this.fullMoveNumber = 1;
        this.moveHistory = [];
        this.positionHistory = []; // For threefold repetition
        this.capturedPieces = { white: [], black: [] };
        this.lastMove = null;
        this.historyStack = [];
    }

    /**
     * Initialize the chess board with starting position
     */
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Black pieces
        board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].map(p => ({ type: p, color: 'black' }));
        board[1] = Array.from({ length: 8 }, () => ({ type: 'p', color: 'black' }));

        // White pieces
        board[6] = Array.from({ length: 8 }, () => ({ type: 'p', color: 'white' }));
        board[7] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].map(p => ({ type: p, color: 'white' }));

        return board;
    }

    /**
     * Get piece at a specific position
     */
    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }

    /**
     * Check if a square is occupied by opponent
     */
    isOpponent(row, col, color) {
        const piece = this.getPiece(row, col);
        return piece && piece.color !== color;
    }

    /**
     * Check if a square is empty
     */
    isEmpty(row, col) {
        return this.getPiece(row, col) === null;
    }

    /**
     * Get all legal moves for a piece at a given position
     */
    getLegalMoves(row, col) {
        const piece = this.getPiece(row, col);
        if (!piece || piece.color !== this.currentTurn) return [];

        let moves = [];

        switch (piece.type) {
            case 'p':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'r':
                moves = this.getRookMoves(row, col, piece.color);
                break;
            case 'n':
                moves = this.getKnightMoves(row, col, piece.color);
                break;
            case 'b':
                moves = this.getBishopMoves(row, col, piece.color);
                break;
            case 'q':
                moves = this.getQueenMoves(row, col, piece.color);
                break;
            case 'k':
                moves = this.getKingMoves(row, col, piece.color);
                break;
        }

        // Filter out moves that would leave king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, piece.color));
    }

    /**
     * Get pawn moves including en passant
     */
    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        if (this.isEmpty(row + direction, col)) {
            moves.push({ row: row + direction, col, type: 'normal' });

            // Double move from starting position
            if (row === startRow && this.isEmpty(row + 2 * direction, col)) {
                moves.push({ row: row + 2 * direction, col, type: 'normal' });
            }
        }

        // Captures
        for (const dc of [-1, 1]) {
            const newCol = col + dc;
            if (newCol >= 0 && newCol <= 7) {
                // Regular capture
                if (this.isOpponent(row + direction, newCol, color)) {
                    moves.push({ row: row + direction, col: newCol, type: 'capture' });
                }

                // En passant
                if (this.enPassantTarget &&
                    this.enPassantTarget.row === row + direction &&
                    this.enPassantTarget.col === newCol) {
                    moves.push({ row: row + direction, col: newCol, type: 'enpassant' });
                }
            }
        }

        return moves;
    }

    /**
     * Get rook moves (straight lines)
     */
    getRookMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ]);
    }

    /**
     * Get bishop moves (diagonals)
     */
    getBishopMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }

    /**
     * Get queen moves (rook + bishop)
     */
    getQueenMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }

    /**
     * Get sliding piece moves (rook, bishop, queen)
     */
    getSlidingMoves(row, col, color, directions) {
        const moves = [];

        for (const [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;

            while (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                if (this.isEmpty(newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol, type: 'normal' });
                } else if (this.isOpponent(newRow, newCol, color)) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                    break;
                } else {
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        }

        return moves;
    }

    /**
     * Get knight moves (L-shape)
     */
    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dr, dc] of knightMoves) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                if (this.isEmpty(newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol, type: 'normal' });
                } else if (this.isOpponent(newRow, newCol, color)) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                }
            }
        }

        return moves;
    }

    /**
     * Get king moves including castling
     */
    getKingMoves(row, col, color) {
        const moves = [];

        // Normal king moves
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                const newRow = row + dr;
                const newCol = col + dc;

                if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                    if (this.isEmpty(newRow, newCol)) {
                        moves.push({ row: newRow, col: newCol, type: 'normal' });
                    } else if (this.isOpponent(newRow, newCol, color)) {
                        moves.push({ row: newRow, col: newCol, type: 'capture' });
                    }
                }
            }
        }

        // Castling
        if (!this.isInCheck(color)) {
            // Kingside castling
            if (this.castlingRights[color].kingside) {
                if (this.isEmpty(row, 5) && this.isEmpty(row, 6) &&
                    !this.isSquareAttacked(row, 5, color) &&
                    !this.isSquareAttacked(row, 6, color)) {
                    moves.push({ row, col: 6, type: 'castle-kingside' });
                }
            }

            // Queenside castling
            if (this.castlingRights[color].queenside) {
                if (this.isEmpty(row, 3) && this.isEmpty(row, 2) && this.isEmpty(row, 1) &&
                    !this.isSquareAttacked(row, 3, color) &&
                    !this.isSquareAttacked(row, 2, color)) {
                    moves.push({ row, col: 2, type: 'castle-queenside' });
                }
            }
        }

        return moves;
    }

    /**
     * Check if a move would leave the king in check
     */
    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Make temporary move
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        const inCheck = this.isInCheck(color);

        // Undo move
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = capturedPiece;

        return inCheck;
    }

    /**
     * Check if a color's king is in check
     */
    isInCheck(color) {
        const kingPos = this.findKing(color);
        if (!kingPos) return false;
        return this.isSquareAttacked(kingPos.row, kingPos.col, color);
    }

    /**
     * Find king position for a color
     */
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'k' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    /**
     * Check if a square is attacked by opponent
     */
    isSquareAttacked(row, col, color) {
        const opponent = color === 'white' ? 'black' : 'white';

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === opponent) {
                    const moves = this.getPieceMoves(r, c, piece);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Get basic king moves (8 adjacent squares only, no castling)
     * Used for attack detection to avoid infinite recursion
     */
    getBasicKingMoves(row, col, color) {
        const moves = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                    if (this.isEmpty(newRow, newCol)) {
                        moves.push({ row: newRow, col: newCol, type: 'normal' });
                    } else if (this.isOpponent(newRow, newCol, color)) {
                        moves.push({ row: newRow, col: newCol, type: 'capture' });
                    }
                }
            }
        }
        return moves;
    }

    /**
     * Get raw piece moves without check validation
     */
    getPieceMoves(row, col, piece) {
        switch (piece.type) {
            case 'p': return this.getPawnMoves(row, col, piece.color);
            case 'r': return this.getRookMoves(row, col, piece.color);
            case 'n': return this.getKnightMoves(row, col, piece.color);
            case 'b': return this.getBishopMoves(row, col, piece.color);
            case 'q': return this.getQueenMoves(row, col, piece.color);
            case 'k': return this.getBasicKingMoves(row, col, piece.color);
            default: return [];
        }
    }

    /**
     * Make a move on the board
     */
    makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = 'q') {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;

        const moves = this.getLegalMoves(fromRow, fromCol);
        const move = moves.find(m => m.row === toRow && m.col === toCol);

        if (!move) return false;

        // Save current state for undo
        this.historyStack.push({
            board: this.board.map(row => row.map(piece => piece ? { ...piece } : null)),
            currentTurn: this.currentTurn,
            castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
            enPassantTarget: this.enPassantTarget ? { ...this.enPassantTarget } : null,
            halfMoveClock: this.halfMoveClock,
            fullMoveNumber: this.fullMoveNumber,
            gameOver: this.gameOver,
            winner: this.winner,
            moveHistory: [...this.moveHistory],
            positionHistory: [...this.positionHistory],
            capturedPieces: {
                white: [...this.capturedPieces.white],
                black: [...this.capturedPieces.black]
            },
            lastMove: this.lastMove ? { ...this.lastMove } : null
        });

        // Handle captures
        const capturedPiece = this.board[toRow][toCol];
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece.type);
            this.halfMoveClock = 0;
        }

        // Handle special moves
        if (move.type === 'enpassant') {
            const captureRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            const enPassantPiece = this.board[captureRow][toCol];
            this.capturedPieces[enPassantPiece.color].push('p');
            this.board[captureRow][toCol] = null;
            this.halfMoveClock = 0;
        } else if (move.type === 'castle-kingside') {
            this.board[fromRow][5] = this.board[fromRow][7];
            this.board[fromRow][7] = null;
        } else if (move.type === 'castle-queenside') {
            this.board[fromRow][3] = this.board[fromRow][0];
            this.board[fromRow][0] = null;
        }

        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Handle pawn promotion
        if (piece.type === 'p' && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = { type: promotionPiece, color: piece.color };
        }

        // Update en passant target
        if (piece.type === 'p' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = {
                row: (fromRow + toRow) / 2,
                col: toCol
            };
        } else {
            this.enPassantTarget = null;
        }

        // Update castling rights
        if (piece.type === 'k') {
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        } else if (piece.type === 'r') {
            if (fromCol === 0) this.castlingRights[piece.color].queenside = false;
            if (fromCol === 7) this.castlingRights[piece.color].kingside = false;
        }

        // Update move counters
        if (piece.type === 'p' || capturedPiece) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }

        if (piece.color === 'black') {
            this.fullMoveNumber++;
        }

        // Record move
        const notation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, move, promotionPiece);
        this.moveHistory.push(notation);
        this.lastMove = { fromRow, fromCol, toRow, toCol };

        // Record position for repetition detection
        this.positionHistory.push(this.getBoardHash());

        // Switch turn
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';

        // Check game end conditions
        this.checkGameEnd();

        return true;
    }

    /**
     * Undo the last move
     */
    undoMove() {
        if (this.historyStack.length === 0) return false;

        const prevState = this.historyStack.pop();

        this.board = prevState.board;
        this.currentTurn = prevState.currentTurn;
        this.castlingRights = prevState.castlingRights;
        this.enPassantTarget = prevState.enPassantTarget;
        this.halfMoveClock = prevState.halfMoveClock;
        this.fullMoveNumber = prevState.fullMoveNumber;
        this.gameOver = prevState.gameOver;
        this.winner = prevState.winner;
        this.moveHistory = prevState.moveHistory;
        this.positionHistory = prevState.positionHistory;
        this.capturedPieces = prevState.capturedPieces;
        this.lastMove = prevState.lastMove;

        return true;
    }

    /**
     * Get algebraic notation for a move
     */
    getMoveNotation(fromRow, fromCol, toRow, toCol, piece, move, promotionPiece) {
        if (move.type === 'castle-kingside') return 'O-O';
        if (move.type === 'castle-queenside') return 'O-O-O';

        let notation = '';

        if (piece.type !== 'p') {
            notation += piece.type.toUpperCase();
        }

        if (move.type === 'capture' || move.type === 'enpassant') {
            if (piece.type === 'p') {
                notation += String.fromCharCode(97 + fromCol);
            }
            notation += 'x';
        }

        notation += String.fromCharCode(97 + toCol) + (8 - toRow);

        if (piece.type === 'p' && (toRow === 0 || toRow === 7)) {
            notation += '=' + promotionPiece.toUpperCase();
        }

        return notation;
    }

    /**
     * Get board hash for position tracking
     */
    getBoardHash() {
        let hash = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                hash += piece ? piece.color[0] + piece.type : '-';
            }
        }
        return hash;
    }

    /**
     * Check for game end conditions
     */
    checkGameEnd() {
        // Check for checkmate or stalemate
        if (!this.hasLegalMoves(this.currentTurn)) {
            if (this.isInCheck(this.currentTurn)) {
                this.gameOver = true;
                this.winner = this.currentTurn === 'white' ? 'black' : 'white';
                return 'checkmate';
            } else {
                this.gameOver = true;
                this.winner = 'draw';
                return 'stalemate';
            }
        }

        // Fifty-move rule
        if (this.halfMoveClock >= 100) {
            this.gameOver = true;
            this.winner = 'draw';
            return 'fifty-move';
        }

        // Threefold repetition
        const currentPosition = this.getBoardHash();
        const repetitions = this.positionHistory.filter(pos => pos === currentPosition).length;
        if (repetitions >= 3) {
            this.gameOver = true;
            this.winner = 'draw';
            return 'repetition';
        }

        // Insufficient material
        if (this.isInsufficientMaterial()) {
            this.gameOver = true;
            this.winner = 'draw';
            return 'insufficient-material';
        }

        return null;
    }

    /**
     * Check if current player has any legal moves
     */
    hasLegalMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    if (this.getLegalMoves(row, col).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Check for insufficient material draw
     */
    isInsufficientMaterial() {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    pieces.push(piece);
                }
            }
        }

        // King vs King
        if (pieces.length === 2) return true;

        // King + minor piece vs King
        if (pieces.length === 3) {
            const hasOnlyMinor = pieces.some(p => p.type === 'b' || p.type === 'n');
            return hasOnlyMinor;
        }

        // King + Bishop vs King + Bishop (same color squares)
        if (pieces.length === 4) {
            const bishops = pieces.filter(p => p.type === 'b');
            if (bishops.length === 2) {
                // Check if bishops are on same color squares
                let bishopSquares = [];
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const piece = this.board[row][col];
                        if (piece && piece.type === 'b') {
                            bishopSquares.push((row + col) % 2);
                        }
                    }
                }
                return bishopSquares[0] === bishopSquares[1];
            }
        }

        return false;
    }

    /**
     * Get all legal moves for current player
     */
    getAllLegalMoves() {
        const allMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentTurn) {
                    const moves = this.getLegalMoves(row, col);
                    moves.forEach(move => {
                        allMoves.push({
                            from: { row, col },
                            to: { row: move.row, col: move.col },
                            piece: piece
                        });
                    });
                }
            }
        }
        return allMoves;
    }

    /**
     * Reset the game
     */
    reset() {
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.selectedSquare = null;
        this.gameOver = false;
        this.winner = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.moveHistory = [];
        this.positionHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.lastMove = null;
    }
}

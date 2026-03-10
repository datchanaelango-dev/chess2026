/**
 * Chess AI - Bot opponents with multiple difficulty levels
 * Easy: Random legal moves
 * Medium: Minimax with depth 2 and material evaluation
 * Hard: Minimax with alpha-beta pruning, depth 4, and advanced evaluation
 */

class ChessAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;

        // Piece values for material evaluation
        this.pieceValues = {
            'p': 100,
            'n': 320,
            'b': 330,
            'r': 500,
            'q': 900,
            'k': 20000
        };

        // Piece-square tables for positional evaluation
        this.pawnTable = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5, 5, 10, 25, 25, 10, 5, 5],
            [0, 0, 0, 20, 20, 0, 0, 0],
            [5, -5, -10, 0, 0, -10, -5, 5],
            [5, 10, 10, -20, -20, 10, 10, 5],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        this.knightTable = [
            [-50, -40, -30, -30, -30, -30, -40, -50],
            [-40, -20, 0, 0, 0, 0, -20, -40],
            [-30, 0, 10, 15, 15, 10, 0, -30],
            [-30, 5, 15, 20, 20, 15, 5, -30],
            [-30, 0, 15, 20, 20, 15, 0, -30],
            [-30, 5, 10, 15, 15, 10, 5, -30],
            [-40, -20, 0, 5, 5, 0, -20, -40],
            [-50, -40, -30, -30, -30, -30, -40, -50]
        ];

        this.bishopTable = [
            [-20, -10, -10, -10, -10, -10, -10, -20],
            [-10, 0, 0, 0, 0, 0, 0, -10],
            [-10, 0, 5, 10, 10, 5, 0, -10],
            [-10, 5, 5, 10, 10, 5, 5, -10],
            [-10, 0, 10, 10, 10, 10, 0, -10],
            [-10, 10, 10, 10, 10, 10, 10, -10],
            [-10, 5, 0, 0, 0, 0, 5, -10],
            [-20, -10, -10, -10, -10, -10, -10, -20]
        ];

        this.rookTable = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [5, 10, 10, 10, 10, 10, 10, 5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [0, 0, 0, 5, 5, 0, 0, 0]
        ];

        this.queenTable = [
            [-20, -10, -10, -5, -5, -10, -10, -20],
            [-10, 0, 0, 0, 0, 0, 0, -10],
            [-10, 0, 5, 5, 5, 5, 0, -10],
            [-5, 0, 5, 5, 5, 5, 0, -5],
            [0, 0, 5, 5, 5, 5, 0, -5],
            [-10, 5, 5, 5, 5, 5, 0, -10],
            [-10, 0, 5, 0, 0, 0, 0, -10],
            [-20, -10, -10, -5, -5, -10, -10, -20]
        ];

        this.kingMiddleGameTable = [
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-20, -30, -30, -40, -40, -30, -30, -20],
            [-10, -20, -20, -20, -20, -20, -20, -10],
            [20, 20, 0, 0, 0, 0, 20, 20],
            [20, 30, 10, 0, 0, 10, 30, 20]
        ];

        // Opening book in algebraic notation (matches engine.moveHistory)
        this.openingBook = {
            "": ["e4", "d4", "c4", "Nf3"],
            "e4": ["e5", "c5", "e6", "c6"],
            "e4 e5": ["Nf3"],
            "e4 e5 Nf3": ["Nc6", "d6", "Nf6"],
            "d4": ["d5", "Nf3", "e6"],
            "d4 d5": ["c4"],
            "e4 c5": ["Nf3", "Nc3", "d4"],
            "e4 e6": ["d4", "d5"],
            "e4 c6": ["d4", "d5"],
            "Nf3": ["d5", "Nf6"],
        };
    }

    /**
     * Get the best move for the current position
     */
    getBestMove(engine) {
        // Try opening book first
        const bookMove = this.checkOpeningBook(engine);
        if (bookMove) return bookMove;

        switch (this.difficulty) {
            case 'easy':
                return this.getRandomMove(engine);
            case 'medium':
                return this.getAlphaBetaMove(engine, 3); // Increased depth with alpha-beta
            case 'hard':
                return this.getAlphaBetaMove(engine, 4);
            default:
                return this.getRandomMove(engine);
        }
    }

    /**
     * Check opening book for current position
     */
    checkOpeningBook(engine) {
        // Only use opening book for the first few moves
        if (engine.moveHistory.length > 10) return null;

        const historyString = engine.moveHistory.join(" ");
        const nextMoves = this.openingBook[historyString];

        if (nextMoves && nextMoves.length > 0) {
            const nextMoveNotation = nextMoves[Math.floor(Math.random() * nextMoves.length)];

            // Search all legal moves for one that matches this notation
            const allMoves = engine.getAllLegalMoves();
            const matchingMove = allMoves.find(m => {
                const notation = engine.getMoveNotation(m.from.row, m.from.col, m.to.row, m.to.col, m.piece, m, 'q');
                // Basic check - notation might have + or # or differ in ambiguity
                return notation.startsWith(nextMoveNotation);
            });

            if (matchingMove) return matchingMove;
        }
        return null;
    }

    /**
     * Easy difficulty: Random legal move
     */
    getRandomMove(engine) {
        const allMoves = engine.getAllLegalMoves();
        if (allMoves.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * allMoves.length);
        return allMoves[randomIndex];
    }

    /**
     * Hard difficulty: Minimax with alpha-beta pruning and depth 4
     */
    getAlphaBetaMove(engine, depth) {
        const allMoves = engine.getAllLegalMoves();
        if (allMoves.length === 0) return null;

        // Sort moves by predicted quality
        this.orderMoves(engine, allMoves);

        let bestMove = null;
        let bestValue = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;
        const isMaximizing = engine.currentTurn === 'white';

        for (const move of allMoves) {
            // Make the move
            const promotionPiece = move.piece.type === 'p' && (move.to.row === 0 || move.to.row === 7) ? 'q' : 'q';
            engine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col, promotionPiece);

            const value = this.alphaBetaEvaluate(engine, depth - 1, alpha, beta, !isMaximizing);

            // Undo the move
            engine.undoMove();

            if (isMaximizing) {
                if (value > bestValue) {
                    bestValue = value;
                    bestMove = move;
                }
                alpha = Math.max(alpha, value);
            } else {
                if (value < bestValue || bestValue === -Infinity) {
                    bestValue = value;
                    bestMove = move;
                }
                beta = Math.min(beta, value);
            }
        }

        return bestMove;
    }

    /**
     * Alpha-beta pruning recursive evaluation
     */
    alphaBetaEvaluate(engine, depth, alpha, beta, isMaximizing) {
        // Base case: depth 0
        if (depth === 0) {
            return this.quiescenceEvaluate(engine, alpha, beta, isMaximizing);
        }

        // Game over
        if (engine.gameOver) {
            return this.evaluatePositionAdvanced(engine);
        }

        const allMoves = engine.getAllLegalMoves();
        this.orderMoves(engine, allMoves);

        if (isMaximizing) {
            let maxValue = -Infinity;
            for (const nextMove of allMoves) {
                const promotionPiece = nextMove.piece.type === 'p' && (nextMove.to.row === 0 || nextMove.to.row === 7) ? 'q' : 'q';
                engine.makeMove(nextMove.from.row, nextMove.from.col, nextMove.to.row, nextMove.to.col, promotionPiece);

                const value = this.alphaBetaEvaluate(engine, depth - 1, alpha, beta, false);
                engine.undoMove();

                maxValue = Math.max(maxValue, value);
                alpha = Math.max(alpha, value);
                if (beta <= alpha) break; // Beta cutoff
            }
            return maxValue;
        } else {
            let minValue = Infinity;
            for (const nextMove of allMoves) {
                const promotionPiece = nextMove.piece.type === 'p' && (nextMove.to.row === 0 || nextMove.to.row === 7) ? 'q' : 'q';
                engine.makeMove(nextMove.from.row, nextMove.from.col, nextMove.to.row, nextMove.to.col, promotionPiece);

                const value = this.alphaBetaEvaluate(engine, depth - 1, alpha, beta, true);
                engine.undoMove();

                minValue = Math.min(minValue, value);
                beta = Math.min(beta, value);
                if (beta <= alpha) break; // Alpha cutoff
            }
            return minValue;
        }
    }

    /**
     * Quiescence search to avoid horizon effect
     */
    quiescenceEvaluate(engine, alpha, beta, isMaximizing) {
        const standPat = this.evaluatePositionAdvanced(engine);

        if (isMaximizing) {
            if (standPat >= beta) return beta;
            if (alpha < standPat) alpha = standPat;

            const captureMoves = engine.getAllLegalMoves().filter(m => m.type === 'capture' || m.type === 'enpassant');
            this.orderMoves(engine, captureMoves);

            for (const move of captureMoves) {
                const promotionPiece = move.piece.type === 'p' && (move.to.row === 0 || move.to.row === 7) ? 'q' : 'q';
                engine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col, promotionPiece);
                const score = this.quiescenceEvaluate(engine, alpha, beta, !isMaximizing);
                engine.undoMove();

                if (score >= beta) return beta;
                if (score > alpha) alpha = score;
            }
            return alpha;
        } else {
            if (standPat <= alpha) return alpha;
            if (beta > standPat) beta = standPat;

            const captureMoves = engine.getAllLegalMoves().filter(m => m.type === 'capture' || m.type === 'enpassant');
            this.orderMoves(engine, captureMoves);

            for (const move of captureMoves) {
                const promotionPiece = move.piece.type === 'p' && (move.to.row === 0 || move.to.row === 7) ? 'q' : 'q';
                engine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col, promotionPiece);
                const score = this.quiescenceEvaluate(engine, alpha, beta, !isMaximizing);
                engine.undoMove();

                if (score <= alpha) return alpha;
                if (score < beta) beta = score;
            }
            return beta;
        }
    }

    /**
     * Order moves to improve pruning efficiency
     */
    orderMoves(engine, moves) {
        moves.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            // Prioritize captures (MVV-LVA)
            const targetA = engine.board[a.to.row][a.to.col];
            const targetB = engine.board[b.to.row][b.to.col];

            if (targetA) scoreA = 10 * this.pieceValues[targetA.type] - this.pieceValues[a.piece.type] / 10;
            if (targetB) scoreB = 10 * this.pieceValues[targetB.type] - this.pieceValues[b.piece.type] / 10;

            // Prioritize promotions
            if (a.piece.type === 'p' && (a.to.row === 0 || a.to.row === 7)) scoreA += 900;
            if (b.piece.type === 'p' && (b.to.row === 0 || b.to.row === 7)) scoreB += 900;

            return scoreB - scoreA;
        });
    }

    /**
     * Basic position evaluation (material only)
     */
    evaluatePosition(engine) {
        if (engine.gameOver) {
            if (engine.winner === 'white') return 100000;
            if (engine.winner === 'black') return -100000;
            return 0; // Draw
        }

        let score = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece) {
                    const value = this.pieceValues[piece.type];
                    score += piece.color === 'white' ? value : -value;
                }
            }
        }

        return score;
    }

    /**
     * Advanced position evaluation (material + position + structure)
     */
    evaluatePositionAdvanced(engine) {
        if (engine.gameOver) {
            if (engine.winner === 'white') return 100000;
            if (engine.winner === 'black') return -100000;
            return 0; // Draw
        }

        let score = 0;
        // Material and Positional Score
        let materialScore = 0;
        let whitePieces = 0;
        let blackPieces = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece) {
                    let value = this.pieceValues[piece.type];
                    value += this.getPieceSquareValue(piece, row, col);

                    if (piece.color === 'white') {
                        materialScore += value;
                        whitePieces++;
                    } else {
                        materialScore -= value;
                        blackPieces++;
                    }
                }
            }
        }

        score += materialScore;

        // Mobility bonus (simplified to avoiding calling getAllLegalMoves which is expensive)
        // score += this.evaluateMobility(engine); 

        // Center control
        score += this.evaluateCenterControl(engine);

        // Pawn structure
        score += this.evaluatePawnStructure(engine);

        // King safety (only in middle game)
        const totalPieces = whitePieces + blackPieces;
        const isEndgame = totalPieces < 10;

        if (!isEndgame) {
            score += this.evaluateKingSafety(engine);
        }

        return score;
    }

    /**
     * Evaluate mobility (number of legal moves)
     */
    evaluateMobility(engine) {
        const currentTurn = engine.currentTurn;

        // This is expensive to call getAllLegalMoves for both sides
        // We evaluate mobility for the current turn side
        const moves = engine.getAllLegalMoves().length;
        const bonus = moves * 2;

        return currentTurn === 'white' ? bonus : -bonus;
    }

    /**
     * Evaluate king safety
     */
    evaluateKingSafety(engine) {
        let score = 0;
        const whiteKing = engine.findKing('white');
        const blackKing = engine.findKing('black');

        if (whiteKing) score += this.evaluateKingPawnShield(engine, whiteKing, 'white');
        if (blackKing) score -= this.evaluateKingPawnShield(engine, blackKing, 'black');

        return score;
    }

    /**
     * Evaluate pawn shield in front of king
     */
    evaluateKingPawnShield(engine, kingPos, color) {
        let shieldBonus = 0;
        const row = kingPos.row;
        const col = kingPos.col;
        const direction = color === 'white' ? -1 : 1;
        const nextRow = row + direction;

        if (nextRow >= 0 && nextRow <= 7) {
            for (let dc = -1; dc <= 1; dc++) {
                const nc = col + dc;
                if (nc >= 0 && nc <= 7) {
                    const piece = engine.board[nextRow][nc];
                    if (piece && piece.type === 'p' && piece.color === color) {
                        shieldBonus += 15;
                    }
                }
            }
        }

        return shieldBonus;
    }

    /**
     * Get piece-square table value
     */
    getPieceSquareValue(piece, row, col) {
        let table;

        switch (piece.type) {
            case 'p': table = this.pawnTable; break;
            case 'n': table = this.knightTable; break;
            case 'b': table = this.bishopTable; break;
            case 'r': table = this.rookTable; break;
            case 'q': table = this.queenTable; break;
            case 'k': table = this.kingMiddleGameTable; break;
            default: return 0;
        }

        // Flip table for black pieces
        const tableRow = piece.color === 'white' ? row : 7 - row;
        return table[tableRow][col];
    }

    /**
     * Evaluate center control
     */
    evaluateCenterControl(engine) {
        let score = 0;
        const centerSquares = [
            [3, 3], [3, 4], [4, 3], [4, 4]
        ];

        for (const [row, col] of centerSquares) {
            const piece = engine.board[row][col];
            if (piece) {
                score += piece.color === 'white' ? 10 : -10;
            }
        }

        return score;
    }

    /**
     * Evaluate pawn structure
     */
    evaluatePawnStructure(engine) {
        let score = 0;

        // Penalize doubled pawns
        for (let col = 0; col < 8; col++) {
            let whitePawns = 0;
            let blackPawns = 0;

            for (let row = 0; row < 8; row++) {
                const piece = engine.board[row][col];
                if (piece && piece.type === 'p') {
                    if (piece.color === 'white') whitePawns++;
                    else blackPawns++;
                }
            }

            if (whitePawns > 1) score -= (whitePawns - 1) * 10;
            if (blackPawns > 1) score += (blackPawns - 1) * 10;
        }

        return score;
    }

}

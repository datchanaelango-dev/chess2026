/**
 * Main Application Controller
 * Manages game flow, dialogs, and bot integration
 */

let engine;
let ui;
let ai;
let gameMode = 'pvp'; // 'pvp' or 'pvb'
let botDifficulty = 'medium';
let playerColor = 'white';
let botThinking = false;

/**
 * Initialize the application
 */
function initializeApp() {
    engine = new ChessEngine();
    ui = new ChessUI(engine);

    // Initialize board immediately so pieces are visible
    ui.initializeBoard();

    setupEventListeners();
    showNewGameDialog();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // New game dialog
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameMode = btn.dataset.mode;

            const botOptions = document.getElementById('botOptions');
            if (gameMode === 'pvb') {
                botOptions.style.display = 'block';
            } else {
                botOptions.style.display = 'none';
            }
        });
    });

    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            botDifficulty = btn.dataset.difficulty;
        });
    });

    const colorBtns = document.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            playerColor = btn.dataset.color;
        });
    });

    document.getElementById('startGameBtn').addEventListener('click', startNewGame);
    document.getElementById('newGameBtn').addEventListener('click', showNewGameDialog);
    document.getElementById('resignBtn').addEventListener('click', resignGame);
}

/**
 * Show new game dialog
 */
function showNewGameDialog() {
    const dialog = document.getElementById('newGameDialog');
    dialog.style.display = 'flex';
}

/**
 * Hide new game dialog
 */
function hideNewGameDialog() {
    const dialog = document.getElementById('newGameDialog');
    dialog.style.display = 'none';
}

/**
 * Start a new game
 */
function startNewGame() {
    hideNewGameDialog();

    // Reset engine and UI
    engine.reset();
    ui.reset();
    ui.initializeBoard();

    // Update game mode display
    const gameModeElement = document.getElementById('gameMode');
    if (gameMode === 'pvp') {
        gameModeElement.textContent = 'Player vs Player';
    } else {
        const difficultyText = botDifficulty.charAt(0).toUpperCase() + botDifficulty.slice(1);
        gameModeElement.textContent = `vs ${difficultyText} Bot`;

        // Initialize AI
        ai = new ChessAI(botDifficulty);

        // If player is black, bot makes first move
        if (playerColor === 'black') {
            setTimeout(() => makeBotMove(), 500);
        }
    }
}

/**
 * Make bot move
 */
async function makeBotMove() {
    if (botThinking || engine.gameOver) return;

    botThinking = true;
    ui.disableBoard();

    // Add delay for better UX
    await new Promise(resolve => setTimeout(resolve, 400));

    const move = ai.getBestMove(engine);

    if (move) {
        // Check for pawn promotion
        const promotionPiece = move.piece.type === 'p' && (move.to.row === 0 || move.to.row === 7) ? 'q' : 'q';

        const success = engine.makeMove(
            move.from.row,
            move.from.col,
            move.to.row,
            move.to.col,
            promotionPiece
        );

        if (success) {
            ui.updateBoard();
            ui.checkGameEnd();
        }
    }

    ui.enableBoard();
    botThinking = false;
}

/**
 * Override the UI's makeMove to trigger bot moves
 */
const originalMakeMove = ChessUI.prototype.makeMove;
ChessUI.prototype.makeMove = function (fromRow, fromCol, toRow, toCol, promotionPiece = 'q') {
    const success = originalMakeMove.call(this, fromRow, fromCol, toRow, toCol, promotionPiece);

    if (success && gameMode === 'pvb' && !engine.gameOver) {
        // Bot's turn
        setTimeout(() => makeBotMove(), 300);
    }

    return success;
};

/**
 * Resign the current game
 */
function resignGame() {
    if (engine.gameOver) return;

    const confirmResign = confirm('Are you sure you want to resign?');
    if (confirmResign) {
        engine.gameOver = true;

        if (gameMode === 'pvp') {
            const winner = engine.currentTurn === 'white' ? 'Black' : 'White';
            ui.showMessage(`${winner} wins by resignation!`, 'checkmate');
        } else {
            if (engine.currentTurn === playerColor) {
                ui.showMessage('You resigned. Bot wins!', 'checkmate');
            } else {
                ui.showMessage('Bot resigned. You win!', 'checkmate');
            }
        }
    }
}

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Escape to deselect
    if (e.key === 'Escape') {
        if (ui) ui.deselectSquare();
    }

    // N for new game
    if (e.key === 'n' || e.key === 'N') {
        if (!document.getElementById('newGameDialog').style.display ||
            document.getElementById('newGameDialog').style.display === 'none') {
            showNewGameDialog();
        }
    }
});

/**
 * Start the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', initializeApp);

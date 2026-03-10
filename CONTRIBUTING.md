# Contributing to Professional Chess

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Feature Requests](#feature-requests)
- [Bug Reports](#bug-reports)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Text editor or IDE (VS Code, Sublime Text, etc.)
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of chess rules (helpful but not required)

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/chess-application.git
   cd chess-application
   ```
3. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Open** `index.html` in your browser to test

### Recommended Tools

- **VS Code Extensions**:
  - Live Server (for local development)
  - ESLint (for code quality)
  - Prettier (for code formatting)
- **Browser DevTools** for debugging

## 💡 How to Contribute

### Types of Contributions

We welcome various types of contributions:

1. **Bug Fixes**: Fix issues in the existing code
2. **New Features**: Add new functionality
3. **Documentation**: Improve or add documentation
4. **UI/UX Improvements**: Enhance the user interface
5. **Performance Optimizations**: Make the code faster
6. **Tests**: Add or improve test coverage
7. **Code Refactoring**: Improve code quality

### Priority Areas

Current priorities for contributions:

- [ ] **Move Undo/Redo**: Implement move history navigation
- [ ] **Game Save/Load**: Add localStorage persistence
- [ ] **Sound Effects**: Add audio feedback for moves
- [ ] **Board Themes**: Create alternative color schemes
- [ ] **Move Hints**: Add beginner-friendly move suggestions
- [ ] **PGN Support**: Import/export games in PGN format
- [ ] **Time Controls**: Add chess clocks
- [ ] **Mobile Optimization**: Improve mobile experience

## 📝 Coding Standards

### JavaScript Style Guide

#### General Principles

- Use **clear, descriptive names** for variables and functions
- Write **self-documenting code** with comments for complex logic
- Follow **ES6+ standards** (const/let, arrow functions, etc.)
- Keep functions **small and focused** (single responsibility)

#### Naming Conventions

```javascript
// Classes: PascalCase
class ChessEngine { }

// Functions and methods: camelCase
function getLegalMoves() { }

// Constants: UPPER_SNAKE_CASE
const MAX_DEPTH = 4;

// Private properties: _camelCase (convention)
this._internalState = null;
```

#### Code Examples

**Good:**
```javascript
/**
 * Get all legal moves for a piece at the given position
 * @param {number} row - Row index (0-7)
 * @param {number} col - Column index (0-7)
 * @returns {Array} Array of legal move objects
 */
getLegalMoves(row, col) {
    const piece = this.getPiece(row, col);
    if (!piece || piece.color !== this.currentTurn) {
        return [];
    }
    
    // Generate moves based on piece type
    const moves = this.generatePieceMoves(piece, row, col);
    
    // Filter out moves that would leave king in check
    return moves.filter(move => 
        !this.wouldBeInCheck(row, col, move.row, move.col, piece.color)
    );
}
```

**Avoid:**
```javascript
// Bad: unclear names, no documentation
function gm(r, c) {
    let p = this.b[r][c];
    if (!p) return [];
    let m = [];
    // ... complex logic without comments
    return m;
}
```

### CSS Style Guide

#### Organization

```css
/* Group related styles together */
/* Use comments to separate sections */

/* ===== Variables ===== */
:root {
    --primary-color: #2c3e50;
}

/* ===== Base Styles ===== */
body {
    font-family: sans-serif;
}

/* ===== Components ===== */
.chessboard {
    display: grid;
}
```

#### Naming

- Use **kebab-case** for class names
- Use **semantic names** (what it is, not how it looks)
- Prefix component-specific classes

```css
/* Good */
.chess-board { }
.square-light { }
.piece-selected { }

/* Avoid */
.blue-box { }
.big-text { }
```

### HTML Style Guide

- Use **semantic HTML5** elements
- Include **proper meta tags** for SEO
- Add **ARIA labels** for accessibility
- Keep **indentation consistent** (2 or 4 spaces)

## 🧪 Testing Guidelines

### Manual Testing

Before submitting a PR, test the following:

#### Core Functionality
- [ ] All pieces move correctly
- [ ] Castling works in all scenarios
- [ ] En passant captures work
- [ ] Pawn promotion works
- [ ] Check detection is accurate
- [ ] Checkmate detection is accurate
- [ ] Stalemate detection is accurate

#### UI/UX
- [ ] Board renders correctly
- [ ] Pieces are clickable
- [ ] Legal moves are highlighted
- [ ] Move history updates
- [ ] Captured pieces display
- [ ] Dialogs work properly

#### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)

#### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Test Positions

Use these positions to verify functionality:

**Scholar's Mate:**
```
1. e4 e5
2. Bc4 Nc6
3. Qh5 Nf6
4. Qxf7# (checkmate)
```

**Stalemate Example:**
```
Set up position:
- White: King on a1
- Black: King on a3, Queen on b3
Black to move = stalemate
```

**En Passant:**
```
1. e4 a6
2. e5 d5
3. exd6 (en passant capture)
```

## 🔄 Pull Request Process

### Before Submitting

1. **Test thoroughly** on multiple browsers
2. **Update documentation** if needed
3. **Check code style** matches guidelines
4. **Ensure no console errors** or warnings
5. **Verify responsive design** works

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
How was this tested?

## Screenshots
If UI changes, add before/after screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Tested on multiple browsers
- [ ] No console errors
```

### Review Process

1. **Automated checks** will run (if configured)
2. **Maintainers will review** your code
3. **Feedback will be provided** if changes needed
4. **Approval and merge** once ready

### After Merge

- Your contribution will be acknowledged
- You'll be added to contributors list
- Changes will be included in next release

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test on latest version** to ensure bug still exists
3. **Gather information** about the bug

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- Browser: [e.g., Chrome 90]
- OS: [e.g., Windows 10]
- Device: [e.g., Desktop, iPhone 12]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing requests** to avoid duplicates
2. **Consider if it fits** the project scope
3. **Think about implementation** complexity

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this address?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Mockups, examples, or references
```

## 📚 Documentation

### What to Document

- **New features**: Add usage instructions
- **API changes**: Update function documentation
- **Configuration options**: Explain new settings
- **Breaking changes**: Clearly mark and explain

### Documentation Style

- Use **clear, simple language**
- Include **code examples**
- Add **screenshots** for UI features
- Keep **README.md updated**

## 🎯 Development Tips

### Debugging

```javascript
// Use console methods for debugging
console.log('Current turn:', engine.currentTurn);
console.table(engine.board); // View board state
console.trace(); // See call stack
```

### Performance

```javascript
// Measure performance
console.time('move-calculation');
const moves = engine.getLegalMoves(row, col);
console.timeEnd('move-calculation');
```

### Common Pitfalls

1. **Not checking for null**: Always validate piece existence
2. **Forgetting to clone state**: Deep copy when needed
3. **Off-by-one errors**: Remember arrays are 0-indexed
4. **Not testing edge cases**: Test boundary conditions

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Professional Chess! ♔♕♖♗♘♙

## 📧 Questions?

If you have questions about contributing:
- Open a GitHub Discussion
- Comment on relevant issues
- Reach out to maintainers

---

**Happy coding!** 🎉

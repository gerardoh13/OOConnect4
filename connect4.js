class Game {
  constructor(p1, p2, height = 6, width = 7) {
    this.players = [p1, p2];
    this.height = height;
    this.width = width;
    this.currPlayer = p1;
    this.makeBoard();
    this.makeHtmlBoard();
    this.gameOver = false;
  }

  /** Connect Four
   *
   * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
   * column until a player gets four-in-a-row (horiz, vert, or diag) or until
   * board fills (tie)
   */

  // let currPlayer = 1; // active player: 1 or 2
  // let board = []; // array of rows, each row is array of cells  (board[y][x])

  /** makeBoard: create in-JS board structure:
   *   board = array of rows, each row is array of cells  (board[y][x])
   */

  makeBoard() {
    this.board = [];
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */

  makeHtmlBoard() {
    const htmlBoard = document.getElementById("board");
    htmlBoard.innerText = "";
    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    top.addEventListener("click", this.handleClick.bind(this));
    top.addEventListener("mouseover", this.onMouseOver.bind(this));
    top.addEventListener("mouseout", this.onMouseOut.bind(this));
    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement("td");
      headCell.setAttribute("id", x);
      top.append(headCell);
    }

    htmlBoard.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement("tr");
      row.classList.add(`row${y}`);
      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement("td");
        cell.setAttribute("id", `${y}-${x}`);
        let roundDiv = document.createElement("div");
        roundDiv.classList.add("roundDiv");
        cell.append(roundDiv);
        row.append(cell);
      }

      htmlBoard.append(row);
    }
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */
  onMouseOver(e) {
    let newPiece = document.createElement("div");
    newPiece.classList.add("piece");
    newPiece.style.backgroundColor = this.currPlayer.color;
    e.target.append(newPiece);
  }
  //removes the piece from the top row if user moves mouse away from it
  onMouseOut(e) {
    e.target.firstChild.remove();
  }

  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place piece into HTML table of board */

  placeInTable(y, x) {
    const piece = document.createElement("div");
    piece.classList.add("piece", "drop");
    // piece.classList.add(`p${this.currPlayer}`);
    piece.style.backgroundColor = this.currPlayer.color;
    // piece.style.top = -50 * (y + 2);

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  /** endGame: announce game end */

  endGame(msg) {
    setTimeout(() => {
      alert(msg);
    }, 600);
  }

  /** handleClick: handle click of column top to play piece */

  handleClick(evt) {
    if (this.gameOver) {
      return;
    }
    // get x from ID of clicked cell
    const x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);

    // check for win
    if (this.checkForWin()) {
      this.gameOver = true;
      return this.endGame(`${this.currPlayer.color} player won!`);
    }

    // check for tie
    if (this.board.every((row) => row.every((cell) => cell))) {
      this.gameOver = true;
      return endGame("Tie!");
    }

    // switch players
    this.currPlayer =
      this.currPlayer === this.players[0] ? this.players[1] : this.players[0];
    evt.target.firstChild.remove();
    let newPiece = document.createElement("div");
    newPiece.classList.add("piece");
    newPiece.style.backgroundColor = this.currPlayer.color;

    evt.target.append(newPiece);
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin() {
    let _win = (cells) => {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer

      if (
        cells.every(
          ([y, x]) =>
            y >= 0 &&
            y < this.height &&
            x >= 0 &&
            x < this.width &&
            this.board[y][x] === this.currPlayer
        )
      ) {
        this.winAnimation(cells);
        return true;
      }
    };

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [
          [y, x],
          [y, x + 1],
          [y, x + 2],
          [y, x + 3],
        ];
        const vert = [
          [y, x],
          [y + 1, x],
          [y + 2, x],
          [y + 3, x],
        ];
        const diagDR = [
          [y, x],
          [y + 1, x + 1],
          [y + 2, x + 2],
          [y + 3, x + 3],
        ];
        const diagDL = [
          [y, x],
          [y + 1, x - 1],
          [y + 2, x - 2],
          [y + 3, x - 3],
        ];

        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
  winAnimation(cells) {
    setTimeout(() => {
      for (let cell of cells) {
        document
          .getElementById(`${cell[0]}-${cell[1]}`)
          .firstChild.nextElementSibling.classList.add("spin");
      }
    }, 550);
  }
}

class Player {
  constructor(color) {
    this.color = color;
  }
}

function checkValidColor(str) {
  if (!CSS.supports("color", str)) {
    alert(`${str} is not a supported color!`);
  }
  return CSS.supports("color", str);
}

// new Game();
document.getElementById("new-game").addEventListener("click", (e) => {
  e.preventDefault();
  let p1 = new Player(document.getElementById("p1-color").value);
  let p2 = new Player(document.getElementById("p2-color").value);
  if (checkValidColor(p1.color) && checkValidColor(p2.color)) {
    document.getElementById("pannel").classList.add("boardLegs");
    new Game(p1, p2);
  }
  document.getElementById("form").reset();
});

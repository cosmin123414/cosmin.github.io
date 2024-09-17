let grid, cells, tiles;
let mx = 0;
let my = 0;
let cellSize = 20;

// Variables to control colors
let lightGray = 1; // White
let darkGray = 1; // White

let paths = [
  [[0, 0], [0.5, 0], [0, 0.5]],
  [[0.5, 0], [1, 0], [1, 0.5], [0.5, 1], [0, 1], [0, 0.5]],
  [[1, 1], [1, 0.5], [0.5, 1]],
];

class Cell {
  constructor(x, y, left) {
    this.x = x;
    this.y = y;
    this.left = left;
    this.col = 1;
  }
  render() {
    let [x, y] = [this.x * cellSize, this.y * cellSize];
    let idx = this.left ? 0 : 2;
    let t = tiles[idx + 1 - this.col];
    image(t, x, y, cellSize, cellSize);
  }
}

function createTile(left, col) {
  let g = createGraphics(cellSize, cellSize);
  g.colorMode(HSB, 1, 1, 1);
  g.noStroke();
  g.scale(cellSize);
  if (left === 0) {
    g.translate(1, 0);
    g.scale(-1, 1);
  }
  
  for (let i = 0; i < 3; i++) {
    g.fill(0, 0, 1); // White color
    let path = paths[i];
    g.beginShape();
    path.forEach(p => vertex(p[0], p[1]));
    g.endShape(CLOSE);
  }
  
  g.strokeWeight(3 / cellSize);
  g.stroke(0, 0, 0.7); // Light gray stroke
  
  g.line(0.5, 0, 0, 0.5);
  g.line(1, 0.5, 0.5, 1);
  
  // Add noise texture
  let noiseTexture = createGraphics(cellSize, cellSize);
  noiseTexture.loadPixels();
  for (let i = 0; i < cellSize; i++) {
    for (let j = 0; j < cellSize; j++) {
      noiseTexture.set(i, j, color(0, 0, 0, random(0.1, 0.2)));
    }
  }
  noiseTexture.updatePixels();
  g.image(noiseTexture, 0, 0, 1, 1);
  
  return g;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 1, 1, 1);
  noLoop();
  init();
}

function createGrid() {
  grid = [];
  cells = [];
  tiles = [];
  gw = ceil(width / cellSize);
  gh = ceil(height / cellSize);
  for (let i = 0; i < gw; i++) {
    grid.push([]);
    for (let j = 0; j < gh; j++) {
      let cell = new Cell(i, j, random() < 0.5);
      grid[i].push(cell);
      cells.push(cell);
    }
  }
}

function updateColors() {
  for (let i = 0; i < gw; i++) {
    for (let j = 0; j < gh; j++) {
      let c = grid[i][j];
      if (i === 0) {
        if (j !== 0) {
          let c2 = grid[i][j - 1];
          if (c.left ^ c2.left) c.col = c2.col;
          else c.col = 1 - c2.col;
        }
      } else {
        let c2 = grid[i - 1][j];
        if (c.left ^ c2.left) c.col = c2.col;
        else c.col = 1 - c2.col;
      }
    }
  }
}

function createTiles() {
  tiles = [];
  tiles.push(createTile(0, 0));
  tiles.push(createTile(0, 1));
  tiles.push(createTile(1, 0));
  tiles.push(createTile(1, 1));
}

function init() {
  createGrid();
  createTiles();
  updateColors();
  redraw();
}

function draw() {
  background(255); // White background
  for (let i = 0; i < cells.length; i++) {
    cells[i].render();
  }
}

function mouseMoved() {
  let [px, py] = [mx, my];
  mx = floor(mouseX / cellSize);
  my = floor(mouseY / cellSize);
  if (px !== mx || py !== my) {
    let c = grid[mx][my];
    c.left ^= true;
    updateColors();
    redraw();
  }
}

function mousePressed() {
  init();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  init();
}

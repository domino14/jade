import * as THREE from "three";
import { BonusType } from "./board_layout";

const boardColor = 0x00ffbd;

const bonusColors = {
  [BonusType.TripleWord]: 0xff0000,
  [BonusType.DoubleWord]: 0xff9999,
  [BonusType.TripleLetter]: 0x0000ff,
  [BonusType.DoubleLetter]: 0x87ceeb,
  [BonusType.QuadrupleWord]: 0x00ff00,
  [BonusType.QuadrupleLetter]: 0x99ff99,
  [BonusType.StartingSquare]: 0x000000, // doesn't have a color
};

function addGameBoard(
  scene: THREE.Scene,
  layout: string[],
  boardThickness: number,
  gridSize: number,
  squareSize: number,
  wallThickness: number,
  wallHeight: number,
  gridHeight: number,
  offset: number
) {
  // Create the circular board
  const boardGeometry = new THREE.CylinderGeometry(55, 55, boardThickness, 64);
  const boardMaterial = new THREE.MeshPhongMaterial({
    color: boardColor,
    specular: 0xffffff,
    shininess: 50,
  });
  const board = new THREE.Mesh(boardGeometry, boardMaterial);
  board.rotation.x = Math.PI / 2;
  scene.add(board);

  // The center of the board is at 0,0,0.

  const gridBottomZPos = boardThickness / 2;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Determine if this square is a bonus square
      const bonusSquare = layout[i][j] as BonusType;
      const squareColor =
        bonusSquare !== BonusType.NoBonus ? bonusColors[bonusSquare] : 0xffffff;

      const squareGeometry = new THREE.BoxGeometry(
        squareSize,
        squareSize,
        gridHeight
      );
      const squareMaterial = new THREE.MeshPhongMaterial({
        color: squareColor,
        specular: squareColor,
        shininess: 50,
      });
      const square = new THREE.Mesh(squareGeometry, squareMaterial);
      square.position.set(
        i * squareSize - offset,
        j * squareSize - offset,
        gridBottomZPos + gridHeight / 2
      );
      scene.add(square);

      // Create thin walls around each square
      const wallMaterial = new THREE.MeshPhongMaterial({
        color: 0x222222,
        specular: 0xffffff,
        shininess: 0,
      });

      // Top wall
      const topWallGeometry = new THREE.BoxGeometry(
        squareSize,
        wallThickness,
        wallHeight
      );
      const topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
      topWall.position.set(
        i * squareSize - offset,
        j * squareSize - offset + squareSize / 2,
        gridBottomZPos + gridHeight
      );
      scene.add(topWall);

      // Bottom wall
      const bottomWallGeometry = new THREE.BoxGeometry(
        squareSize,
        wallThickness,
        wallHeight
      );
      const bottomWall = new THREE.Mesh(bottomWallGeometry, wallMaterial);
      bottomWall.position.set(
        i * squareSize - offset,
        j * squareSize - offset - squareSize / 2,
        gridBottomZPos + gridHeight
      );
      scene.add(bottomWall);

      // Left wall
      const leftWallGeometry = new THREE.BoxGeometry(
        wallThickness,
        squareSize,
        wallHeight
      );
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      leftWall.position.set(
        i * squareSize - offset - squareSize / 2,
        j * squareSize - offset,
        gridBottomZPos + gridHeight
      );
      scene.add(leftWall);

      // Right wall
      const rightWallGeometry = new THREE.BoxGeometry(
        wallThickness,
        squareSize,
        wallHeight
      );
      const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
      rightWall.position.set(
        i * squareSize - offset + squareSize / 2,
        j * squareSize - offset,
        gridBottomZPos + gridHeight
      );
      scene.add(rightWall);
    }
  }
}

export default addGameBoard;

// const fontLoader = new FontLoader();
// fontLoader.load(
//   "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
//   (font) => {
//     const createTile = (
//       letter: string,
//       score: number,
//       x: number,
//       y: number
//     ) => {};

//     // Example: create a few tiles
//     createTile("A", 1, 1, 1);
//     createTile("B", 3, 2, 2);
//     createTile("C", 3, 3, 3);
//     createTile("Q", 10, 4, 4);
//     createTile("M", 3, 5, 4);
//     createTile("W", 4, 6, 4);
//   }
// );

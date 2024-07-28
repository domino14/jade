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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export type ArrowProperties = {
  x: number;
  y: number;
  vertical: boolean;
  show: boolean;
};

function createStylishArrow() {
  const arrowGroup = new THREE.Group();

  // Shaft
  const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 32);
  const shaftMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
  shaft.position.set(0, 0, -1);
  arrowGroup.add(shaft);

  // Head
  const headGeometry = new THREE.ConeGeometry(0.2, 0.5, 32);
  const headMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 0, 1);
  arrowGroup.add(head);

  // Tail
  const tailGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const tailMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.set(0, 0, -2);
  arrowGroup.add(tail);

  return arrowGroup;
}

function addGameBoard(
  scene: THREE.Scene,
  camera: THREE.Camera,
  layout: string[],
  boardThickness: number,
  gridSize: number,
  squareSize: number,
  gridHeight: number,
  offset: number,
  squareClickHandler: (object: THREE.Object3D) => void,
  arrow: ArrowProperties
) {
  // Create the circular board
  const wallThickness = 0.25;
  const wallHeight = 0.55;
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
      square.userData.isBoardSquare = true; // Mark this mesh as a board square
      square.userData.gridX = i;
      square.userData.gridY = j;
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

      if (arrow.show && arrow.x === i && arrow.y === j) {
        console.log("adding arrow", arrow);
        const arrowMesh = createStylishArrow();
        scene.add(arrowMesh);
      }
    }
  }
  const container = document.getElementById("boardEl");
  // Add event listener for mouse clicks
  if (container) {
    container.addEventListener(
      "click",
      (event: MouseEvent) =>
        onMouseClick(event, camera, scene, container, squareClickHandler),
      false
    );
  }
}

function onMouseClick(
  event: MouseEvent,
  camera: THREE.Camera,
  scene: THREE.Scene,
  container: HTMLElement,
  squareClickHandler: (object: THREE.Object3D) => void
) {
  const rect = container.getBoundingClientRect();

  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the raycaster
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    squareClickHandler(intersectedObject);
  }
}

export default addGameBoard;

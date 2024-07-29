import { useMemo, useState } from "react";
import { ArrowProperties } from "./board_3d";
import { Canvas } from "@react-three/fiber";
import GameBoard from "./board_3d";
import { CrosswordGameGridLayout } from "./board_layout";
import Rack, { rackGeomParams } from "./rack_3d";
import { OrbitControls } from "@react-three/drei";
import Tile from "./tile_3d";
import Cameras from "./cameras_3d";

type BoardSceneProps = {
  is2D: boolean;
};

const gridSize = 15;
const squareSize = 5;
const boardThickness = 2;

const gridHeight = 1;
const tileDepth = 1;
const offset = (gridSize * squareSize) / 2 - squareSize / 2; // 35 ? why?

const rackHeight = 3;
const rackWidth = 40;
const rackDepth = 7;
const rackYPos = -38;
const boardTileZPos = boardThickness / 2 + gridHeight;

type BoardTileProps = {
  // gridPosX and gridPosY start counting from top left. We need to keep this
  // convention!
  gridPosX: number;
  gridPosY: number;
  gridSquareSize: number;
  letter: string;
  score: number;
  offset: number;
};

type RackTileProps = {
  pos: number; // 0 through 6 (or more?)
  gridSquareSize: number;
  letter: string;
  score: number;
  rackSlope: number;
};
const fontURL =
  "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json";

const BoardTile = (props: BoardTileProps) => {
  const { gridPosX, gridPosY, gridSquareSize, offset } = props;

  const x = gridPosX * gridSquareSize - offset - gridSquareSize / 2 + 0.375;
  const y =
    (gridSize - 1 - gridPosY) * gridSquareSize -
    offset -
    gridSquareSize / 2 +
    0.125;

  return (
    <group position={[x, y, boardTileZPos]}>
      <Tile
        fontUrl={fontURL}
        gridSquareSize={gridSquareSize}
        tileDepth={tileDepth}
        letter={props.letter}
        score={props.score}
      />
    </group>
  );
};

// const positionTileOnRack = (tile: THREE.Group, pos: number) => {
//   const xpos = -rackWidth / 2 + squareSize + pos * (squareSize - 0.6);
//   const ypos = rackYPos - squareSize - 0.9;
//   const zpos = -0.15;
//   tile.position.set(xpos, ypos, boardThickness / 2 + gridHeight + zpos);
//   tile.rotation.x = -Math.atan(rackSlope);
// };

const RackTile = (props: RackTileProps) => {
  let xpos =
    -rackWidth / 2 +
    props.gridSquareSize +
    props.pos * (props.gridSquareSize - 0.6);
  let ypos = rackYPos - props.gridSquareSize - 0.9;
  let zpos = 1.8;

  return (
    <group
      position={[xpos, ypos, zpos]}
      rotation={[-Math.atan(props.rackSlope), 0, 0]}
    >
      <Tile
        fontUrl={fontURL}
        gridSquareSize={props.gridSquareSize}
        tileDepth={tileDepth}
        letter={props.letter}
        score={props.score}
      />
    </group>
  );
};

const { slope: rackSlope } = rackGeomParams(rackHeight, rackDepth);

const BoardScene = (props: BoardSceneProps) => {
  const [arrow, setArrow] = useState<ArrowProperties>({
    x: 0,
    y: 0,
    vertical: false,
    show: false,
  });

  console.log("is2D", props.is2D);

  return (
    <Canvas
      style={{ width: "100%", height: "90vh" }}
      id="boardEl"
      frameloop="demand"
      // gl={{ antialias: false }} // Disable antialiasing
    >
      <Cameras is2D={props.is2D} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 200]} intensity={0.5} />
      <directionalLight position={[0, 200, 200]} intensity={0.5} />
      <GameBoard
        layout={CrosswordGameGridLayout}
        boardThickness={boardThickness}
        gridSize={gridSize}
        squareSize={squareSize}
        gridHeight={gridHeight}
        offset={offset}
        squareClickHandler={() => {}}
        arrow={arrow}
      />
      <Rack
        rackWidth={rackWidth}
        rackHeight={rackHeight}
        rackDepth={rackDepth}
        x={rackWidth / 2}
        y={rackYPos}
        z={boardThickness / 2}
      />
      <BoardTile
        gridPosX={1}
        gridPosY={3}
        gridSquareSize={squareSize}
        letter="A"
        score={1}
        offset={offset}
      />

      <RackTile
        pos={0}
        gridSquareSize={squareSize}
        letter="W"
        score={4}
        rackSlope={rackSlope}
      />

      <RackTile
        pos={1}
        gridSquareSize={squareSize}
        letter="W"
        score={4}
        rackSlope={rackSlope}
      />

      <RackTile
        pos={2}
        gridSquareSize={squareSize}
        letter="W"
        score={4}
        rackSlope={rackSlope}
      />

      <RackTile
        pos={3}
        gridSquareSize={squareSize}
        letter="W"
        score={4}
        rackSlope={rackSlope}
      />

      <RackTile
        pos={4}
        gridSquareSize={squareSize}
        letter="W"
        score={4}
        rackSlope={rackSlope}
      />

      <RackTile
        pos={5}
        gridSquareSize={squareSize}
        letter="W"
        score={4}
        rackSlope={rackSlope}
      />
      <RackTile
        pos={6}
        gridSquareSize={squareSize}
        letter="W"
        score={4}
        rackSlope={rackSlope}
      />
      <BoardTile
        gridPosX={10}
        gridPosY={7}
        gridSquareSize={squareSize}
        letter="X"
        score={8}
        offset={offset}
      />

      <OrbitControls enableDamping={false} target={[0, -10, 0]} />
    </Canvas>
  );
};

export default BoardScene;

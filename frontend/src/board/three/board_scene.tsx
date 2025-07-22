import { useCallback, useMemo, useState } from "react";
import { ArrowProperties } from "./board";
import { Canvas, useLoader } from "@react-three/fiber";
import GameBoard from "./board";
import { CrosswordGameGridLayout } from "../../constants/board_layout";
import Rack, { rackGeomParams } from "./rack";
import { Extrude, OrbitControls } from "@react-three/drei";
import Tile from "./tile";
import Cameras from "./cameras";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { ipc } from "../../../wailsjs/go/models";
import { Board } from "../../utils/cwgame/board";
import {
  englishLetterToML,
  scoreFor,
  StandardEnglishAlphabet,
} from "../../constants/alphabets";

type BoardSceneProps = {
  is2D: boolean;
  board?: ipc.GameBoard;
  rack?: number[];
};

const gridSize = 15;
const squareSize = 5;
const boardThickness = 2;

const gridHeight = 1;
const tileDepth = 1.5;
const offset = (gridSize * squareSize) / 2 - squareSize / 2; // 35 ? why?

const rackHeight = 3;
const rackWidth = 50;
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

// Column labels component
const ColumnLabels = () => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
  const font = useLoader(FontLoader, fontURL);
  
  return (
    <group>
      {columns.map((letter, index) => (
        <mesh
          key={letter}
          position={[
            index * squareSize - offset - squareSize / 4,
            offset + squareSize * 0.8,
            boardThickness / 2 + 0.01
          ]}
        >
          <textGeometry args={[letter, { 
            font: font, 
            size: 1.875, 
            depth: 0.05,
            curveSegments: 8,
            bevelEnabled: false
          }]} />
          <meshBasicMaterial attach="material" color={0x666666} />
        </mesh>
      ))}
    </group>
  );
};

// Row labels component  
const RowLabels = () => {
  const rows = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
  const font = useLoader(FontLoader, fontURL);
  
  return (
    <group>
      {rows.map((number, index) => {
        // Calculate text width for right alignment (rough approximation)
        const textWidth = number.length * 1.5; // Approximate character width
        
        return (
          <mesh
            key={number}
            position={[
              -offset - squareSize * 0.65 - textWidth, // Moved 1/4 square to the right (from 0.9 to 0.65)
              (14 - index) * squareSize - offset - squareSize / 4, // Moved up by quarter square (from + 0.3 to - squareSize / 4)
              boardThickness / 2 + 0.01
            ]}
          >
            <textGeometry args={[number, { 
              font: font, 
              size: 1.875, 
              depth: 0.05,
              curveSegments: 8,
              bevelEnabled: false
            }]} />
            <meshBasicMaterial attach="material" color={0x666666} />
          </mesh>
        );
      })}
    </group>
  );
};

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

function StylishArrow() {
  // Define the arrow shape
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0);
  arrowShape.lineTo(1, 0);
  arrowShape.lineTo(1, 3);
  arrowShape.lineTo(2.5, 3);
  arrowShape.lineTo(0.5, 5);
  arrowShape.lineTo(-1.5, 3);
  arrowShape.lineTo(0, 3);
  arrowShape.lineTo(0, 0);

  // Extrude settings with bevel
  const extrudeSettings = {
    depth: 1,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2,
  };

  return (
    <Extrude args={[arrowShape, extrudeSettings]}>
      <meshPhongMaterial color={0x00ffbd} specular={0xffffff} shininess={10} />
    </Extrude>
  );
}
const RackTile = (props: RackTileProps) => {
  let xpos =
    -rackWidth / 2 +
    2 * props.gridSquareSize +
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

function parseFEN(fen: string): string[][] {
  const rows = fen.split("/");
  const board: string[][] = [];

  for (const row of rows) {
    const boardRow: string[] = [];
    let i = 0;

    while (i < row.length) {
      const char = row[i];

      if (!isNaN(parseInt(char))) {
        // This is a number, meaning empty spaces
        let num = "";
        while (!isNaN(parseInt(row[i]))) {
          num += row[i];
          i++;
        }
        const emptySpaces = parseInt(num);
        for (let j = 0; j < emptySpaces; j++) {
          boardRow.push("");
        }
      } else {
        // This is a letter, representing a tile
        boardRow.push(char);
        i++;
      }
    }

    // Add the row to the board
    board.push(boardRow);
  }

  return board;
}

const BoardScene = (props: BoardSceneProps) => {
  const [arrow, setArrow] = useState<ArrowProperties>({
    x: 0,
    y: 0,
    vertical: false,
    show: false,
  });

  const squareClickHandler = useCallback(
    (i: number, j: number) => {
      if (!arrow.show) {
        setArrow({ x: i, y: j, vertical: false, show: true });
      } else {
        if (arrow.x === i && arrow.y === j) {
          if (!arrow.vertical) {
            setArrow({ x: i, y: j, vertical: true, show: true });
          } else {
            setArrow({ x: i, y: j, vertical: false, show: false });
          }
        } else {
          setArrow({ x: i, y: j, vertical: false, show: true });
        }
      }
    },
    [arrow]
  );

  const alphabet = StandardEnglishAlphabet;
  const fen =
    "I6BANISTER/N4ZOO3A3/OUGIYA5L3/S2TOPEE2AI3/I9UN3/t9KI3/O7F2T3/L6MERCY3/8R6/8R2V3/2OOF3I1WAG2/3DEPURATES3/8G6/8EX5/9UNCIAE";
  const rack = "DEGNNRU";
  const boardArray = useMemo(() => parseFEN(fen), [fen]);

  return (
    <Canvas
      style={{ width: "100%", height: "90vh" }}
      id="boardEl"
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
        squareClickHandler={squareClickHandler}
        arrow={arrow}
      />
      
      {/* Board labels */}
      <ColumnLabels />
      <RowLabels />
      {arrow.show && (
        <group
          position={[
            arrow.x * squareSize -
              offset -
              (arrow.vertical ? -squareSize / 15 : squareSize / 2.5),
            arrow.y * squareSize -
              offset +
              (arrow.vertical ? squareSize / 2.5 : squareSize / 15),
            boardTileZPos,
          ]}
          rotation={[0, 0, arrow.vertical ? Math.PI : -Math.PI / 2]}
          scale={[0.85, 0.85, 0.85]}
        >
          <StylishArrow />
        </group>
      )}

      <Rack
        rackWidth={rackWidth}
        rackHeight={rackHeight}
        rackDepth={rackDepth}
        x={rackWidth / 2}
        y={rackYPos}
        z={boardThickness / 2}
      />

      {boardArray.map((row, y) =>
        row.map((tile, x) =>
          tile !== "" ? (
            <BoardTile
              key={`${x}-${y}`}
              gridPosX={x}
              gridPosY={y}
              gridSquareSize={squareSize}
              letter={tile}
              score={scoreFor(StandardEnglishAlphabet, englishLetterToML(tile))}
              offset={offset}
            />
          ) : null
        )
      )}

      <RackTile
        pos={0}
        gridSquareSize={squareSize}
        letter="B"
        score={3}
        rackSlope={rackSlope}
      />

      <RackTile
        pos={1}
        gridSquareSize={squareSize}
        letter="D"
        score={2}
        rackSlope={rackSlope}
      />

      <RackTile
        pos={2}
        gridSquareSize={squareSize}
        letter="E"
        score={1}
        rackSlope={rackSlope}
      />

      <RackTile
        pos={3}
        gridSquareSize={squareSize}
        letter="I"
        score={1}
        rackSlope={rackSlope}
      />

      <RackTile
        pos={4}
        gridSquareSize={squareSize}
        letter="N"
        score={1}
        rackSlope={rackSlope}
      />

      <RackTile
        pos={5}
        gridSquareSize={squareSize}
        letter="O"
        score={1}
        rackSlope={rackSlope}
      />
      <RackTile
        pos={6}
        gridSquareSize={squareSize}
        letter="Q"
        score={10}
        rackSlope={rackSlope}
      />

      <OrbitControls enableDamping={false} target={[0, -10, 0]} />
    </Canvas>
  );
};

export default BoardScene;

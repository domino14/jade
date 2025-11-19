import { useCallback, useMemo, useState } from "react";
import { ArrowProperties } from "./board";
import { Canvas, useLoader } from "@react-three/fiber";
import GameBoard from "./board";
import { CrosswordGameGridLayout } from "../../constants/board_layout";
import Rack, { rackGeomParams } from "./rack";
import { Extrude, OrbitControls, Environment, Box } from "@react-three/drei";
import Tile from "./tile";
import Cameras from "./cameras";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import {
  alphabetFromName,
  englishLetterToML,
  machineLetterToRune,
  scoreFor,
  StandardEnglishAlphabet,
  UndefinedAlphabet,
} from "../../constants/alphabets";
import { GameBoard as ipcGameBoard } from "../../gen/api/proto/ipc/omgwords_pb";

type BoardSceneProps = {
  is2D: boolean;
  board?: ipcGameBoard;
  onTurnRack?: Uint8Array;
  letterDistribution?: string;
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
  is2D: boolean;
};
const fontURL =
  "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json";

// Column labels component
const ColumnLabels = () => {
  const columns = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
  ];
  const font = useLoader(FontLoader, fontURL);

  return (
    <group>
      {columns.map((letter, index) => (
        <mesh
          key={letter}
          position={[
            index * squareSize - offset - squareSize / 4,
            offset + squareSize * 0.8,
            boardThickness / 2 + 0.01,
          ]}
        >
          <textGeometry
            args={[
              letter,
              {
                font: font,
                size: 1.875,
                depth: 0.05,
                curveSegments: 8,
                bevelEnabled: false,
              },
            ]}
          />
          <meshBasicMaterial attach="material" color={0x666666} />
        </mesh>
      ))}
    </group>
  );
};

// Row labels component
const RowLabels = () => {
  const rows = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
  ];
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
              boardThickness / 2 + 0.01,
            ]}
          >
            <textGeometry
              args={[
                number,
                {
                  font: font,
                  size: 1.875,
                  depth: 0.05,
                  curveSegments: 8,
                  bevelEnabled: false,
                },
              ]}
            />
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
    <Extrude args={[arrowShape, extrudeSettings]} castShadow>
      <meshStandardMaterial
        color={0x00ffbd}
        roughness={0.3}
        metalness={0.4}
        envMapIntensity={1.2}
      />
    </Extrude>
  );
}
const RackTile = (props: RackTileProps) => {
  let xpos, ypos, zpos, rotation;

  if (props.is2D) {
    // In 2D mode, lay tiles flat below the board
    xpos =
      -rackWidth / 2 +
      2 * props.gridSquareSize +
      props.pos * (props.gridSquareSize - 0.6);
    ypos = rackYPos - 7; // Move down further to avoid overlapping bottom row
    zpos = boardThickness / 2 + 0.1; // Just above the board surface
    rotation = [0, 0, 0]; // Flat, no rotation
  } else {
    // In 3D mode, tiles on angled rack
    xpos =
      -rackWidth / 2 +
      2 * props.gridSquareSize +
      props.pos * (props.gridSquareSize - 0.6);
    ypos = rackYPos - props.gridSquareSize - 0.9;
    zpos = 1.8;
    rotation = [-Math.atan(props.rackSlope), 0, 0];
  }

  return (
    <group
      position={[xpos, ypos, zpos]}
      rotation={rotation as [number, number, number]}
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
  const tiles = props.board?.tiles;
  const alphabet = useMemo(
    () => alphabetFromName(props.letterDistribution),
    [props.letterDistribution]
  );

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

  const fen =
    "I6BANISTER/N4ZOO3A3/OUGIYA5L3/S2TOPEE2AI3/I9UN3/t9KI3/O7F2T3/L6MERCY3/8R6/8R2V3/2OOF3I1WAG2/3DEPURATES3/8G6/8EX5/9UNCIAE";
  const rack = "BDEINOQ";
  const boardArray = useMemo(() => parseFEN(fen), [fen]);

  const rackTiles = useMemo(() => {
    // Use the game's alphabet, or fall back to StandardEnglishAlphabet for demo tiles
    const effectiveAlphabet =
      alphabet === UndefinedAlphabet ? StandardEnglishAlphabet : alphabet;

    return rack
      .split("")
      .map((letter, idx) => (
        <RackTile
          key={`rack-${idx}`}
          pos={idx}
          gridSquareSize={squareSize}
          letter={letter}
          score={scoreFor(effectiveAlphabet, englishLetterToML(letter))}
          rackSlope={rackSlope}
          is2D={props.is2D}
        />
      ));
  }, [rack, props.is2D, alphabet]);

  const renderedTiles = useMemo(() => {
    if (tiles == undefined) {
      return <></>;
    }
    console.log("tiles", tiles, tiles.length);
    const rendered = [];
    for (let idx = 0; idx < tiles.length; idx++) {
      if (tiles[idx] === 0) {
        continue;
      }
      if (alphabet === UndefinedAlphabet) {
        return <></>;
      }
      const letter = machineLetterToRune(tiles[idx], alphabet);
      rendered.push(
        <BoardTile
          gridPosX={idx % gridSize}
          gridPosY={Math.floor(idx / gridSize)}
          gridSquareSize={squareSize}
          letter={letter}
          score={scoreFor(alphabet, tiles[idx])}
          offset={offset}
          key={`t${idx}`}
        />
      );
    }
    return <>{rendered}</>;
  }, [tiles]);

  const renderedRackTiles = useMemo(() => {
    if (!props.onTurnRack || props.onTurnRack.length === 0) {
      return <></>;
    }
    const rendered = [];
    for (let idx = 0; idx < props.onTurnRack.length; idx++) {
      if (props.onTurnRack[idx] === 0) {
        continue;
      }
      if (alphabet === UndefinedAlphabet) {
        return <></>;
      }
      const letter = machineLetterToRune(props.onTurnRack[idx], alphabet);
      rendered.push(
        <RackTile
          pos={idx}
          gridSquareSize={squareSize}
          letter={letter}
          score={scoreFor(alphabet, props.onTurnRack[idx])}
          rackSlope={rackSlope}
          is2D={props.is2D}
          key={`rt${idx}`}
        />
      );
    }
    return <>{rendered}</>;
  }, [props.onTurnRack, props.is2D]);

  return (
    <Canvas
      style={{ width: "100%", height: "90vh" }}
      id="boardEl"
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
    >
      <Cameras is2D={props.is2D} />

      {/* Environment map for realistic reflections with forest background */}
      <Environment
        preset="park"
        background={true}
        backgroundBlurriness={0.5}
        backgroundIntensity={0.5}
      />

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <directionalLight position={[-30, 50, -30]} intensity={0.5} />
      <pointLight position={[0, 20, 30]} intensity={0.5} color="#fff8e7" />

      {/* Table */}
      <group>
        {/* Table top */}
        <Box
          args={[160, 140, 4]}
          position={[0, 0, -boardThickness / 2 - 2]}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.6}
            metalness={0.1}
            envMapIntensity={0.7}
          />
        </Box>

        {/* Table legs */}
        {/* Front left leg */}
        <Box
          args={[4, 4, 40]}
          position={[-70, -60, -boardThickness / 2 - 22]}
          castShadow
        >
          <meshStandardMaterial
            color="#654321"
            roughness={0.5}
            metalness={0.1}
          />
        </Box>

        {/* Front right leg */}
        <Box
          args={[4, 4, 40]}
          position={[70, -60, -boardThickness / 2 - 22]}
          castShadow
        >
          <meshStandardMaterial
            color="#654321"
            roughness={0.5}
            metalness={0.1}
          />
        </Box>

        {/* Back left leg */}
        <Box
          args={[4, 4, 40]}
          position={[-70, 60, -boardThickness / 2 - 22]}
          castShadow
        >
          <meshStandardMaterial
            color="#654321"
            roughness={0.5}
            metalness={0.1}
          />
        </Box>

        {/* Back right leg */}
        <Box
          args={[4, 4, 40]}
          position={[70, 60, -boardThickness / 2 - 22]}
          castShadow
        >
          <meshStandardMaterial
            color="#654321"
            roughness={0.5}
            metalness={0.1}
          />
        </Box>
      </group>

      {/* Chess Clock */}
      <group
        position={[65, 0, -boardThickness / 2 + 1]}
        rotation={[0, 0, Math.PI / 2]}
      >
        {/* Clock base */}
        <Box args={[15, 10, 2]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            color="#2C2C2C"
            roughness={0.4}
            metalness={0.3}
          />
        </Box>

        {/* Left button */}
        <Box args={[6, 4, 1]} position={[-4, 0, 1.5]} castShadow>
          <meshStandardMaterial
            color="#1A1A1A"
            roughness={0.3}
            metalness={0.2}
          />
        </Box>

        {/* Right button */}
        <Box args={[6, 4, 1]} position={[4, 0, 1.5]} castShadow>
          <meshStandardMaterial
            color="#1A1A1A"
            roughness={0.3}
            metalness={0.2}
          />
        </Box>

        {/* Display screen in middle */}
        <Box args={[2, 8, 0.5]} position={[0, 0, 1.8]} castShadow>
          <meshStandardMaterial
            color="#00FF00"
            emissive="#00AA00"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Box>
      </group>

      <GameBoard
        layout={CrosswordGameGridLayout} /* get from elsewhere */
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

      {!props.is2D && (
        <Rack
          rackWidth={rackWidth}
          rackHeight={rackHeight}
          rackDepth={rackDepth}
          x={rackWidth / 2}
          y={rackYPos}
          z={boardThickness / 2}
        />
      )}

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

      {/* Show rack tiles from game data if available, otherwise show example rack */}
      {props.onTurnRack && props.onTurnRack.length > 0
        ? renderedRackTiles
        : rackTiles}

      <OrbitControls enableDamping={false} target={[0, -10, 0]} />
    </Canvas>
  );
};

export default BoardScene;

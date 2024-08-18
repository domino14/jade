import * as THREE from "three";
import { BonusType } from "../../constants/board_layout";
import { Box, Cylinder } from "@react-three/drei";
import React from "react";

const boardColor = 0x00ffbd;

const bonusColors = {
  [BonusType.TripleWord]: 0xff3333,
  [BonusType.DoubleWord]: 0xff9999,
  [BonusType.TripleLetter]: 0x3333ff,
  [BonusType.DoubleLetter]: 0x4eb7e1,
  [BonusType.QuadrupleWord]: 0x22ff22,
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

type GameBoardProps = {
  layout: string[];
  boardThickness: number;
  gridSize: number;
  squareSize: number;
  gridHeight: number;
  offset: number;
  squareClickHandler: (i: number, j: number) => void;
  arrow: ArrowProperties;
};

const GameBoard = (props: GameBoardProps) => {
  const createWalls = (
    i: number,
    j: number,
    gridBottomZPos: number,
    gridHeight: number,
    offset: number,
    squareSize: number,
    wallThickness: number,
    wallHeight: number
  ) => {
    const wallMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
    });

    return (
      <>
        {/* Top Wall */}
        <Box
          args={[squareSize, wallThickness, wallHeight]}
          position={[
            i * squareSize - offset,
            j * squareSize - offset + squareSize / 2,
            gridBottomZPos + gridHeight,
          ]}
        >
          <meshBasicMaterial attach="material" {...wallMaterial} />
        </Box>

        {/* Bottom Wall */}
        <Box
          args={[squareSize, wallThickness, wallHeight]}
          position={[
            i * squareSize - offset,
            j * squareSize - offset - squareSize / 2,
            gridBottomZPos + gridHeight,
          ]}
        >
          <meshBasicMaterial attach="material" {...wallMaterial} />
        </Box>

        {/* Left Wall */}
        <Box
          args={[wallThickness, squareSize, wallHeight]}
          position={[
            i * squareSize - offset - squareSize / 2,
            j * squareSize - offset,
            gridBottomZPos + gridHeight,
          ]}
        >
          <meshBasicMaterial attach="material" {...wallMaterial} />
        </Box>

        {/* Right Wall */}
        <Box
          args={[wallThickness, squareSize, wallHeight]}
          position={[
            i * squareSize - offset + squareSize / 2,
            j * squareSize - offset,
            gridBottomZPos + gridHeight,
          ]}
        >
          <meshBasicMaterial attach="material" {...wallMaterial} />
        </Box>
      </>
    );
  };

  return (
    <group>
      {/* Create the circular board */}
      <Cylinder
        args={[55, 55, props.boardThickness, 64]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshPhongMaterial
          attach="material"
          color={boardColor}
          specular={0xffffff}
          shininess={50}
        />
      </Cylinder>

      {Array.from({ length: props.gridSize }).map((_, i) =>
        Array.from({ length: props.gridSize }).map((_, j) => {
          const bonusSquare = props.layout[i][j] as BonusType;
          const squareColor =
            bonusSquare !== BonusType.NoBonus
              ? bonusColors[bonusSquare]
              : 0xffffff;
          const gridBottomZPos = props.boardThickness / 2;

          return (
            <React.Fragment key={`${i}-${j}`}>
              {/* Create the board square */}
              <Box
                args={[props.squareSize, props.squareSize, props.gridHeight]}
                position={[
                  i * props.squareSize - props.offset,
                  j * props.squareSize - props.offset,
                  gridBottomZPos + props.gridHeight / 2,
                ]}
                userData={{ isBoardSquare: true, gridX: i, gridY: j }}
                onClick={() => props.squareClickHandler(i, j)}
              >
                <meshPhongMaterial
                  attach="material"
                  color={squareColor}
                  specular={squareColor}
                  shininess={50}
                />
              </Box>

              {/* Create walls around each square */}
              {createWalls(
                i,
                j,
                gridBottomZPos,
                props.gridHeight,
                props.offset,
                props.squareSize,
                0.25,
                0.55
              )}
            </React.Fragment>
          );
        })
      )}
    </group>
  );
};

export default GameBoard;

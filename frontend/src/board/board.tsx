import React, { useState } from "react";
import {
  Container,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import "./board.css";

interface BoardProps {
  rows: number;
  cols: number;
}

const Board: React.FC<BoardProps> = ({ rows, cols }) => {
  const gridSize = 100 / Math.max(rows, cols);
  const cells = Array.from({ length: rows * cols });

  // Define bonus squares (example positions for a 15x15 board)
  const bonusSquares = new Set([
    "0-0",
    "0-7",
    "0-14",
    "7-0",
    "7-14",
    "14-0",
    "14-7",
    "14-14", // Triple word
    "1-1",
    "2-2",
    "3-3",
    "4-4",
    "10-10",
    "11-11",
    "12-12",
    "13-13", // Double word
    // Add more positions for other bonus squares
  ]);
  const computedColorScheme = useComputedColorScheme("light");
  const theme = useMantineTheme();
  let bgSquare = theme.colors.gray[1];
  if (computedColorScheme === "dark") {
    bgSquare = theme.colors.dark[3];
  }

  return (
    <div className="board-container">
      <svg
        className="board"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {cells.map((_, index) => {
          const x = (index % cols) * gridSize;
          const y = Math.floor(index / cols) * gridSize;
          const pos = `${Math.floor(index / cols)}-${index % cols}`;
          const fillColor = bonusSquares.has(pos) ? "lightblue" : bgSquare; // Example bonus color

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={gridSize}
              height={gridSize}
              stroke="black"
              strokeWidth="0.05"
              fill={fillColor}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default Board;

import React from "react";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Canvas, extend, Object3DNode, useLoader } from "@react-three/fiber";
import { Extrude } from "@react-three/drei";
import * as THREE from "three";

extend({ TextGeometry });

declare module "@react-three/fiber" {
  interface ThreeElements {
    textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
  }
}

interface TileProps {
  fontUrl: string;
  gridSquareSize: number;
  tileDepth: number;
  letter: string;
  score: number;
}

const Tile: React.FC<TileProps> = ({
  fontUrl,
  gridSquareSize,
  tileDepth,
  letter,
  score,
}) => {
  const font = useLoader(FontLoader, fontUrl);

  const shape = new THREE.Shape();
  const x0 = 0,
    y0 = 0,
    width = gridSquareSize - 0.75,
    height = gridSquareSize - 0.25,
    radius = 0.5;
  shape.moveTo(x0 + radius, y0);
  shape.lineTo(x0 + width - radius, y0);
  shape.quadraticCurveTo(x0 + width, y0, x0 + width, y0 + radius);
  shape.lineTo(x0 + width, y0 + height - radius);
  shape.quadraticCurveTo(
    x0 + width,
    y0 + height,
    x0 + width - radius,
    y0 + height
  );
  shape.lineTo(x0 + radius, y0 + height);
  shape.quadraticCurveTo(x0, y0 + height, x0, y0 + height - radius);
  shape.lineTo(x0, y0 + radius);
  shape.quadraticCurveTo(x0, y0, x0 + radius, y0);

  const extrudeSettings = {
    steps: 1,
    depth: tileDepth,
    bevelEnabled: false,
  };

  return (
    <group>
      <Extrude args={[shape, extrudeSettings]} position={[0, 0, 0]}>
        <meshPhongMaterial
          attach="material"
          color={0x0000ff}
          specular={0x00bdff}
          shininess={15}
        />
      </Extrude>
      <mesh
        position={[
          (letter === "I" ? 0.4 : letter === "W" ? 0.1 : 0.15) * width,
          0.2 * height,
          tileDepth,
        ]}
      >
        <textGeometry args={[letter, { font: font, size: 2.6, height: 0.1 }]} />
        <meshBasicMaterial attach="material" color={0xdddddd} />
      </mesh>
      <mesh
        position={[
          (score >= 10 ? 0.62 : 0.75) * width,
          0.1 * height,
          tileDepth,
        ]}
      >
        <textGeometry
          args={[score.toString(), { font: font, size: 1, height: 0.1 }]}
        />
        <meshBasicMaterial attach="material" color={0xdddddd} />
      </mesh>
    </group>
  );
};

export default Tile;

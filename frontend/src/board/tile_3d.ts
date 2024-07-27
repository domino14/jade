import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

export const createTile = (
  font: Font,
  gridSquareSize: number,
  tileDepth: number,
  letter: string,
  score: number
) => {
  const tileGroup = new THREE.Group();

  // Create rounded rectangle shape
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

  const tileGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const tileMaterial = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    specular: 0x00bdff,
    shininess: 15,
  });
  const tile = new THREE.Mesh(tileGeometry, tileMaterial);
  tileGroup.add(tile);

  const textGeometry = new TextGeometry(letter, {
    font: font,
    size: 2.6,
    height: 0.1,
  });
  const textMaterial = new THREE.MeshBasicMaterial({
    color: 0xdddddd,
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  // Set the position of the textMesh relative to the tile
  textMesh.position.set(
    (letter === "I" ? 0.4 : letter === "W" ? 0.1 : 0.15) * width,
    0.2 * height,
    tileDepth
  );
  tileGroup.add(textMesh);

  const scoreGeometry = new TextGeometry(score.toString(), {
    font: font,
    size: 1,
    height: 0.1,
  });
  const scoreMaterial = new THREE.MeshBasicMaterial({
    color: 0xdddddd,
  });
  const scoreMesh = new THREE.Mesh(scoreGeometry, scoreMaterial);
  // Set the position of the scoreMesh relative to the tile
  scoreMesh.position.set(
    (score >= 10 ? 0.62 : 0.75) * width,
    0.1 * height,
    tileDepth
  );
  tileGroup.add(scoreMesh);

  return tileGroup;
};

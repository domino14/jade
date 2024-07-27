import * as THREE from "three";

export const createRack = (
  rackWidth: number,
  rackHeight: number,
  rackDepth: number,
  x: number,
  y: number,
  z: number
) => {
  const sceneShapes = [];

  const shape = new THREE.Shape();

  const height1 = rackHeight * 0.4;
  const height2 = rackHeight * 0.3;
  const fullHeight = rackHeight;

  const width1 = 0.16 * rackWidth;
  const width2 = 0.4 * rackWidth;
  const width3 = 0.8 * rackWidth;
  const fullWidth = rackWidth;
  const radius1 = 0.015 * rackWidth;
  const radius2 = 0.16 * rackWidth;

  shape.moveTo(radius1, 0); // Start with a rounded corner
  shape.lineTo(fullWidth - radius1, 0);
  shape.quadraticCurveTo(fullWidth, 0, fullWidth, radius1); // Bottom right corner
  shape.lineTo(fullWidth, height2);

  // Define control points for the large arc
  const controlPointX = (fullWidth + width3) / 2;
  const controlPointY = height2 + radius2;

  // Draw the large arc using bezierCurveTo
  shape.bezierCurveTo(
    controlPointX,
    controlPointY,
    controlPointX,
    height2,
    width3,
    height2
  );

  shape.lineTo(width2 + radius1, fullHeight - radius1);
  // The slope of the rack. Needed for placing the tile on it.
  const slope = (fullHeight - radius1 - height2) / (width2 + radius1 - width3);

  shape.quadraticCurveTo(width2, fullHeight, width2 - radius1, fullHeight);
  shape.lineTo(width1 + radius1, fullHeight);
  shape.quadraticCurveTo(
    width1,
    fullHeight,
    width1 - radius1,
    fullHeight - radius1
  );
  shape.lineTo(0, height1);
  shape.lineTo(0, radius1);
  shape.quadraticCurveTo(0, 0, radius1, 0);

  const extrudeSettings = {
    steps: 1,
    depth: rackDepth,
    bevelEnabled: false,
  };

  const rackGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const rackMaterial = new THREE.MeshPhongMaterial({
    color: 0xffd700, // Brown color for the rack
    specular: 0xffd700,
    shininess: 1200,
  });
  const rack = new THREE.Mesh(rackGeometry, rackMaterial);
  rack.position.set(x, y, z);
  rack.rotation.x = Math.PI / 2;
  rack.rotation.y = (3 * Math.PI) / 2;
  // rack.rotation.z = Math.PI;
  sceneShapes.push(rack);

  return {
    sceneShapes,
    slope,
    controlPointX,
    controlPointY,
  };
};

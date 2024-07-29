import { Extrude } from "@react-three/drei";
import * as THREE from "three";

type RackProps = {
  rackWidth: number;
  rackHeight: number;
  rackDepth: number;
  x: number;
  y: number;
  z: number;
};

export const rackGeomParams = (rackHeight: number, rackDepth: number) => {
  const height1 = rackHeight * 0.4;
  const height2 = rackHeight * 0.3;

  const depth1 = 0.16 * rackDepth;
  const depth2 = 0.4 * rackDepth;
  const depth3 = 0.8 * rackDepth;
  const radius1 = 0.015 * rackDepth;
  const radius2 = 0.16 * rackDepth;
  const slope = (rackHeight - radius1 - height2) / (depth2 + radius1 - depth3);
  return {
    height1,
    height2,
    depth1,
    depth2,
    depth3,
    radius1,
    radius2,
    slope,
  };
};

const Rack = (props: RackProps) => {
  const { rackWidth, rackHeight, rackDepth, x, y, z } = props;
  const shape = new THREE.Shape();

  const { height1, height2, depth1, depth2, depth3, radius1, radius2 } =
    rackGeomParams(props.rackHeight, props.rackDepth);

  shape.moveTo(radius1, 0); // Start with a rounded corner
  shape.lineTo(rackDepth - radius1, 0);
  shape.quadraticCurveTo(rackDepth, 0, rackDepth, radius1); // Bottom right corner
  shape.lineTo(rackDepth, height2);

  // Define control points for the large arc
  const controlPointX = (rackDepth + depth3) / 2;
  const controlPointY = height2 + radius2;

  // Draw the large arc using bezierCurveTo
  shape.bezierCurveTo(
    controlPointX,
    controlPointY,
    controlPointX,
    height2,
    depth3,
    height2
  );

  shape.lineTo(depth2 + radius1, rackHeight - radius1);

  shape.quadraticCurveTo(depth2, rackHeight, depth2 - radius1, rackHeight);
  shape.lineTo(depth1 + radius1, rackHeight);
  shape.quadraticCurveTo(
    depth1,
    rackHeight,
    depth1 - radius1,
    rackHeight - radius1
  );
  shape.lineTo(0, height1);
  shape.lineTo(0, radius1);
  shape.quadraticCurveTo(0, 0, radius1, 0);

  const extrudeSettings = {
    steps: 1,
    depth: rackWidth,
    bevelEnabled: false,
  };

  return (
    <Extrude
      args={[shape, extrudeSettings]}
      position={[x, y, z]}
      rotation={[Math.PI / 2, (3 * Math.PI) / 2, 0]}
    >
      <meshPhongMaterial
        attach="material"
        color={0xffd700}
        specular={0xffd700}
        shininess={1200}
      />
    </Extrude>
  );
};

export default Rack;

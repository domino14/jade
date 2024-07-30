import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { OrthographicCamera as Ortho } from "three";

interface CamerasProps {
  is2D: boolean;
}

const Cameras: React.FC<CamerasProps> = ({ is2D }) => {
  const viewport = useThree((state) => state.viewport);
  const aspect = viewport.aspect;

  const camera = useThree((state) => state.camera);
  useFrame(() => {
    if (is2D) {
      (camera as Ortho).left = aspect >= 1 ? -45 * aspect : -45;
      (camera as Ortho).right = aspect >= 1 ? 45 * aspect : 45;
      (camera as Ortho).top = aspect >= 1 ? 55 : 55 / aspect;
      (camera as Ortho).bottom = aspect >= 1 ? -35 : -35 / aspect;
    }
  });

  return (
    <>
      <PerspectiveCamera position={[0, -60, 90]} fov={50} makeDefault={!is2D} />
      <OrthographicCamera
        position={[0, -60, 90]}
        zoom={1}
        left={-45}
        right={45}
        top={55}
        bottom={-35}
        makeDefault={is2D}
      />
    </>
  );
};

export default Cameras;

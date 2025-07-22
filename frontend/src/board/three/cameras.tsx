import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { OrthographicCamera as Ortho } from "three";

interface CamerasProps {
  is2D: boolean;
}

const Cameras: React.FC<CamerasProps> = ({ is2D }) => {
  const { viewport, camera, size, invalidate } = useThree();
  const aspect = size.width / size.height;
  const [initialized, setInitialized] = useState(false);

  // Calculate orthographic camera bounds based on aspect ratio
  const orthoBounds = useMemo(() => {
    // Original values were: left: -45, right: 45, top: 55, bottom: -35
    // This gives us a base width of 90 and height of 90, but shifted up by 10 units
    const baseWidth = 90; // Total width: 45 * 2 = 90
    const baseTop = 55;   // Original top value
    const baseBottom = -35; // Original bottom value
    
    if (aspect >= 1) {
      // Landscape - adjust width proportionally
      return {
        left: -45 * aspect,
        right: 45 * aspect,
        top: baseTop,
        bottom: baseBottom,
      };
    } else {
      // Portrait - adjust height proportionally
      const heightScale = 1 / aspect;
      return {
        left: -45,
        right: 45,
        top: baseTop * heightScale,
        bottom: baseBottom * heightScale,
      };
    }
  }, [aspect]);

  // Update camera on size or mode changes
  useEffect(() => {
    if (is2D && camera instanceof Ortho) {
      camera.left = orthoBounds.left;
      camera.right = orthoBounds.right;
      camera.top = orthoBounds.top;
      camera.bottom = orthoBounds.bottom;
      camera.updateProjectionMatrix();
      invalidate(); // Force re-render
    }
  }, [is2D, orthoBounds, camera, invalidate]);

  // Force initial camera update after mount
  useEffect(() => {
    if (!initialized) {
      const timer = setTimeout(() => {
        setInitialized(true);
        invalidate(); // Force initial render
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialized, invalidate]);

  return (
    <>
      <PerspectiveCamera position={[0, -60, 90]} fov={50} makeDefault={!is2D} />
      <OrthographicCamera
        position={[0, -60, 90]}
        zoom={1}
        left={orthoBounds.left}
        right={orthoBounds.right}
        top={orthoBounds.top}
        bottom={orthoBounds.bottom}
        makeDefault={is2D}
      />
    </>
  );
};

export default Cameras;

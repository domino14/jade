import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import addGameBoard from "./board_3d";
import { createTile } from "./tile_3d";
import { CrosswordGameGridLayout } from "./board_layout";
import { createRack } from "./rack_3d";

const BoardScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Create the grid
  const gridSize = 15;
  const squareSize = 5;
  const boardThickness = 2;
  const wallThickness = 0.25;
  const wallHeight = 0.55;
  const gridHeight = 1;
  const tileDepth = 1;
  const offset = (gridSize * squareSize) / 2 - squareSize / 2;
  const gridBottomZPos = boardThickness / 2;

  useEffect(() => {
    if (!mountRef.current) return;

    console.log("setting up the scene");
    const boardThickness = 2;
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9f9f9f); // Sets the background color to gray

    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.25;
    // controls.screenSpacePanning = true;
    // controls.minDistance = 0;
    // controls.maxDistance = 200;
    // controls.maxPolarAngle = Math.PI;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 200);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(0, 200, 200);
    scene.add(directionalLight2);

    // and a light for the rack

    // const ptLight = new THREE.PointLight(0xffffff, 150);
    // ptLight.position.set(0, -60, 5);
    // scene.add(ptLight);

    addGameBoard(
      scene,
      CrosswordGameGridLayout,
      boardThickness,
      gridSize,
      squareSize,
      wallThickness,
      wallHeight,
      gridHeight,
      offset
    );

    const rackWidth = 40;
    const rackYPos = -38;

    const {
      sceneShapes: rack,
      slope: rackSlope,
      controlPointX: tbx,
      controlPointY: tby,
    } = createRack(
      7,
      3,
      rackWidth,
      rackWidth / 2,
      rackYPos,
      boardThickness / 2
    );
    scene.add(...rack);

    const positionTileOnBoard = (tile: THREE.Group, x: number, y: number) => {
      tile.position.set(
        x * squareSize - offset - squareSize / 2 + 0.375,
        y * squareSize - offset - squareSize / 2 + 0.125,
        boardThickness / 2 + gridHeight
      );
    };

    const positionTileOnRack = (tile: THREE.Group, pos: number) => {
      const xpos = -rackWidth / 2 + squareSize + pos * (squareSize - 0.6);
      const ypos = rackYPos - squareSize - 0.9;
      const zpos = -0.15;
      tile.position.set(xpos, ypos, boardThickness / 2 + gridHeight + zpos);
      tile.rotation.x = -Math.atan(rackSlope);
    };

    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        // Example: create a few tiles
        const tile1 = createTile(font, squareSize, tileDepth, "A", 1);
        positionTileOnBoard(tile1, 1, 1);
        scene.add(tile1);

        const tile2 = createTile(font, squareSize, tileDepth, "Z", 10);
        positionTileOnBoard(tile2, 11, 14);
        scene.add(tile2);

        const tile3 = createTile(font, squareSize, tileDepth, "M", 3);
        positionTileOnBoard(tile3, 10, 14);
        scene.add(tile3);

        const tile4 = createTile(font, squareSize, tileDepth, "W", 4);
        positionTileOnBoard(tile4, 9, 14);
        scene.add(tile4);

        const tile5 = createTile(font, squareSize, tileDepth, "I", 1);
        positionTileOnBoard(tile5, 7, 7);
        scene.add(tile5);

        const letters = [
          ["A", 1],
          ["E", 1],
          ["G", 2],
          ["K", 5],
          ["M", 3],
          ["R", 1],
          ["Y", 4],
        ];

        for (let i = 0; i < letters.length; i++) {
          const tile = createTile(
            font,
            squareSize,
            tileDepth,
            letters[i][0] as string,
            letters[i][1] as number
          );
          positionTileOnRack(tile, i);
          scene.add(tile);
        }
      }
    );

    const handleResize = () => {
      if (mountRef.current) {
        const { clientWidth, clientHeight } = mountRef.current;
        renderer.setSize(clientWidth, clientHeight);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    camera.position.set(0, -60, 90);
    camera.lookAt(0, -10, 0);

    // Animation loop
    const animate = function () {
      requestAnimationFrame(animate);
      // controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Clean up on component unmount
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "90vh" }} />;
};

export default BoardScene;

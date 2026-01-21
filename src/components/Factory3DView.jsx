import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import CNCModel from "./3d/CNCModel";

export default function Factory3DView() {
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <Canvas camera={{ position: [6, 5, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <CNCModel />

        <OrbitControls enablePan enableZoom enableRotate />
        <Environment preset="warehouse" />
      </Canvas>
    </div>
  );
}

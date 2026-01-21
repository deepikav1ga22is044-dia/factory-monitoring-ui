import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";

export default function CncMachine3D(props) {
  const { scene } = useGLTF("/models/cnc/CNC.glb");

  // ✅ CLONE the model so each machine is unique
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={clonedScene}
      scale={0.35}
      position={[0, 0.6, 0]}   // ⬅ lift ABOVE floor
      rotation={[0, Math.PI, 0]}
      frustumCulled={false}
      {...props}
    />
  );
}

useGLTF.preload("/models/cnc/CNC.glb");

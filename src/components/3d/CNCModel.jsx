import { useGLTF } from "@react-three/drei";

export default function CNCModel(props) {
  const { scene } = useGLTF("/models/cnc/source/cnc.glb");

  return (
    <primitive
      object={scene}
      scale={0.8}
      position={[0, 0, 0]}
      {...props}
    />
  );
}

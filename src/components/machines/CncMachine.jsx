import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const STATUS_COLOR = {
  running: "#2ecc71",
  idle: "#f1c40f",
  off: "#7f8c8d",
  fault: "#e74c3c",
};

function CncMachine({ status, position = [0, 0, 0], onClick }) {
  const { scene } = useGLTF("/CNC.glb");

  // ✅ Change ACTUAL MACHINE COLOR
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color = new THREE.Color(STATUS_COLOR[status]);
      }
    });
  }, [status, scene]);

  // 🔴 Blink / pulse on fault
  useFrame(({ clock }) => {
    if (status === "fault") {
      const pulse = Math.abs(Math.sin(clock.elapsedTime * 3));
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material.emissive = new THREE.Color("red");
          child.material.emissiveIntensity = pulse;
        }
      });
    }
  });

  return (
    <primitive
      object={scene}
      position={position}
      scale={0.8}
      onClick={onClick}
    />
  );
}

export default CncMachine;

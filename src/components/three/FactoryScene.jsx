import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Html, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import CncMachine3D from "./CncMachine3D";

/* ===============================
   STATUS COLORS
================================ */
const STATUS_COLOR = {
  running: "#5FB878",
  idle: "#E6C229",
  off: "#9AA0A6",
  fault: "#D9534F",
};

/* ===============================
   SINGLE MACHINE (REAL DATA)
================================ */
function Machine3D({
  machineId,
  machineData,
  position,
  zoneName,
  onMachineHover,
}) {
  const baseRef = useRef();
  const status = machineData?.status || "off";

  /* FAULT BLINK */
  useFrame(({ clock }) => {
    if (status === "fault" && baseRef.current) {
      const blink = Math.sin(clock.elapsedTime * 3) * 0.5 + 0.5;
      baseRef.current.material.opacity = 0.4 + blink * 0.6;
    }
  });

  return (
    <group
      position={position}
      onPointerOver={() =>
        onMachineHover({
          ...machineData,
          zone: zoneName,
        })
      }
      onPointerOut={() => onMachineHover(null)}
    >
      {/* STATUS BASE */}
      <mesh ref={baseRef} position={[0, 0.05, 0]}>
        <boxGeometry args={[2.6, 0.12, 2.6]} />
        <meshStandardMaterial
          color={STATUS_COLOR[status]}
          transparent
          opacity={1}
        />
      </mesh>

      {/* MACHINE MODEL */}
      <CncMachine3D scale={0.42} />

      {/* MACHINE SHORT ID */}
      <Text position={[0, 2.1, 0]} fontSize={0.26} color="#111">
        {machineId}
      </Text>
    </group>
  );
}

/* ===============================
   ZONE
================================ */
function Zone3D({
  zone,
  position,
  machineLookup,
  zoneIndex,
  onMachineHover,
}) {
  const MACHINE_SIZE = 2.6;
  const GAP = 1.2;
  const MAX_COLS = 3;

  const machines = zone.machines;
  const cols = Math.min(MAX_COLS, machines.length);
  const rows = Math.ceil(machines.length / cols);

  const zoneWidth = cols * (MACHINE_SIZE + GAP) + GAP;
  const zoneDepth = rows * (MACHINE_SIZE + GAP) + GAP;

  const zoneColors = ["#cfcfcf", "#d6d6d6", "#cccccc"];

  return (
    <group position={position}>
      {/* ZONE FLOOR */}
      <mesh>
        <boxGeometry args={[zoneWidth, 0.15, zoneDepth]} />
        <meshStandardMaterial
          color={zoneColors[zoneIndex % 3]}
          emissive="#6aa9ff"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* ZONE NAME */}
      <Text
        position={[0, 0.3, -zoneDepth / 2 - 0.4]}
        fontSize={0.4}
        color="#222"
        anchorX="center"
      >
        {zone.name}
      </Text>

      {/* MACHINES */}
      {machines.map((shortId, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const machineData = machineLookup[shortId];

        const x =
          -zoneWidth / 2 +
          GAP +
          col * (MACHINE_SIZE + GAP) +
          MACHINE_SIZE / 2;

        const z =
          -zoneDepth / 2 +
          GAP +
          row * (MACHINE_SIZE + GAP) +
          MACHINE_SIZE / 2;

        return (
          <Machine3D
            key={shortId}
            machineId={shortId}
            machineData={machineData}
            zoneName={zone.name}
            position={[x, 0.15, z]}
            onMachineHover={onMachineHover}
          />
        );
      })}
    </group>
  );
}

/* ===============================
   FACTORY SCENE
================================ */
export default function FactoryScene({
  department,
  machineLookup = {},
  selectedMachine,
  onMachineHover,
  onCloseMachine,
}) {
  if (!department) return null;

  const ZONE_GAP = 6;

  const layout = useMemo(() => {
    const zoneLayouts = department.zones.map((zone) => {
      const cols = Math.min(3, zone.machines.length);
      const rows = Math.ceil(zone.machines.length / cols);
      const width = cols * 3.8 + 1.2;
      const depth = rows * 3.8 + 1.2;
      return { zone, width, depth };
    });

    const totalWidth =
      zoneLayouts.reduce((sum, z) => sum + z.width, 0) +
      ZONE_GAP * (zoneLayouts.length - 1);

    let cursorX = -totalWidth / 2;

    return zoneLayouts.map((z) => {
      const pos = [cursorX + z.width / 2, 0, 0];
      cursorX += z.width + ZONE_GAP;
      return { ...z, pos };
    });
  }, [department]);

  const deptWidth =
    layout.reduce((sum, z) => sum + z.width, 0) +
    ZONE_GAP * (layout.length - 1) +
    6;

  const deptDepth = Math.max(...layout.map((z) => z.depth)) + 8;

  return (
    <Canvas
      camera={{ position: [0, 18, 28], fov: 38 }}
      style={{ width: "100%", height: "100%" }}
    >
      <OrbitControls enableRotate={true} enableZoom={false} enablePan={false} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 30, 10]} intensity={1.1} />

      {/* DEPARTMENT FLOOR */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[deptWidth, deptDepth]} />
        <meshStandardMaterial color="#b3b3b3" />
      </mesh>

      {/* DEPARTMENT WALLS */}
      <group>
        <mesh position={[0, 1.5, -deptDepth / 2]}>
          <boxGeometry args={[deptWidth, 3, 0.3]} />
          <meshStandardMaterial color="#9e9e9e" />
        </mesh>
        <mesh position={[-deptWidth / 2, 1.5, 0]}>
          <boxGeometry args={[0.3, 3, deptDepth]} />
          <meshStandardMaterial color="#9e9e9e" />
        </mesh>
        <mesh position={[deptWidth / 2, 1.5, 0]}>
          <boxGeometry args={[0.3, 3, deptDepth]} />
          <meshStandardMaterial color="#9e9e9e" />
        </mesh>
      </group>

      {/* ZONES */}
      <Suspense fallback={null}>
        {layout.map((z, i) => (
          <Zone3D
            key={z.zone.id}
            zone={z.zone}
            position={z.pos}
            zoneIndex={i}
            machineLookup={machineLookup}
            onMachineHover={onMachineHover}
          />
        ))}
      </Suspense>

      {/* HOVER INFO CARD */}
      {selectedMachine && (
        <Html center>
          <div
            style={{
              width: 340,
              background: "rgba(18,18,18,0.95)",
              color: "#fff",
              padding: 14,
              borderRadius: 10,
              boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
              fontSize: 13,
            }}
          >
            <h4 style={{ margin: "0 0 6px", color: "#6aa9ff" }}>
              {selectedMachine.fullId || selectedMachine.shortId}
            </h4>

            <div>Status: <b>{selectedMachine.status}</b></div>
            <div>Zone: {selectedMachine.zone}</div>
            <div>Last Updated: {selectedMachine.lastUpdated}</div>
            <div>Reason: {selectedMachine.reason}</div>

            <hr style={{ margin: "8px 0", opacity: 0.3 }} />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span>A: {selectedMachine.availability ?? "—"}%</span>
              <span>P: {selectedMachine.performance ?? "—"}%</span>
              <span>Q: {selectedMachine.quality ?? "—"}%</span>
              <span>OEE: {selectedMachine.oee ?? "—"}%</span>
            </div>

            <hr style={{ margin: "8px 0", opacity: 0.3 }} />

            <div>
              <div>Speed: {selectedMachine.parameters?.speed}</div>
              <div>Temp: {selectedMachine.parameters?.temperature}</div>
              <div>Load: {selectedMachine.parameters?.load}</div>
            </div>
          </div>
        </Html>
      )}
    </Canvas>
  );
}

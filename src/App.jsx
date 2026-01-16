import { useState, useEffect } from "react";
import "./App.css";

import machineData from "./data/machineDetails.json";
import machineStatus from "./data/machineStatus.json";
import ControlPanel from "./components/ControlPanel";
import ZoneView from "./components/ZoneView";
import MachinePanel from "./components/MachinePanel";

/* =========================================================
   Generate consistent 15+ char Industrial Machine ID
   ========================================================= */
const getDisplayMachineId = (machineId, zoneName) => {
  const num = machineId.replace(/\D/g, "").padStart(4, "0");
  const zone = zoneName.replace(/\s+/g, "").toUpperCase().slice(0, 4);
  return `PLT1-${zone}-MCH-${num}`;
};

function App() {
  /* -------- Selection -------- */
  const [selectedFactory, setSelectedFactory] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  /* -------- Layout & rotation -------- */
  const [zones, setZones] = useState([]);
  const [activeZoneIndex, setActiveZoneIndex] = useState(0);
  const [activeMachineIndex, setActiveMachineIndex] = useState(0);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [editMode, setEditMode] = useState(false);

  /* -------- Resolve hierarchy -------- */
  const factory = machineData.factories.find(f => f.id === selectedFactory);
  const plant = factory?.plants.find(p => p.id === selectedPlant);
  const department =
    plant && selectedDept
      ? plant.departments.find(d => d.id === selectedDept)
      : null;

  /* =========================================================
     DEFAULT LOAD
     ========================================================= */
  useEffect(() => {
    const f = machineData.factories[0];
    const p = f.plants[0];
    const d = p.departments[0];

    setSelectedFactory(f.id);
    setSelectedPlant(p.id);
    setSelectedDept(d.id);
  }, []);

  /* -------- Auto select -------- */
  useEffect(() => {
    if (!factory) return;
    setSelectedPlant(factory.plants[0].id);
    setSelectedDept(factory.plants[0].departments[0].id);
  }, [selectedFactory]);

  useEffect(() => {
    if (!plant) return;
    setSelectedDept(plant.departments[0].id);
  }, [selectedPlant]);

  /* -------- Layout key -------- */
  const layoutKey =
    selectedFactory && selectedPlant && selectedDept
      ? `layout-${selectedFactory}-${selectedPlant}-${selectedDept}`
      : null;

  /* =========================================================
     LOAD ZONES
     ========================================================= */
  useEffect(() => {
    if (!department) return;

    const saved = layoutKey && localStorage.getItem(layoutKey);
    const loadedZones = saved
      ? JSON.parse(saved)
      : [...department.zones];

    setZones(loadedZones);
    setActiveZoneIndex(0);
    setActiveMachineIndex(0);

    const firstZone = loadedZones[0];
    if (firstZone?.machines.length) {
      const m = firstZone.machines[0];
      setSelectedMachine({
        id: getDisplayMachineId(m, firstZone.name),
        rawId: m,
        status: machineStatus[m],
        zone: firstZone.name
      });
    }
  }, [department, layoutKey]);

  /* =========================================================
     ZONE CHANGE → RESET MACHINE
     ========================================================= */
  useEffect(() => {
    if (!zones.length) return;

    const zone = zones[activeZoneIndex];
    if (!zone) return;

    setActiveMachineIndex(0);

    const m = zone.machines[0];
    setSelectedMachine({
      id: getDisplayMachineId(m, zone.name),
      rawId: m,
      status: machineStatus[m],
      zone: zone.name
    });
  }, [activeZoneIndex, zones]);

  /* =========================================================
     MACHINE AUTO SCROLL (ZONE SAFE)
     ========================================================= */
  useEffect(() => {
    if (editMode) return;
    if (!zones.length) return;

    const zone = zones[activeZoneIndex];
    if (!zone) return;

    const count = zone.machines.length;
    const timer = setTimeout(() => {
      setActiveMachineIndex(prev => (prev + 1) % count);
    }, 1200);

    return () => clearTimeout(timer);
  }, [activeMachineIndex, activeZoneIndex, zones, editMode]);

  /* =========================================================
     UPDATE PANEL (SINGLE SOURCE OF TRUTH)
     ========================================================= */
  useEffect(() => {
    if (!zones.length) return;

    const zone = zones[activeZoneIndex];
    if (!zone) return;

    const m = zone.machines[activeMachineIndex];
    if (!m) return;

    setSelectedMachine({
      id: getDisplayMachineId(m, zone.name),
      rawId: m,
      status: machineStatus[m],
      zone: zone.name
    });
  }, [activeMachineIndex, activeZoneIndex, zones]);

  /* =========================================================
     SAVE LAYOUT
     ========================================================= */
  useEffect(() => {
    if (layoutKey && editMode) {
      localStorage.setItem(layoutKey, JSON.stringify(zones));
    }
  }, [zones, editMode, layoutKey]);

  return (
    <div className="app">
      <header className="title-bar">
        <h1>Factory Monitoring Dashboard</h1>
      </header>

      <div className="nav-bar">
        <ControlPanel
          factories={machineData.factories}
          selectedFactory={selectedFactory}
          setSelectedFactory={setSelectedFactory}
          selectedPlant={selectedPlant}
          setSelectedPlant={setSelectedPlant}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
        />
      </div>

      {department && zones.length > 0 && (
        <div className="content-layout">
          <ZoneView
            zones={zones}
            editMode={editMode}
            activeZoneIndex={activeZoneIndex}
            getDisplayMachineId={getDisplayMachineId} // 🔑 KEY FIX
          />

          <MachinePanel machine={selectedMachine} />
        </div>
      )}
    </div>
  );
}

export default App;

import { useState, useEffect, useRef } from "react";
import "./App.css";

import machineData from "./data/machineDetails.json";
import machineStatus from "./data/machineStatus.json";

import ControlPanel from "./components/ControlPanel";
import ZoneView from "./components/ZoneView";
import MachinePanel from "./components/MachinePanel";


const ROTATION = {
  MACHINE: 5000, // slow down machine change
  ZONE: 1500,
  DEPT: 2000,
};

/* =========================================================
   Generate consistent Industrial Machine ID
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

  /* -------- Guards -------- */
  const deptCompletedRef = useRef(false);

  /* -------- Resolve hierarchy -------- */
  const factory = machineData.factories.find(
    (f) => f.id === selectedFactory
  );
  const plant = factory?.plants.find((p) => p.id === selectedPlant);
  const department =
    plant && selectedDept
      ? plant.departments.find((d) => d.id === selectedDept)
      : null;

  /* -------- Layout key -------- */
  const layoutKey =
    selectedFactory && selectedPlant && selectedDept
      ? `layout-${selectedFactory}-${selectedPlant}-${selectedDept}`
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

  /* =========================================================
     AUTO SELECT ON CHANGE
     ========================================================= */
  useEffect(() => {
    if (!factory) return;
    setSelectedPlant(factory.plants[0].id);
    setSelectedDept(factory.plants[0].departments[0].id);
  }, [selectedFactory]);

  useEffect(() => {
    if (!plant) return;
    setSelectedDept(plant.departments[0].id);
  }, [selectedPlant]);

  /* =========================================================
     LOAD ZONES
     ========================================================= */
  useEffect(() => {
    if (!department) return;

    deptCompletedRef.current = false;

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
        zone: firstZone.name,
      });
    }
  }, [department, layoutKey]);

  /* =========================================================
     MACHINE ROTATION
     ========================================================= */
  useEffect(() => {
    if (editMode || !zones.length) return;

    const zone = zones[activeZoneIndex];
    if (!zone) return;

    const timer = setTimeout(() => {
      setActiveMachineIndex(
        (prev) => (prev + 1) % zone.machines.length
      );
    }, 1200);

    return () => clearTimeout(timer);
  }, [activeMachineIndex, activeZoneIndex, zones, editMode]);

  /* =========================================================
     ZONE ROTATION
     ========================================================= */
  useEffect(() => {
    if (editMode || !zones.length) return;

    const zone = zones[activeZoneIndex];
    if (!zone) return;

    if (activeMachineIndex === zone.machines.length - 1) {
      const timer = setTimeout(() => {
        if (activeZoneIndex < zones.length - 1) {
          setActiveZoneIndex((z) => z + 1);
        } else {
          deptCompletedRef.current = true;
        }
        setActiveMachineIndex(0);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [activeMachineIndex, activeZoneIndex, zones, editMode]);

  /* =========================================================
     DEPARTMENT → PLANT → FACTORY ROTATION
     ========================================================= */
  useEffect(() => {
    if (editMode || !deptCompletedRef.current || !plant || !factory) return;

    const timer = setTimeout(() => {
      const deptIndex = plant.departments.findIndex(
        (d) => d.id === selectedDept
      );

      // Next department exists
      if (deptIndex < plant.departments.length - 1) {
        setSelectedDept(plant.departments[deptIndex + 1].id);
      } else {
        // Move to next plant
        const plantIndex = factory.plants.findIndex(
          (p) => p.id === selectedPlant
        );

        if (plantIndex < factory.plants.length - 1) {
          const nextPlant = factory.plants[plantIndex + 1];
          setSelectedPlant(nextPlant.id);
          setSelectedDept(nextPlant.departments[0].id);
        } else {
          // Move to next factory
          const factoryIndex = machineData.factories.findIndex(
            (f) => f.id === selectedFactory
          );

          const nextFactory =
            factoryIndex < machineData.factories.length - 1
              ? machineData.factories[factoryIndex + 1]
              : machineData.factories[0];

          setSelectedFactory(nextFactory.id);
          setSelectedPlant(nextFactory.plants[0].id);
          setSelectedDept(nextFactory.plants[0].departments[0].id);
        }
      }

      setActiveZoneIndex(0);
      setActiveMachineIndex(0);
      deptCompletedRef.current = false;
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    deptCompletedRef.current,
    selectedDept,
    selectedPlant,
    selectedFactory,
    plant,
    factory,
    editMode,
  ]);

  /* =========================================================
     UPDATE RIGHT PANEL
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
      zone: zone.name,
    });
  }, [activeMachineIndex, activeZoneIndex, zones]);

  return (
    <div className={`app ${editMode ? "edit-mode" : ""}`}>
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

        <div className="top-right-controls">
          <button
            className="layout-btn edit"
            onClick={() => setEditMode((e) => !e)}
          >
            {editMode ? "Exit Edit" : "Edit Layout"}
          </button>
        </div>
      </div>

      {department && zones.length > 0 && (
        <div className="content-layout">
          <ZoneView
            zones={zones}
            editMode={editMode}
            activeZoneIndex={activeZoneIndex}
            setZones={setZones}
            onMachineClick={(machine) =>
              setSelectedMachine(machine)
            }
          />

          <MachinePanel machine={selectedMachine} />
        </div>
      )}
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import "./App.css";

import machineData from "./data/machineDetails.json";
import ControlPanel from "./components/ControlPanel";
import ZoneView from "./components/ZoneView";
import MachineModal from "./components/MachineModal";

function App() {
  const [selectedFactory, setSelectedFactory] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const [zones, setZones] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [editMode, setEditMode] = useState(false);

  /* Resolve hierarchy */
  const factory = machineData.factories.find(
    (f) => f.id === selectedFactory || f.name === selectedFactory
  );

  const plant = factory?.plants.find(
    (p) => p.id === selectedPlant || p.name === selectedPlant
  );

  const department = plant
    ? plant.departments.find(
        (d) => d.id === selectedDept || d.name === selectedDept
      )
    : null;

  /* Unique key per Factory + Plant + Dept */
  const layoutKey =
    factory && plant && department
      ? `layout-${factory.id}-${plant.id}-${department.id}`
      : null;

  /* Load layout */
  useEffect(() => {
    if (!department) {
      setZones([]);
      return;
    }

    if (layoutKey) {
      const savedLayout = localStorage.getItem(layoutKey);
      if (savedLayout) {
        setZones(JSON.parse(savedLayout));
        return;
      }
    }

    setZones([...department.zones]);
  }, [department, layoutKey]);

  /* Save layout (only in edit mode) */
  useEffect(() => {
    if (layoutKey && editMode) {
      localStorage.setItem(layoutKey, JSON.stringify(zones));
    }
  }, [zones, editMode, layoutKey]);

  /* Reset layout */
  const resetLayout = () => {
    if (!department) return;

    if (layoutKey) {
      localStorage.removeItem(layoutKey);
    }

    setZones([...department.zones]);
    setEditMode(false);
  };

  return (
    <div className="app">
      {/* ---------- TITLE BAR ---------- */}
      <header className="title-bar">
        <h1>Factory Monitoring Dashboard</h1>
      </header>

      {/* ---------- NAV BAR ---------- */}
      <div className="nav-bar">
        {/* LEFT: Factory / Plant / Dept */}
        <ControlPanel
          factories={machineData.factories}
          selectedFactory={selectedFactory}
          setSelectedFactory={setSelectedFactory}
          selectedPlant={selectedPlant}
          setSelectedPlant={setSelectedPlant}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
        />

        {/* RIGHT: Edit / Reset */}
        {department && (
          <div className="nav-actions">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`nav-btn ${editMode ? "danger" : ""}`}
            >
              {editMode ? "Exit Edit" : "Edit Layout"}
            </button>

            <button
              onClick={resetLayout}
              className="nav-btn secondary"
            >
              Reset Layout
            </button>
          </div>
        )}
      </div>

      {/* ---------- ZONES & MACHINES ---------- */}
      {department && (
        <ZoneView
          zones={zones}
          setZones={setZones}
          editMode={editMode}
          onMachineClick={setSelectedMachine}
        />
      )}

      {/* ---------- MACHINE MODAL ---------- */}
      <MachineModal
        machine={selectedMachine}
        onClose={() => setSelectedMachine(null)}
      />
    </div>
  );
}

export default App;

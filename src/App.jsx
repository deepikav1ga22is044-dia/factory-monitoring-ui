import { useState, useEffect } from "react";
import "./App.css";

import machineData from "./data/machineDetails.json";
import ControlPanel from "./components/ControlPanel";
import ZoneView from "./components/ZoneView";
import MachineModal from "./components/MachineModal";

function App() {
  /* -------- Dropdown selections -------- */
  const [selectedFactory, setSelectedFactory] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  /* -------- Layout & machine state -------- */
  const [zones, setZones] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [editMode, setEditMode] = useState(false);

  /* ======== ✅ ADD 1: DEFAULT FACTORY & PLANT ON LOAD ======== */
  useEffect(() => {
    if (!machineData.factories?.length) return;

    const firstFactory = machineData.factories[0];
    const firstPlant = firstFactory.plants?.[0];

    setSelectedFactory(firstFactory.id);
    setSelectedPlant(firstPlant?.id || "");
  }, []);

  /* -------- Resolve hierarchy -------- */
  const factory = machineData.factories.find(
    (f) => f.id === selectedFactory
  );

  const plant = factory?.plants.find(
    (p) => p.id === selectedPlant
  );

  /* ======== ✅ ADD 2: AUTO-SELECT FIRST DEPT ======== */
  useEffect(() => {
    if (!plant) return;

    const firstDept = plant.departments?.[0];
    if (firstDept) {
      setSelectedDept(firstDept.id);
    }
  }, [plant]);

  const department =
    plant && selectedDept
      ? plant.departments.find((d) => d.id === selectedDept)
      : null;

  /* -------- Unique key for saving layout -------- */
  const layoutKey =
    selectedFactory && selectedPlant && selectedDept
      ? `layout-${selectedFactory}-${selectedPlant}-${selectedDept}`
      : null;

  /* -------- Load zones when department changes -------- */
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

  /* -------- Save layout in edit mode -------- */
  useEffect(() => {
    if (layoutKey && editMode) {
      localStorage.setItem(layoutKey, JSON.stringify(zones));
    }
  }, [zones, editMode, layoutKey]);

  /* -------- Reset layout -------- */
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
        {/* LEFT: Dropdowns */}
        <ControlPanel
          factories={machineData.factories}
          selectedFactory={selectedFactory}
          setSelectedFactory={setSelectedFactory}
          selectedPlant={selectedPlant}
          setSelectedPlant={setSelectedPlant}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
        />

        {/* RIGHT: Status Legend + Edit / Reset */}
        {department && (
          <div className="nav-right">
            <div className="status-legend">
              <div><span className="legend-dot running"></span> Running</div>
              <div><span className="legend-dot idle"></span> Idle</div>
              <div><span className="legend-dot off"></span> Off</div>
              <div><span className="legend-dot fault"></span> Fault</div>
            </div>

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
          </div>
        )}
      </div>

      {/* ---------- ZONES & MACHINES ---------- */}
      {department && zones.length > 0 && (
        <ZoneView
          zones={zones}
          setZones={setZones}
          editMode={editMode}
          onMachineClick={setSelectedMachine}
        />
      )}

      {/* ---------- MACHINE DETAILS MODAL ---------- */}
      <MachineModal
        machine={selectedMachine}
        onClose={() => setSelectedMachine(null)}
      />
    </div>
  );
}

export default App;

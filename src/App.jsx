import { useState, useEffect } from "react";
import "./App.css";

import machineData from "./data/machineDetails.json";
import machineStatus from "./data/machineStatus.json";

import ControlPanel from "./components/ControlPanel";
import FactoryScene from "./components/three/FactoryScene";
import machineMap from "./data/machineMap";

const ROTATION_TIME = {
  FACTORY: 40000, // 40s
  PLANT: 30000,   // 15s
  DEPT: 20000,    // 10s
};
function buildMachineLookup(machineData, machineStatus, machineMap) {
  const lookup = {};

  machineData.factories.forEach(factory => {
    factory.plants.forEach(plant => {
      plant.departments.forEach(dept => {
        dept.zones.forEach(zone => {
          zone.machines.forEach(shortId => {
            const fullId = machineMap[shortId] || shortId;
            const status = machineStatus[shortId] || "off";

            lookup[shortId] = {
              shortId,
              fullId,
              status,

              // APQO (from machineDetails.json if present)
              availability: zone.availability ?? null,
              performance: zone.performance ?? null,
              quality: zone.quality ?? null,
              oee: zone.oEE ?? null,

              // 🔁 duplicated / derived fields
              reason:
                status === "fault"
                  ? "Machine Fault"
                  : status === "idle"
                  ? "Waiting / Idle"
                  : status === "off"
                  ? "Powered Off"
                  : "Normal Operation",

              lastUpdated: new Date().toLocaleString(),

              parameters: {
                speed: status === "running" ? "1450 RPM" : "0 RPM",
                temperature: status === "running" ? "62°C" : "—",
                load: status === "running" ? "68%" : "—",
              },
            };
          });
        });
      });
    });
  });

  return lookup;
}

function App() {
  const [selectedFactory, setSelectedFactory] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const [selectedMachine, setSelectedMachine] = useState(null);

  /* ===============================
     DERIVED DATA
  =============================== */
  const factory = machineData.factories.find(
    (f) => f.id === selectedFactory
  );

  const plant = factory?.plants.find(
    (p) => p.id === selectedPlant
  );

  const department =
    plant?.departments.find(
      (d) => d.id === selectedDept
    ) || null;

    const machineLookup = buildMachineLookup(
  machineData,
  machineStatus,
  machineMap
);

  /* ===============================
     DEFAULT LOAD (FIRST FACTORY)
  =============================== */
  useEffect(() => {
    const f = machineData.factories[0];
    const p = f.plants[0];
    const d = p.departments[0];

    setSelectedFactory(f.id);
    setSelectedPlant(p.id);
    setSelectedDept(d.id);
  }, []);

  /* ===============================
     🔑 RESET PLANT & DEPT
     WHEN FACTORY CHANGES
  =============================== */
  useEffect(() => {
    if (!selectedFactory) return;

    const f = machineData.factories.find(
      (x) => x.id === selectedFactory
    );
    if (!f) return;

    const p = f.plants[0];
    const d = p.departments[0];

    setSelectedPlant(p.id);
    setSelectedDept(d.id);
  }, [selectedFactory]);

  /* ===============================
     🔑 RESET DEPT
     WHEN PLANT CHANGES
  =============================== */
  useEffect(() => {
    if (!factory || !selectedPlant) return;

    const p = factory.plants.find(
      (x) => x.id === selectedPlant
    );
    if (!p) return;

    const d = p.departments[0];
    setSelectedDept(d.id);
  }, [selectedPlant]);

  /* ===============================
     RESET MACHINE ON DEPT CHANGE
  =============================== */
  useEffect(() => {
    setSelectedMachine(null);
  }, [selectedDept]);

  console.log("SELECTED DEPT OBJECT:", department);

  /* ===============================
   AUTO ROTATION – DEPT
=============================== */
useEffect(() => {
  if (!plant) return;

  const interval = setInterval(() => {
    const depts = plant.departments;
    if (!depts.length) return;

    const currentIndex = depts.findIndex(
      (d) => d.id === selectedDept
    );

    const nextIndex =
      (currentIndex + 1) % depts.length;

    setSelectedDept(depts[nextIndex].id);
  }, ROTATION_TIME.DEPT);

  return () => clearInterval(interval);
}, [plant, selectedDept]);

/* ===============================
   AUTO ROTATION – PLANT
=============================== */
useEffect(() => {
  if (!factory) return;

  const interval = setInterval(() => {
    const plants = factory.plants;
    if (!plants.length) return;

    const currentIndex = plants.findIndex(
      (p) => p.id === selectedPlant
    );

    const nextIndex =
      (currentIndex + 1) % plants.length;

    setSelectedPlant(plants[nextIndex].id);
  }, ROTATION_TIME.PLANT);

  return () => clearInterval(interval);
}, [factory, selectedPlant]);

/* ===============================
   AUTO ROTATION – FACTORY
=============================== */
useEffect(() => {
  const interval = setInterval(() => {
    const factories = machineData.factories;

    const currentIndex = factories.findIndex(
      (f) => f.id === selectedFactory
    );

    const nextIndex =
      (currentIndex + 1) % factories.length;

    setSelectedFactory(factories[nextIndex].id);
  }, ROTATION_TIME.FACTORY);

  return () => clearInterval(interval);
}, [selectedFactory]);

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

      {/* FULL SCREEN DEPARTMENT CANVAS */}
      {department && (
        <div className="canvas-wrapper">
          <FactoryScene
  department={department}
  machineLookup={machineLookup}   // ✅ IMPORTANT
  selectedMachine={selectedMachine}
  onMachineHover={setSelectedMachine}
  onCloseMachine={() => setSelectedMachine(null)}
/>

        </div>
      )}
    </div>
  );
}

export default App;

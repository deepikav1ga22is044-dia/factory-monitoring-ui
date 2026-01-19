import { useEffect, useRef } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import machineStatus from "../data/machineStatus.json";
import machineMap from "../data/machineMap";

import SortableMachine from "./SortableMachine"; // edit mode capsules
import CncMachineSvg from "./machines/CncMachineSvg"; // normal mode SVG

/* =========================================================
   ZONE CARD
   ========================================================= */
function ZoneCard({
  zone,
  index,
  editMode,
  isActive,
  setZones,
  onMachineClick,
  activeZoneRef,
}) {
  const handleDragEnd = (event) => {
    if (!editMode) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setZones((prev) =>
      prev.map((z, i) => {
        if (i !== index) return z;

        const oldIndex = z.machines.indexOf(active.id);
        const newIndex = z.machines.indexOf(over.id);

        return {
          ...z,
          machines: arrayMove(z.machines, oldIndex, newIndex),
        };
      })
    );
  };

  return (
    <div
      ref={isActive ? activeZoneRef : null}
      className={`zone-box ${isActive ? "zone-active" : ""}`}
    >
      {/* -------- ZONE HEADER -------- */}
      <div className="zone-header">
        <div className="zone-name">{zone.name}</div>

        <div className="zone-apqo">
          <span>A: {zone.availability ?? 0}%</span>
          <span>P: {zone.performance ?? 0}%</span>
          <span>Q: {zone.quality ?? 0}%</span>
          <span>OEE: {zone.oEE ?? 0}%</span>
        </div>
      </div>

      {/* =================================================
         EDIT MODE → DRAGGABLE CAPSULE MACHINES
         ================================================= */}
      {editMode ? (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={zone.machines}
            strategy={horizontalListSortingStrategy}
          >
            <div className="machines">
              {zone.machines.map((machineKey) => (
                <SortableMachine
                  key={machineKey}
                  id={machineKey}
                  status={machineStatus[machineKey]}
                  label={machineMap[machineKey] || machineKey}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        /* =================================================
           NORMAL MODE → SVG CNC MACHINES
           ================================================= */
        <div className="machines">
          {zone.machines.map((machineKey) => (
            <CncMachineSvg
              key={machineKey}
              id={machineMap[machineKey] || machineKey}
              status={machineStatus[machineKey]}
              onClick={() =>
                onMachineClick({
                  id: machineMap[machineKey] || machineKey,
                  status: machineStatus[machineKey],
                  zone: zone.name,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ZONE VIEW
   ========================================================= */
function ZoneView({
  zones,
  editMode,
  activeZoneIndex,
  setZones,
  onMachineClick,
}) {
  const activeZoneRef = useRef(null);

  /* 🔑 AUTO-SCROLL ACTIVE ZONE INTO VIEW */
  useEffect(() => {
    if (activeZoneRef.current) {
      activeZoneRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeZoneIndex]);

  return (
    <div className="zones-grid">
      {zones.map((zone, index) => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          index={index}
          editMode={editMode}
          isActive={index === activeZoneIndex}
          setZones={setZones}
          onMachineClick={onMachineClick}
          activeZoneRef={activeZoneRef}
        />
      ))}
    </div>
  );
}

export default ZoneView;

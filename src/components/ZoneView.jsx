import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import machineStatus from "../data/machineStatus.json";
import machineMap from "../data/machineMap";

/* ---------------- SORTABLE MACHINE ---------------- */
function SortableMachine({ machineKey, status, editMode, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: machineKey,
    disabled: !editMode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const displayId = machineMap[machineKey] || machineKey;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(editMode ? listeners : {})}
      onClick={() => {
        if (!editMode) onClick();
      }}
    >
      {/* ✅ FULL MACHINE ID ALWAYS */}
      <div className={`machine-pill ${status}`}>
        <span className="machine-text">{displayId}</span>
      </div>
    </div>
  );
}

/* ---------------- ZONE CARD ---------------- */
function ZoneCard({
  zone,
  editMode,
  isActive,
  onMachineClick,
  updateZoneMachines
}) {
  const handleMachineDragEnd = (event) => {
    if (!editMode) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = zone.machines.indexOf(active.id);
    const newIndex = zone.machines.indexOf(over.id);

    updateZoneMachines(
      zone.id,
      arrayMove(zone.machines, oldIndex, newIndex)
    );
  };

  return (
    <div className={`zone-box ${isActive ? "zone-active" : ""}`}>
      <div className="zone-header">
        <span className="zone-name">{zone.name}</span>

        <div className="zone-apqo">
          <span>A: {zone.availability ?? 0}%</span>
          <span>P: {zone.performance ?? 0}%</span>
          <span>Q: {zone.quality ?? 0}%</span>
          <span>OEE: {zone.oEE ?? 0}%</span>
        </div>
      </div>

      {editMode ? (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleMachineDragEnd}
        >
          <SortableContext
            items={zone.machines}
            strategy={horizontalListSortingStrategy}
          >
            <div className="machines">
              {zone.machines.map((machineKey) => (
                <SortableMachine
                  key={machineKey}
                  machineKey={machineKey}
                  status={machineStatus[machineKey]}
                  editMode
                  onClick={() => {}}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="machines">
          {zone.machines.map((machineKey) => (
            <SortableMachine
              key={machineKey}
              machineKey={machineKey}
              status={machineStatus[machineKey]}
              editMode={false}
              onClick={() =>
                onMachineClick({
                  key: machineKey,
                  id: machineMap[machineKey],
                  status: machineStatus[machineKey],
                  zone: zone.name
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- ZONE VIEW ---------------- */
function ZoneView({
  zones,
  setZones,
  editMode,
  activeZoneIndex,
  onMachineClick
}) {
  const updateZoneMachines = (zoneId, machines) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId ? { ...z, machines } : z
      )
    );
  };

  return (
    <div className="zones-grid">
      {zones.map((zone, index) => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          editMode={editMode}
          isActive={index === activeZoneIndex}
          onMachineClick={onMachineClick}
          updateZoneMachines={updateZoneMachines}
        />
      ))}
    </div>
  );
}

export default ZoneView;

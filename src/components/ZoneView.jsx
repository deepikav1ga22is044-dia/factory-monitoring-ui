import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import machineStatus from "../data/machineStatus.json";

/* ---------------- SORTABLE MACHINE ---------------- */
function SortableMachine({ id, status, editMode, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id,
    disabled: !editMode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(editMode ? listeners : {})}
      onClick={() => {
        if (!editMode) onClick();
      }}
      title={editMode ? "Drag to reposition" : "Click for details"}
    >
      <div className={`machine ${status}`}>
        <span className="machine-text">{id}</span>
      </div>
    </div>
  );
}

/* ---------------- ZONE CARD ---------------- */
function ZoneCard({ zone, editMode, onMachineClick, updateZoneMachines }) {
  const handleMachineDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = zone.machines.indexOf(active.id);
    const newIndex = zone.machines.indexOf(over.id);

    updateZoneMachines(zone.id, arrayMove(zone.machines, oldIndex, newIndex));
  };

  return (
    <div className="zone-box">
      <div className="zone-header">
        <span className="zone-name">{zone.name}</span>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleMachineDragEnd}
      >
        <SortableContext
          items={zone.machines}
          strategy={horizontalListSortingStrategy}
        >
          <div className="machines">
            {zone.machines.map((machineId) => (
              <SortableMachine
                key={machineId}
                id={machineId}
                status={machineStatus[machineId]}
                editMode={editMode}
                onClick={() =>
                  onMachineClick({
                    id: machineId,
                    status: machineStatus[machineId],
                    zone: zone.name
                  })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

/* ---------------- ZONE VIEW ---------------- */
function ZoneView({ zones, setZones, editMode, onMachineClick }) {
  const updateZoneMachines = (zoneId, machines) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId ? { ...z, machines } : z
      )
    );
  };

  return (
    <div className="zones-grid">
      {zones.map((zone) => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          editMode={editMode}
          onMachineClick={onMachineClick}
          updateZoneMachines={updateZoneMachines}
        />
      ))}
    </div>
  );
}

export default ZoneView;

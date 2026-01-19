import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* =========================================================
   SORTABLE MACHINE (USED ONLY IN EDIT MODE)
   ========================================================= */
function SortableMachine({ id, status, label }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`machine ${status}`}
    >
      {label}
    </div>
  );
}

export default SortableMachine;

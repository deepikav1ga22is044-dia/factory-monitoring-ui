function MachineModal({ machine, onClose }) {
  if (!machine) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Machine Details</h2>

        <p><b>Machine ID:</b> {machine.id}</p>
        <p><b>Status:</b> {machine.status}</p>
        <p><b>Zone:</b> {machine.zone}</p>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default MachineModal;

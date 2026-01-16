import "./MachinePanel.css";

/* -------------------------------------------------
   STATUS MEANING + OPERATOR ACTION (STATIC FOR NOW)
-------------------------------------------------- */
const STATUS_INFO = {
  running: {
    label: "RUNNING",
    reason: "Machine is actively producing parts.",
    action: "No action required."
  },
  idle: {
    label: "IDLE",
    reason: "Machine is available but waiting for material or operator.",
    action: "Check material availability or operator assignment."
  },
  off: {
    label: "OFF",
    reason: "Machine is powered off or shift is inactive.",
    action: "Verify shift schedule or power state."
  },
  fault: {
    label: "FAULT",
    reason: "Machine stopped due to an alarm or error.",
    action: "Check machine alarm screen and resolve the fault."
  }
};

function MachinePanel({ machine }) {
  /* -------- NO MACHINE SELECTED -------- */
  if (!machine) {
  return (
    <div className="machine-panel empty">
      <p>Loading machine details…</p>
    </div>
  );
}


  const statusKey = machine.status || "off";
  const info = STATUS_INFO[statusKey] || STATUS_INFO.off;

  /* -------- DUMMY APQO VALUES (API LATER) -------- */
  const apqo = {
    availability: 92,
    performance: 88,
    quality: 99,
    oee: 81
  };

  return (
    <div className="machine-panel">
      {/* -------- HEADER -------- */}
      <div className="panel-header">
        <h2>{machine.id}</h2>
        <span className={`status-badge ${statusKey}`}>
          {info.label}
        </span>
      </div>

      <div className="panel-subtitle">
        Zone: <strong>{machine.zone}</strong>
      </div>

      {/* -------- STATUS EXPLANATION -------- */}
      <div className="panel-section">
        <h4>Status Reason</h4>
        <p>{info.reason}</p>
      </div>

      {/* -------- APQO -------- */}
      <div className="panel-section">
        <h4>APQO Metrics</h4>
        <div className="apqo-grid">
          <div><span>Availability</span>{apqo.availability}%</div>
          <div><span>Performance</span>{apqo.performance}%</div>
          <div><span>Quality</span>{apqo.quality}%</div>
          <div><span>OEE</span>{apqo.oee}%</div>
        </div>
      </div>

      {/* -------- OPERATOR ACTION -------- */}
      <div className="panel-section action">
        <h4>Recommended Action</h4>
        <p>{info.action}</p>
      </div>
    </div>
  );
}

export default MachinePanel;

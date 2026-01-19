import "./MachinePanel.css";

/* =========================================================
   STATUS + REASON + PARAMETERS (STATIC / DEMO DATA)
   ========================================================= */
const STATUS_INFO = {
  running: {
    label: "RUNNING",
    reason: "Machine is actively producing parts.",
    action: "No action required.",
    parameters: [
      { name: "Cycle Time", value: "42 sec", state: "normal" },
      { name: "Spindle Speed", value: "3200 RPM", state: "normal" },
      { name: "Load", value: "78%", state: "normal" },
      { name: "Parts Produced", value: "124", state: "normal" }
    ]
  },

  idle: {
    label: "IDLE",
    reason: "Machine is available but waiting for material or operator.",
    action: "Check material availability or operator assignment.",
    parameters: [
      { name: "Material Level", value: "Low", state: "warning" },
      { name: "Operator Logged In", value: "No", state: "warning" },
      { name: "Cycle Start Signal", value: "OFF", state: "normal" }
    ]
  },

  off: {
    label: "OFF",
    reason: "Machine is powered off or shift is inactive.",
    action: "Verify shift schedule or power state.",
    parameters: [
      { name: "Main Power", value: "OFF", state: "normal" },
      { name: "Shift Status", value: "Inactive", state: "normal" }
    ]
  },

  fault: {
    label: "FAULT",
    reason: "Machine stopped due to abnormal operating conditions.",
    action: "Resolve alarms before restarting the machine.",
    parameters: [
      { name: "Spindle Temperature", value: "92°C", state: "critical" },
      { name: "Vibration Level", value: "8.4 mm/s", state: "critical" },
      { name: "Servo Alarm Code", value: "E-204", state: "critical" },
      { name: "Emergency Stop", value: "Triggered", state: "critical" }
    ]
  }
};

function MachinePanel({ machine }) {
  if (!machine) {
    return (
      <div className="machine-panel empty">
        <p>Loading machine details…</p>
      </div>
    );
  }

  const statusKey = machine.status || "off";
  const info = STATUS_INFO[statusKey];

  return (
    <div className="machine-panel">
      {/* ---------- HEADER ---------- */}
      <div className="panel-header">
        <h2>{machine.id}</h2>
        <span className={`status-badge ${statusKey}`}>
          {info.label}
        </span>
      </div>

      {/* ---------- SUBTITLE + TIMESTAMP ---------- */}
      <div className="panel-subtitle">
        Zone: <strong>{machine.zone}</strong>
        <div className="timestamp">
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* ---------- STATUS REASON ---------- */}
      <div className="panel-section">
        <h4>Status Reason</h4>
        <p>{info.reason}</p>
      </div>

      {/* ---------- APQO ---------- */}
      <div className="panel-section">
        <h4>APQO Metrics</h4>
        <div className="apqo-grid">
          <div><span>Availability</span>92%</div>
          <div><span>Performance</span>88%</div>
          <div><span>Quality</span>99%</div>
          <div><span>OEE</span>81%</div>
        </div>
      </div>

      {/* ---------- RECOMMENDED ACTION ---------- */}
      <div className="panel-section action">
        <h4>Recommended Action</h4>
        <p>{info.action}</p>
      </div>

      {/* ---------- STATUS PARAMETERS ---------- */}
      <div className="panel-section">
        <h4>Status Parameters</h4>

        <div className="status-params">
          {info.parameters.map((param, index) => (
            <div
              key={index}
              className={`param-box ${param.state}`}
            >
              <span className="param-name">{param.name}</span>
              <span className="param-value">{param.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MachinePanel;

import "./MachineBase.css";

const STATUS_COLOR = {
  running: "#2ecc71",
  idle: "#f1c40f",
  off: "#7f8c8d",
  fault: "#e74c3c"
};

const STATUS_LABEL = {
  running: "OPERATE",
  idle: "IDLE",
  off: "STOP",
  fault: "ALARM"
};

function CncMachine({ id, status, onClick }) {
  return (
    <div className={`cnc-wrapper ${status}`} onClick={onClick}>
      <div className="cnc-status">
        {STATUS_LABEL[status]}
      </div>

      {/* SVG CNC MACHINE */}
      <svg
        width="120"
        height="90"
        viewBox="0 0 120 90"
        className="cnc-svg"
      >
        {/* base */}
        <polygon
          points="10,70 90,70 110,85 30,85"
          fill="#444"
        />

        {/* body */}
        <polygon
          points="10,20 90,20 90,70 10,70"
          fill={STATUS_COLOR[status]}
        />

        {/* side depth */}
        <polygon
          points="90,20 110,35 110,85 90,70"
          fill="#333"
        />

        {/* door */}
        <rect
          x="30"
          y="30"
          width="25"
          height="30"
          fill="#1a1a1a"
          stroke="#000"
        />
      </svg>

      <div className="cnc-id">{id}</div>
    </div>
  );
}

export default CncMachine;

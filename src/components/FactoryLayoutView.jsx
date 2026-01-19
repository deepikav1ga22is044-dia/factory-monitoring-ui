import "./FactoryLayoutView.css";

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

/**
 * Sample factory layout (static coordinates)
 * Later this can come from backend / config
 */
const MACHINES = [
  {
    id: "PLANT1-CNC-MCH-0001",
    status: "running",
    x: 80,
    y: 80
  },
  {
    id: "PLANT1-CNC-MCH-0002",
    status: "idle",
    x: 220,
    y: 80
  },
  {
    id: "PLANT1-CNC-MCH-0003",
    status: "fault",
    x: 80,
    y: 180
  },
  {
    id: "PLANT1-CNC-MCH-0004",
    status: "off",
    x: 220,
    y: 180
  }
];

function FactoryLayoutView({ onMachineSelect }) {
  return (
    <div className="factory-layout-wrapper">
      <svg width="100%" height="420" viewBox="0 0 600 400">
        {/* ---- FACTORY FLOOR ---- */}
        <rect x="20" y="20" width="560" height="360" rx="12" className="factory-floor" />

        {/* ---- MACHINES ---- */}
        {MACHINES.map(machine => (
          <g
            key={machine.id}
            className="machine-group"
            onClick={() => onMachineSelect(machine)}
          >
            {/* label */}
            <text
              x={machine.x + 40}
              y={machine.y - 6}
              textAnchor="middle"
              className="machine-label"
            >
              {STATUS_LABEL[machine.status]}
            </text>

            {/* machine body */}
            <rect
              x={machine.x}
              y={machine.y}
              width="80"
              height="50"
              rx="6"
              fill={STATUS_COLOR[machine.status]}
              className="machine-rect"
            />

            {/* machine id */}
            <text
              x={machine.x + 40}
              y={machine.y + 30}
              textAnchor="middle"
              className="machine-id"
            >
              {machine.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default FactoryLayoutView;

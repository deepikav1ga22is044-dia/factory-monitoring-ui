import "./MachineSvg.css";

const STATUS_LABEL = {
  running: "OPERATE",
  idle: "IDLE",
  off: "STOP",
  fault: "ALARM"
};

function MachineSvg({ id, status, onClick }) {
return (
  <div style={{ color: "red", fontWeight: "bold" }}>
    MACHINE SVG RENDERING
  </div>
);

}

export default MachineSvg;

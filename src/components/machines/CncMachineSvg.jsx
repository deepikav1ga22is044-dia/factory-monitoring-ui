function CncMachineSvg({ id, status = "idle", onClick }) {
  const STATUS_COLORS = {
    running: "#28c76f",
    idle: "#f1c40f",
    fault: "#e74c3c",
    off: "#7f8c8d",
  };

  const color = STATUS_COLORS[status] || "#7f8c8d";

  return (
    <svg
      width="140"
      height="110"
      viewBox="0 0 140 110"
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      {/* Glow for alarm */}
      {status === "fault" && (
        <rect
          x="8"
          y="28"
          width="124"
          height="70"
          rx="10"
          fill={color}
          opacity="0.25"
        />
      )}

      {/* STATUS LABEL */}
      <text
        x="70"
        y="18"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={color}
      >
        {status.toUpperCase()}
      </text>

      {/* MACHINE BODY */}
      <rect
        x="12"
        y="32"
        width="116"
        height="60"
        rx="8"
        fill="#1f1f1f"
        stroke={color}
        strokeWidth="2"
      />

      {/* CONTROL PANEL */}
      <rect x="20" y="40" width="20" height="36" rx="3" fill={color} />
      <circle cx="30" cy="48" r="3" fill="#000" />
      <circle cx="30" cy="58" r="3" fill="#000" />
      <circle cx="30" cy="68" r="3" fill="#000" />

      {/* WORK AREA */}
      <rect
        x="50"
        y="42"
        width="60"
        height="40"
        rx="4"
        fill="#2b2b2b"
      />

      {/* MACHINE ID */}
      <text
        x="70"
        y="104"
        textAnchor="middle"
        fontSize="10"
        fill="#ccc"
      >
        {id}
      </text>
    </svg>
  );
}

export default CncMachineSvg;

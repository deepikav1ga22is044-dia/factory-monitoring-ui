function ControlPanel({
  factories,
  selectedFactory,
  setSelectedFactory,
  selectedPlant,
  setSelectedPlant,
  selectedDept,
  setSelectedDept
}) {
  const factory = factories.find(f => f.id === selectedFactory);
  const plant = factory?.plants.find(p => p.id === selectedPlant);

  return (
    <div className="control-panel">
      <select
        value={selectedFactory}
        onChange={(e) => {
          setSelectedFactory(e.target.value);
          setSelectedPlant("");
          setSelectedDept("");
        }}
      >
        <option value="">Select Factory</option>
        {factories.map(f => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>

      <select
        value={selectedPlant}
        disabled={!selectedFactory}
        onChange={(e) => {
          setSelectedPlant(e.target.value);
          setSelectedDept("");
        }}
      >
        <option value="">Select Plant</option>
        {factory?.plants.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        value={selectedDept}
        disabled={!selectedPlant}
        onChange={(e) => setSelectedDept(e.target.value)}
      >
        <option value="">Select Department</option>
        {plant?.departments.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
    </div>
  );
}

export default ControlPanel;

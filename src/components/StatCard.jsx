export default function StatCard({ label, value, icon }) {
  return (
    <div className="hp-stat-card h-100">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {icon && <i className={`bi ${icon} icon`}></i>}
    </div>
  );
}

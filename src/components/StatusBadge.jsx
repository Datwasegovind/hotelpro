export default function StatusBadge({ status }) {
  const cls = String(status || "").toLowerCase();
  return <span className={`hp-badge ${cls}`}>{status}</span>;
}

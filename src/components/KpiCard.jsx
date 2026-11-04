export default function KpiCard({ label, value, note, icon: Icon, tone = 'blue', alert = false }) {
  return (
    <article className={`kpi-card kpi-${tone}`}>
      <div className="kpi-top"><span>{label}</span><div className="kpi-icon"><Icon size={20} strokeWidth={1.8} /></div></div>
      <div className={`kpi-value ${alert ? 'kpi-alert' : ''}`}>{value ?? '—'}</div>
      <div className="kpi-note">{note}</div>
    </article>
  )
}

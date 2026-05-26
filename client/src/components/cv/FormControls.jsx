export function Field({ label, value, onChange, type = 'text', placeholder, error }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3, placeholder, maxLength }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <textarea
        value={value || ''}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
      />
    </label>
  );
}

export function Select({ label, value, onChange, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select value={value || ''} onChange={event => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

export function SectionCard({ title, children, action }) {
  return (
    <section className="form-section">
      <div className="section-title">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

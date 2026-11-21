export default function Input({
  label,
  error,
  id,
  type = 'text',
  className = '',
  required = false,
  ...props
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label} {required && <span style={{ color: 'var(--text-danger)' }}>*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

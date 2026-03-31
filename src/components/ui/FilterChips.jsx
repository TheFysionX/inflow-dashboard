export default function FilterChips({
  label,
  value,
  options,
  onChange,
  allLabel = 'All',
}) {
  if (!options?.length) {
    return null
  }

  return (
    <div className="filter-group">
      <span>{label}</span>
      <div className="filter-chip-row">
        <button
          className={value === 'all' ? 'filter-chip is-active' : 'filter-chip'}
          onClick={() => onChange('all')}
          type="button"
        >
          {allLabel}
        </button>
        {options.map((option) => (
          <button
            className={value === option.value ? 'filter-chip is-active' : 'filter-chip'}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            <span>{option.label}</span>
            <small>{option.count}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

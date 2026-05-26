const LABELS = ['', 'Básico', 'Elemental', 'Intermedio', 'Avanzado', 'Nativo'];

export default function LanguageLevel({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          title={LABELS[n]}
          onClick={() => onChange(n)}
          className={`w-5 h-5 rounded-full border-2 transition-colors ${
            n <= value
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white border-gray-300 hover:border-blue-400'
          }`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{LABELS[value] ?? ''}</span>
    </div>
  );
}

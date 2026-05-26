import { useCv } from '../context/CvContext.jsx';
import TextField from '../components/TextField.jsx';

export default function PersonalSection() {
  const { cv, dispatch } = useCv();
  const p = cv.personal;

  function update(field) {
    return value => dispatch({ type: 'UPDATE_PERSONAL', payload: { [field]: value } });
  }

  function updateLink(id, field, value) {
    const links = p.links.map(l => l.id === id ? { ...l, [field]: value } : l);
    dispatch({ type: 'UPDATE_PERSONAL', payload: { links } });
  }

  function addLink() {
    const links = [...p.links, { id: crypto.randomUUID(), label: '', url: '' }];
    dispatch({ type: 'UPDATE_PERSONAL', payload: { links } });
  }

  function removeLink(id) {
    dispatch({ type: 'UPDATE_PERSONAL', payload: { links: p.links.filter(l => l.id !== id) } });
  }

  return (
    <div className="flex flex-col gap-3">
      <TextField label="Nombre completo" value={p.fullName} onChange={update('fullName')} />
      <TextField label="Titular profesional" value={p.headline} onChange={update('headline')} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Email" value={p.email} onChange={update('email')} type="email" />
        <TextField label="Teléfono" value={p.phone} onChange={update('phone')} />
      </div>
      <TextField label="Ubicación" value={p.location} onChange={update('location')} />
      <TextField label="URL de foto" value={p.photoUrl} onChange={update('photoUrl')} placeholder="https://…" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enlaces</span>
          <button
            type="button"
            onClick={addLink}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            + Añadir
          </button>
        </div>
        {p.links.map(link => (
          <div key={link.id} className="flex gap-2 items-center">
            <input
              value={link.label}
              onChange={e => updateLink(link.id, 'label', e.target.value)}
              placeholder="Etiqueta"
              className="border border-gray-200 rounded-md px-2 py-1 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={link.url}
              onChange={e => updateLink(link.id, 'url', e.target.value)}
              placeholder="https://…"
              className="border border-gray-200 rounded-md px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeLink(link.id)}
              className="text-gray-400 hover:text-red-500 text-sm font-bold"
              title="Eliminar enlace"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

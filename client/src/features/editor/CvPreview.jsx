import { useCv } from '../../context/CvContext.jsx';

// Placeholder para WS4 — será reemplazado por el CvRenderer de plantillas
export default function CvPreview() {
  const { cv } = useCv();
  const p = cv.personal;
  const s = cv.sections;

  const sectionLabels = {
    summary: 'Resumen',
    experience: 'Experiencia',
    education: 'Formación',
    skills: 'Habilidades',
    languages: 'Idiomas',
    projects: 'Proyectos',
    certifications: 'Certificaciones',
    interests: 'Intereses',
  };

  const levelLabel = ['', 'Básico', 'Elemental', 'Intermedio', 'Avanzado', 'Nativo'];

  return (
    <div
      className="bg-white shadow-sm rounded-lg p-8 text-sm leading-relaxed min-h-[800px]"
      style={{ fontFamily: cv.style.fontFamily, borderTop: `4px solid ${cv.style.accentColor}` }}
    >
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{p.fullName || 'Tu nombre'}</h1>
        {p.headline && <p className="text-gray-600 mt-1">{p.headline}</p>}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.links.map(l => (
            <span key={l.id} style={{ color: cv.style.accentColor }}>{l.label}</span>
          ))}
        </div>
      </div>

      {/* Secciones en el orden de layout.order */}
      {cv.layout.order.map(key => {
        const sec = s[key];
        if (!sec || !sec.visible) return null;

        return (
          <div key={key} className="mb-5">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-2 pb-1 border-b"
              style={{ color: cv.style.accentColor, borderColor: cv.style.accentColor }}
            >
              {sectionLabels[key] || key}
            </h2>

            {key === 'summary' && (
              <p className="text-gray-700">{sec.text}</p>
            )}

            {(key === 'experience' || key === 'education' || key === 'projects') &&
              sec.items.map(item => (
                <div key={item.id} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900">
                      {key === 'experience' ? item.role : key === 'education' ? item.degree : item.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.startDate} — {item.current ? 'Actualidad' : (item.endDate || '')}
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs">
                    {key === 'experience' && `${item.company}${item.location ? ` · ${item.location}` : ''}`}
                    {key === 'education' && `${item.institution}${item.field ? ` · ${item.field}` : ''}`}
                    {key === 'projects' && item.description}
                  </div>
                  {item.bullets && item.bullets.length > 0 && (
                    <ul className="mt-1 ml-3 list-disc text-gray-700 space-y-0.5">
                      {item.bullets.map(b => <li key={b.id}>{b.text}</li>)}
                    </ul>
                  )}
                </div>
              ))
            }

            {key === 'skills' && (
              <div className="flex flex-wrap gap-1.5">
                {sec.items.map(item => (
                  <span key={item.id} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                    {item.name}
                  </span>
                ))}
              </div>
            )}

            {key === 'languages' && (
              <div className="flex flex-wrap gap-4">
                {sec.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <div
                          key={n}
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: n <= item.level ? cv.style.accentColor : '#e5e7eb' }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{levelLabel[item.level]}</span>
                  </div>
                ))}
              </div>
            )}

            {key === 'certifications' && (
              <div className="flex flex-col gap-1">
                {sec.items.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-700">
                    <span>{item.name} — <span className="text-gray-500">{item.issuer}</span></span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                ))}
              </div>
            )}

            {key === 'interests' && (
              <div className="flex flex-wrap gap-1.5">
                {sec.items.map((item, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{item}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

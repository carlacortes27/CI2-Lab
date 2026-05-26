import { useCv } from '../../context/CvContext.jsx';
import { Field, SectionCard } from './FormControls.jsx';

const technicalGroups = [
  ['lenguajes', 'Lenguajes'],
  ['software', 'Software'],
  ['herramientas', 'Herramientas'],
  ['tecnologias', 'Tecnologias'],
];

export default function SkillsForm() {
  const { cv, dispatch } = useCv();
  const technical = cv.sections.technicalSkills?.groups || {};
  const personal = cv.sections.personalSkills?.items || [];

  function updateTechnical(key, value) {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: {
        section: 'technicalSkills',
        data: { groups: { ...technical, [key]: value.split(',').map(item => item.trim()).filter(Boolean) } },
      },
    });
  }

  function updatePersonal(value) {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { section: 'personalSkills', data: { items: value.split(',').map(item => item.trim()).filter(Boolean) } },
    });
  }

  return (
    <>
      <SectionCard title="Competencias técnicas">
        <div className="form-grid two">
          {technicalGroups.map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={(technical[key] || []).join(', ')}
              onChange={value => updateTechnical(key, value)}
              placeholder="Python, SQL, React"
            />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Competencias personales">
        <Field
          label="Competencias separadas por coma"
          value={personal.join(', ')}
          onChange={updatePersonal}
          placeholder="liderazgo, adaptacion, proactividad, comunicacion"
        />
      </SectionCard>
    </>
  );
}

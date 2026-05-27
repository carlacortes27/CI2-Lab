import { useCv } from '../../../context/CvContext.jsx';
import { aboutMeStatus } from '../../../utils/validators.js';
import { SectionCard, TextArea } from './FormControls.jsx';

export default function AboutMeForm() {
  const { cv, dispatch } = useCv();
  const text = cv.sections.summary?.text || '';
  const status = aboutMeStatus(text);

  return (
    <SectionCard title="Sobre mí">
      <TextArea
        label="Sobre mí"
        value={text}
        maxLength={status.max}
        rows={4}
        placeholder="Resume quién eres, qué estudias y qué tipo de oportunidad buscas."
        onChange={value => dispatch({ type: 'UPDATE_SUMMARY', payload: value })}
      />
      <div className={status.remaining < 40 ? 'char-counter warning' : 'char-counter'}>
        {status.length}/{status.max} caracteres. Máximo recomendado: 4 líneas.
      </div>
    </SectionCard>
  );
}

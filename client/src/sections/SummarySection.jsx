import { useCv } from '../context/CvContext.jsx';
import TextAreaField from '../components/TextAreaField.jsx';

export default function SummarySection() {
  const { cv, dispatch } = useCv();
  return (
    <TextAreaField
      label="Resumen profesional"
      value={cv.sections.summary.text}
      onChange={text => dispatch({ type: 'UPDATE_SUMMARY', payload: text })}
      rows={4}
      placeholder="Describe tu perfil en 2-4 frases…"
    />
  );
}

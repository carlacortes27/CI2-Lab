import { useCv } from '../../../context/CvContext.jsx';
import { isValidEmail, isValidPhone } from '../../../utils/validators.js';
import { Field, Select, SectionCard } from './FormControls.jsx';

const countries = ['+34', '+44', '+1', '+49', '+33', '+39', '+351'];
const photoTemplates = new Set(['moderna', 'profesional']);

export default function PersonalInfoForm() {
  const { cv, dispatch } = useCv();
  const p = cv.personal;
  const showPhoto = photoTemplates.has(cv.style?.template);
  const emailError = p.email && !isValidEmail(p.email) ? 'Email no válido' : '';
  const phoneError = p.phoneNumber && !isValidPhone(p.phoneNumber) ? 'Teléfono no válido' : '';

  function update(data) {
    const next = { ...p, ...data };
    next.phone = `${next.phoneCountry || ''} ${next.phoneNumber || ''}`.trim();
    dispatch({ type: 'UPDATE_PERSONAL', payload: next });
  }

  function updateLink(label, url) {
    const rest = (p.links || []).filter(link => link.label !== label);
    dispatch({ type: 'UPDATE_PERSONAL', payload: { links: [...rest, { id: label.toLowerCase(), label, url }] } });
  }

  function updatePhoto(file) {
    if (!file) return;
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      window.alert('La foto debe ser un archivo .jpg');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => dispatch({ type: 'UPDATE_PERSONAL', payload: { photoUrl: reader.result } });
    reader.readAsDataURL(file);
  }

  return (
    <SectionCard title="Datos personales">
      <div className="form-grid two">
        <Field label="Nombre completo" value={p.fullName} onChange={fullName => update({ fullName })} />
        <Field label="Ubicación" value={p.location} onChange={location => update({ location })} />
        <Field label="Email personal" value={p.email} onChange={email => update({ email })} type="email" error={emailError} />
        <div className="phone-row">
          <Select label="País" value={p.phoneCountry || ''} onChange={phoneCountry => update({ phoneCountry })}>
            <option value="">Selecciona</option>
            {countries.map(country => <option key={country}>{country}</option>)}
          </Select>
          <Field label="Teléfono" value={p.phoneNumber || p.phone?.replace(/^\+\d+\s*/, '')} onChange={phoneNumber => update({ phoneNumber })} error={phoneError} />
        </div>
        <Field
          label="LinkedIn"
          value={(p.links || []).find(link => link.label === 'LinkedIn')?.url}
          onChange={url => updateLink('LinkedIn', url)}
        />
        {showPhoto && (
          <label className="form-field">
            <span>Foto JPG (plantilla con imagen)</span>
            <input type="file" accept="image/jpeg,.jpg" onChange={event => updatePhoto(event.target.files?.[0])} />
          </label>
        )}
      </div>
    </SectionCard>
  );
}

import { useCv } from '../../context/CvContext.jsx';
import { isValidEmail, isValidPhone } from '../../utils/validators.js';
import { Field, Select, SectionCard } from './FormControls.jsx';

const countries = ['+34', '+44', '+1', '+49', '+33', '+39', '+351'];

export default function PersonalInfoForm() {
  const { cv, dispatch } = useCv();
  const p = cv.personal;
  const emailError = p.email && !isValidEmail(p.email) ? 'Email no valido' : '';
  const phoneError = p.phoneNumber && !isValidPhone(p.phoneNumber) ? 'Telefono no valido' : '';

  function update(data) {
    const next = { ...p, ...data };
    next.phone = `${next.phoneCountry || '+34'} ${next.phoneNumber || ''}`.trim();
    dispatch({ type: 'UPDATE_PERSONAL', payload: next });
  }

  function updateLink(label, url) {
    const rest = p.links.filter(link => link.label !== label);
    dispatch({ type: 'UPDATE_PERSONAL', payload: { links: [...rest, { id: label.toLowerCase(), label, url }] } });
  }

  return (
    <SectionCard title="Datos personales">
      <div className="form-grid two">
        <Field label="Nombre completo" value={p.fullName} onChange={fullName => update({ fullName })} />
        <Field label="Ubicacion" value={p.location} onChange={location => update({ location })} />
        <Field label="Email personal" value={p.email} onChange={email => update({ email })} type="email" error={emailError} />
        <div className="phone-row">
          <Select label="Pais" value={p.phoneCountry || '+34'} onChange={phoneCountry => update({ phoneCountry })}>
            {countries.map(country => <option key={country}>{country}</option>)}
          </Select>
          <Field label="Telefono" value={p.phoneNumber || p.phone?.replace(/^\+\d+\s*/, '')} onChange={phoneNumber => update({ phoneNumber })} error={phoneError} />
        </div>
        <Field
          label="LinkedIn"
          value={p.links.find(link => link.label === 'LinkedIn')?.url}
          onChange={url => updateLink('LinkedIn', url)}
        />
        <Field
          label="GitHub o portfolio"
          value={p.links.find(link => link.label === 'GitHub')?.url || p.links.find(link => link.label === 'Portfolio')?.url}
          onChange={url => updateLink('GitHub', url)}
        />
      </div>
    </SectionCard>
  );
}

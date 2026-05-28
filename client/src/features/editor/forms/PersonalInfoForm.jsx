import { useCv } from '../../../context/CvContext.jsx';
import { isValidEmail, isValidPhone } from '../../../utils/validators.js';
import { Field, Select, SectionCard } from './FormControls.jsx';

const countries = ['+34', '+44', '+1', '+49', '+33', '+39', '+351'];
const acceptedPhotoTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxPhotoSizeMb = 2;

export default function PersonalInfoForm() {
  const { cv, dispatch } = useCv();
  const p = cv.personal;
  const emailError = p.email && !isValidEmail(p.email) ? 'Email no valido' : '';
  const phoneError = p.phoneNumber && !isValidPhone(p.phoneNumber) ? 'Telefono no valido' : '';

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
    if (!acceptedPhotoTypes.includes(file.type)) {
      window.alert('La imagen debe ser JPG, PNG o WebP');
      return;
    }
    if (file.size > maxPhotoSizeMb * 1024 * 1024) {
      window.alert(`La imagen no puede superar ${maxPhotoSizeMb} MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => dispatch({ type: 'UPDATE_PERSONAL', payload: { photoUrl: reader.result } });
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    dispatch({ type: 'UPDATE_PERSONAL', payload: { photoUrl: '' } });
  }

  return (
    <SectionCard title="Datos personales">
      <div className="form-grid two">
        <Field label="Nombre completo" value={p.fullName} onChange={fullName => update({ fullName })} />
        <Field label="Ubicacion" value={p.location} onChange={location => update({ location })} />
        <Field label="Email personal" value={p.email} onChange={email => update({ email })} type="email" error={emailError} />
        <div className="phone-row">
          <Select label="Pais" value={p.phoneCountry || ''} onChange={phoneCountry => update({ phoneCountry })}>
            <option value="">Selecciona</option>
            {countries.map(country => <option key={country}>{country}</option>)}
          </Select>
          <Field label="Telefono" value={p.phoneNumber || p.phone?.replace(/^\+\d+\s*/, '')} onChange={phoneNumber => update({ phoneNumber })} error={phoneError} />
        </div>
        <Field
          label="LinkedIn"
          value={(p.links || []).find(link => link.label === 'LinkedIn')?.url}
          onChange={url => updateLink('LinkedIn', url)}
        />
        <div className="form-field photo-field">
          <span>Imagen de perfil</span>
          <div className="photo-upload-row">
            <div className="photo-upload-preview">
              {p.photoUrl ? (
                <img src={p.photoUrl} alt="Vista previa de la imagen de perfil" />
              ) : (
                <span>{initials(p.fullName)}</span>
              )}
            </div>
            <div className="photo-upload-controls">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                onChange={event => updatePhoto(event.target.files?.[0])}
              />
              {p.photoUrl && (
                <button type="button" className="outline-button" onClick={removePhoto}>
                  Quitar imagen
                </button>
              )}
            </div>
          </div>
          <small className="field-hint">JPG, PNG o WebP. Maximo 2 MB.</small>
        </div>
      </div>
    </SectionCard>
  );
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'CV';
}

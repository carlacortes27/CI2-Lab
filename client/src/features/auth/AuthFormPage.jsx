import { useState } from 'react';
import { useAuth } from '../../context/useAuth.js';

export default function AuthFormPage({ mode = 'login', onNavigate }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function validate() {
    if (isRegister && !form.name.trim()) return 'El nombre es obligatorio';
    if (!form.email.trim()) return 'El email es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Introduce un email valido';
    if (!form.password) return 'La contrasena es obligatoria';
    if (isRegister && form.password.length < 6) return 'La contrasena debe tener al menos 6 caracteres';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (isRegister) {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        await login({
          email: form.email.trim(),
          password: form.password,
        });
      }
      onNavigate('home');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">CV Comillas</p>
        <h1>{isRegister ? 'Crear cuenta' : 'Iniciar sesion'}</h1>
        <p>
          {isRegister
            ? 'Registra tus datos para guardar tu perfil en la base H2.'
            : 'Accede con tu email y contrasena para continuar.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="form-field">
              <span>Nombre</span>
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                maxLength={100}
                autoComplete="name"
              />
            </label>
          )}

          <label className="form-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
            />
          </label>

          <label className="form-field">
            <span>Contrasena</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="primary-button full" disabled={submitting}>
            {submitting ? 'Guardando...' : isRegister ? 'Registrarse' : 'Iniciar sesion'}
          </button>
        </form>

        <button
          type="button"
          className="auth-switch"
          onClick={() => onNavigate(isRegister ? 'login' : 'register')}
        >
          {isRegister ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
        </button>
      </section>
    </main>
  );
}

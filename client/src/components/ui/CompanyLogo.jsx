/**
 * CompanyLogo.jsx — Logo de empresa
 *
 * Recuadro 64×64px (o tamaño configurable), fondo blanco, borde #E5E7EB, radius 12px.
 * Si hay logo real (src o mapa interno): mostrar imagen centrada.
 * Si no (o si la imagen falla): iniciales en color corporativo sobre fondo blanco.
 *
 * PROHIBIDO: círculos de color con iniciales.
 */
import { useState } from 'react';
import { T, brandColor, initials } from '../../styles/theme.js';

// Mapa de nombre de empresa → dominio para Clearbit Logo API
const COMPANY_DOMAINS = {
  'mckinsey':            'mckinsey.com',
  'mckinsey & company':  'mckinsey.com',
  'iberdrola':           'iberdrola.com',
  'deloitte':            'deloitte.com',
  'ferrovial':           'ferrovial.com',
  'banco santander':     'santander.com',
  'santander':           'santander.com',
  'telefónica':          'telefonica.com',
  'telefonica':          'telefonica.com',
  'kpmg':                'kpmg.com',
  'repsol':              'repsol.com',
  'bcg':                 'bcg.com',
  'boston consulting':   'bcg.com',
  'indra':               'indracompany.com',
  'bbva':                'bbva.com',
  'acciona':             'acciona.com',
  'caixabank':           'caixabank.com',
  'amazon web services': 'amazonaws.com',
  'aws':                 'amazonaws.com',
  'amazon':              'amazon.com',
  'ey':                  'ey.com',
  'ernst & young':       'ey.com',
  'endesa':              'endesa.com',
  'google':              'google.com',
  'airbus':              'airbus.com',
  'accenture':           'accenture.com',
  'acs':                 'grupoacs.com',
  'siemens':             'siemens.com',
  'schneider electric':  'se.com',
  'schneider':           'se.com',
  'aura':                'aura-energy.com',
};

function getLogoUrl(company) {
  const key = company.trim().toLowerCase();
  const domain = COMPANY_DOMAINS[key];
  return domain ? `https://logo.clearbit.com/${domain}` : null;
}

export default function CompanyLogo({
  src,
  company = '',
  size = 64,
  style,
}) {
  const logoUrl = src || getLogoUrl(company);
  const color   = brandColor(company);
  const inits   = initials(company);
  const [imgFailed, setImgFailed] = useState(false);

  const base = {
    width:           size,
    height:          size,
    minWidth:        size,
    backgroundColor: T.white,
    border:          `1px solid ${T.border}`,
    borderRadius:    T.radiusInput,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    overflow:        'hidden',
    ...style,
  };

  if (logoUrl && !imgFailed) {
    return (
      <div style={base}>
        <img
          src={logoUrl}
          alt={company}
          style={{ width: '72%', height: '72%', objectFit: 'contain' }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div style={base}>
      <span style={{
        fontSize:   size * 0.25,
        fontWeight: 700,
        color,
        fontFamily: T.font,
        userSelect: 'none',
        lineHeight: 1,
      }}>
        {inits}
      </span>
    </div>
  );
}

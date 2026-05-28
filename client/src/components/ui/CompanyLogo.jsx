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

// URLs directas de logos desde Wikimedia Commons (fuente pública, no bloqueada)
const COMPANY_LOGOS = {
  'mckinsey & company':  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/McKinsey_and_Company.png/320px-McKinsey_and_Company.png',
  'mckinsey':            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/McKinsey_and_Company.png/320px-McKinsey_and_Company.png',
  'iberdrola':           'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Iberdrola_logo.svg/320px-Iberdrola_logo.svg.png',
  'deloitte':            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Deloitte.svg/320px-Deloitte.svg.png',
  'ferrovial':           'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Ferrovial_logo.svg/320px-Ferrovial_logo.svg.png',
  'banco santander':     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Logo_Santander_Isologotype.svg/320px-Logo_Santander_Isologotype.svg.png',
  'santander':           'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Logo_Santander_Isologotype.svg/320px-Logo_Santander_Isologotype.svg.png',
  'telefónica':          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Telefonicalogo.svg/320px-Telefonicalogo.svg.png',
  'telefonica':          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Telefonicalogo.svg/320px-Telefonicalogo.svg.png',
  'kpmg':                'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/KPMG_logo.svg/320px-KPMG_logo.svg.png',
  'repsol':              'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Repsol_logo.svg/320px-Repsol_logo.svg.png',
  'bcg':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/BCG-logo.svg/320px-BCG-logo.svg.png',
  'indra':               'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Indra_Sistemas_logo.svg/320px-Indra_Sistemas_logo.svg.png',
  'bbva':                'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/BBVA_2019.svg/320px-BBVA_2019.svg.png',
  'acciona':             'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Acciona_logo.svg/320px-Acciona_logo.svg.png',
  'caixabank':           'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/CaixaBank_logo.svg/320px-CaixaBank_logo.svg.png',
  'amazon web services': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/320px-Amazon_Web_Services_Logo.svg.png',
  'aws':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/320px-Amazon_Web_Services_Logo.svg.png',
  'ey':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/EY_logo_2019.svg/320px-EY_logo_2019.svg.png',
  'ernst & young':       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/EY_logo_2019.svg/320px-EY_logo_2019.svg.png',
  'endesa':              'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Endesa_logo.svg/320px-Endesa_logo.svg.png',
  'google':              'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/320px-Google_2015_logo.svg.png',
  'airbus':              'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Airbus_Logo_2017.png/320px-Airbus_Logo_2017.png',
  'accenture':           'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/320px-Accenture.svg.png',
  'acs':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Logotipo_ACS.svg/320px-Logotipo_ACS.svg.png',
  'siemens':             'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Siemens-logo.svg/320px-Siemens-logo.svg.png',
  'schneider electric':  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Schneider_Electric_2007.svg/320px-Schneider_Electric_2007.svg.png',
  'schneider':           'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Schneider_Electric_2007.svg/320px-Schneider_Electric_2007.svg.png',
};

function getLogoUrl(company) {
  const key = company.trim().toLowerCase();
  return COMPANY_LOGOS[key] || null;
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

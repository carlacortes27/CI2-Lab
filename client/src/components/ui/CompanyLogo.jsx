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

// URLs directas de logos desde Wikimedia Commons verificadas (fuente pública, no bloqueada)
const COMPANY_LOGOS = {
  'mckinsey & company':  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/McKinsey_Script_Mark_2019.svg/250px-McKinsey_Script_Mark_2019.svg.png',
  'mckinsey':            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/McKinsey_Script_Mark_2019.svg/250px-McKinsey_Script_Mark_2019.svg.png',
  'iberdrola':           'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Logo_Iberdrola_%282023%29.svg/250px-Logo_Iberdrola_%282023%29.svg.png',
  'deloitte':            'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_Deloitte.svg/250px-Logo_of_Deloitte.svg.png',
  'ferrovial':           'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Ferrovial_Logo.svg/250px-Ferrovial_Logo.svg.png',
  'banco santander':     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/250px-Banco_Santander_Logotipo.svg.png',
  'santander':           'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/250px-Banco_Santander_Logotipo.svg.png',
  'telefónica':          'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Telef%C3%B3nica_2021_logo.svg/250px-Telef%C3%B3nica_2021_logo.svg.png',
  'telefonica':          'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Telef%C3%B3nica_2021_logo.svg/250px-Telef%C3%B3nica_2021_logo.svg.png',
  'kpmg':                'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/KPMG_blue_logo.svg/250px-KPMG_blue_logo.svg.png',
  'repsol':              'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Repsol_2025.svg/250px-Repsol_2025.svg.png',
  'bcg':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/BCG_Corporate_Logo.svg/250px-BCG_Corporate_Logo.svg.png',
  'boston consulting group': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/BCG_Corporate_Logo.svg/250px-BCG_Corporate_Logo.svg.png',
  'indra':               'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Indra-Sistemas-Logo.svg/250px-Indra-Sistemas-Logo.svg.png',
  'bbva':                'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/BBVA_logo_2025.svg/250px-BBVA_logo_2025.svg.png',
  'acciona':             'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Acciona_logo.svg/250px-Acciona_logo.svg.png',
  'caixabank':           'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/CaixaBank_logo.svg/250px-CaixaBank_logo.svg.png',
  'amazon web services': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Amazon_Web_Services_2025.svg/250px-Amazon_Web_Services_2025.svg.png',
  'aws':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Amazon_Web_Services_2025.svg/250px-Amazon_Web_Services_2025.svg.png',
  'ey':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/EY_logo_2019.svg/250px-EY_logo_2019.svg.png',
  'ernst & young':       'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/EY_logo_2019.svg/250px-EY_logo_2019.svg.png',
  'endesa':              'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Endesa.svg/250px-Endesa.svg.png',
  'google':              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Google_2026_logo.svg/330px-Google_2026_logo.svg.png',
  'airbus':              'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Airbus_Logo_2017.svg/250px-Airbus_Logo_2017.svg.png',
  'accenture':           'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/250px-Accenture.svg.png',
  'acs':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Logo_Grupo_ACS.svg/250px-Logo_Grupo_ACS.svg.png',
  'grupo acs':           'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Logo_Grupo_ACS.svg/250px-Logo_Grupo_ACS.svg.png',
  'siemens':             'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Siemens_AG_logo.svg/250px-Siemens_AG_logo.svg.png',
  'schneider electric':  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Schneider_Electric_2007.svg/250px-Schneider_Electric_2007.svg.png',
  'schneider':           'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Schneider_Electric_2007.svg/250px-Schneider_Electric_2007.svg.png',
  'naturgy':             'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Naturgy.svg/250px-Naturgy.svg.png',
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

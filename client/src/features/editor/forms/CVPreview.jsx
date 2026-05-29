import { useCv } from '../../../context/CvContext.jsx';

const labelsByLang = {
  es: {
    summary:        'Sobre mí',
    education:      'Educación',
    experience:     'Experiencia laboral',
    projects:       'Proyectos destacados',
    technicalSkills:'Competencias técnicas',
    personalSkills: 'Competencias personales',
    languages:      'Idiomas',
    certifications: 'Certificaciones',
    volunteering:   'Voluntariados',
  },
  en: {
    summary:        'About me',
    education:      'Education',
    experience:     'Work experience',
    projects:       'Projects',
    technicalSkills:'Technical skills',
    personalSkills: 'Personal skills',
    languages:      'Languages',
    certifications: 'Certifications',
    volunteering:   'Volunteering',
  },
};

export default function CVPreview({ editable = false, selectedBlockId = '', onSelectBlock }) {
  const { cv, dispatch } = useCv();
  const p = cv.personal;
  const s = cv.sections;
  const accent = cv.style.accentColor;
  const showPhoto = Boolean(p.photoUrl);
  const labels = labelsByLang[cv.meta?.language] || labelsByLang.es;

  return (
    <article
      className={`cv-sheet template-${cv.style.template} font-${cv.style.fontSize || 'medium'}`}
      style={{ '--accent': accent, fontFamily: cv.style.fontFamily }}
    >
      <header className="cv-head">
        {showPhoto ? <img className="cv-photo" src={p.photoUrl} alt="" /> : <div className="cv-avatar">{initials(p.fullName)}</div>}
        <div>
          <h1>{p.fullName || 'Nombre completo'}</h1>
          {p.headline && <p>{p.headline}</p>}
          <div className="cv-contact">
            {[p.phone, p.email, p.location, ...(p.links || []).filter(link => link.url && link.label !== 'GitHub').map(link => link.url)]
              .filter(Boolean)
              .map(item => <span key={item}>{item}</span>)}
          </div>
        </div>
      </header>

      {cv.layout.order.map(key => {
        if (!s[key]?.visible) return null;
        if (!sectionHasContent(key, s[key])) return null;
        return (
          <PreviewSection
            key={key}
            sectionKey={key}
            data={s[key]}
            labels={labels}
            blockStyles={cv.style?.blockStyles || {}}
            editable={editable}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            dispatch={dispatch}
          />
        );
      })}
    </article>
  );
}

function PreviewSection({ sectionKey, data, labels, blockStyles, editable, selectedBlockId, onSelectBlock, dispatch }) {
  return (
    <section className="cv-section">
      <h2>{labels[sectionKey]}</h2>
      {sectionKey === 'summary' && (
        <EditableText
          as="p"
          className="cv-summary"
          blockId="summary"
          editable={editable}
          selected={selectedBlockId === 'summary'}
          onSelectBlock={onSelectBlock}
          style={textStyle(blockStyles.summary)}
          onCommit={value => dispatch({ type: 'UPDATE_SUMMARY', payload: value })}
        >
          {data.text}
        </EditableText>
      )}
      {sectionKey === 'education' && data.items.filter(item => itemHasContent(item, ['degree', 'institution', 'location', 'duration', 'startDate', 'endDate'])).map(item => <TimelineItem key={item.id} sectionKey={sectionKey} item={item} title={item.degree} titleField="degree" subtitle={`${item.institution}${item.location ? ` | ${item.location}` : ''}`} date={item.duration || dateRange(item)} bullets={item.bullets} blockStyles={blockStyles} editable={editable} selectedBlockId={selectedBlockId} onSelectBlock={onSelectBlock} dispatch={dispatch} />)}
      {sectionKey === 'experience' && data.items.filter(item => itemHasContent(item, ['role', 'company', 'duration', 'startDate', 'endDate'])).map(item => <TimelineItem key={item.id} sectionKey={sectionKey} item={item} title={item.role} titleField="role" subtitle={item.company} date={item.duration || dateRange(item)} bullets={item.bullets} blockStyles={blockStyles} editable={editable} selectedBlockId={selectedBlockId} onSelectBlock={onSelectBlock} dispatch={dispatch} />)}
      {sectionKey === 'projects' && data.items.filter(item => itemHasContent(item, ['name', 'description', 'technologies', 'link'])).map(item => <TimelineItem key={item.id} sectionKey={sectionKey} item={item} title={item.name} titleField="name" subtitle={[item.description, item.technologies].filter(Boolean).join(' | ')} date={item.link} bullets={item.bullets} blockStyles={blockStyles} editable={editable} selectedBlockId={selectedBlockId} onSelectBlock={onSelectBlock} dispatch={dispatch} />)}
      {sectionKey === 'technicalSkills' && <SkillBullets groups={data.groups} />}
      {sectionKey === 'personalSkills' && <BulletList items={data.items} />}
      {sectionKey === 'languages' && (
        <div className="cv-list-grid">
          {data.items.filter(item => itemHasContent(item, ['name', 'level', 'certificate', 'note'])).map(item => <span key={item.id}>{item.name && <strong>{item.name}</strong>} {item.level}{item.certificate ? ` | ${item.certificate}` : ''}{item.note ? ` | ${item.note}` : ''}</span>)}
        </div>
      )}
      {sectionKey === 'certifications' && data.items.filter(item => itemHasContent(item, ['name', 'issuer', 'level', 'date'])).map(item => (
        <div className="cv-line" key={item.id}>
          {item.name && (
            <EditableText
              as="strong"
              blockId={`certifications:${item.id}:name`}
              editable={editable}
              selected={selectedBlockId === `certifications:${item.id}:name`}
              onSelectBlock={onSelectBlock}
              style={textStyle(blockStyles[`certifications:${item.id}:name`])}
              onCommit={value => dispatch({ type: 'UPDATE_ITEM', payload: { section: 'certifications', id: item.id, data: { name: value } } })}
            >
              {item.name}
            </EditableText>
          )}
          <span>{[item.issuer, item.level, item.date].filter(Boolean).join(' | ')}</span>
        </div>
      ))}
      {sectionKey === 'volunteering' && data.items.filter(item => itemHasContent(item, ['organization', 'date', 'description'])).map(item => <div className="cv-line" key={item.id}>{item.organization && <strong>{item.organization}</strong>}<EditableText as="span" blockId={`volunteering:${item.id}:description`} editable={editable} selected={selectedBlockId === `volunteering:${item.id}:description`} onSelectBlock={onSelectBlock} style={textStyle(blockStyles[`volunteering:${item.id}:description`])} onCommit={value => dispatch({ type: 'UPDATE_ITEM', payload: { section: 'volunteering', id: item.id, data: { description: value } } })}>{[item.date, item.description].filter(Boolean).join(' | ')}</EditableText></div>)}
    </section>
  );
}

function TimelineItem({ sectionKey, item, title, titleField, subtitle, date, bullets = [], blockStyles, editable, selectedBlockId, onSelectBlock, dispatch }) {
  const titleBlockId = `${sectionKey}:${item.id}:${titleField}`;
  return (
    <div className="cv-item">
      <div className="cv-item-top">
        {title && (
          <EditableText
            as="strong"
            blockId={titleBlockId}
            editable={editable}
            selected={selectedBlockId === titleBlockId}
            onSelectBlock={onSelectBlock}
            style={textStyle(blockStyles[titleBlockId])}
            onCommit={value => dispatch({ type: 'UPDATE_ITEM', payload: { section: sectionKey, id: item.id, data: { [titleField]: value } } })}
          >
            {title}
          </EditableText>
        )}
        {date && <span>{date}</span>}
      </div>
      {subtitle && <p className="cv-subtitle">{subtitle}</p>}
      {bullets?.length > 0 && (
        <ul>
          {bullets.filter(bullet => bullet.text).map(bullet => (
            <EditableText
              key={bullet.id}
              as="li"
              blockId={`${sectionKey}:${item.id}:bullet:${bullet.id}`}
              editable={editable}
              selected={selectedBlockId === `${sectionKey}:${item.id}:bullet:${bullet.id}`}
              onSelectBlock={onSelectBlock}
              style={textStyle(blockStyles[`${sectionKey}:${item.id}:bullet:${bullet.id}`])}
              onCommit={value => dispatch({ type: 'UPDATE_BULLET', payload: { section: sectionKey, itemId: item.id, bulletId: bullet.id, text: value } })}
            >
              {bullet.text}
            </EditableText>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkillBullets({ groups = {} }) {
  const allSkills = Object.values(groups).flat().filter(Boolean);
  return (
    <ul className="cv-skill-bullets">
      {allSkills.map(skill => <li key={skill}>{skill}</li>)}
    </ul>
  );
}

function BulletList({ items = [] }) {
  return (
    <ul className="cv-skill-bullets">
      {items.filter(Boolean).map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'CV';
}

function dateRange(item) {
  return [item.startDate, item.current ? 'Actualidad' : item.endDate].filter(Boolean).join(' - ');
}

function EditableText({ as: Component, blockId, editable, selected, onSelectBlock, onCommit, children, className = '', style }) {
  if (!editable) {
    return <Component className={className} style={style}>{children}</Component>;
  }

  return (
    <Component
      className={`${className} cv-editable-text ${selected ? 'selected' : ''}`.trim()}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onClick={event => {
        event.stopPropagation();
        onSelectBlock?.(blockId);
      }}
      onFocus={() => onSelectBlock?.(blockId)}
      onBlur={event => onCommit(event.currentTarget.innerText)}
    >
      {children}
    </Component>
  );
}

function sectionHasContent(sectionKey, data) {
  if (!data?.visible) return false;
  if (sectionKey === 'summary') return hasText(data.text);
  if (sectionKey === 'technicalSkills') return Object.values(data.groups || {}).some(group => group.some(hasText));
  if (sectionKey === 'personalSkills') return (data.items || []).some(hasText);
  if (sectionKey === 'skills') return (data.items || []).some(item => itemHasContent(item, ['name', 'category']));
  if (sectionKey === 'interests') return (data.items || []).some(hasText);
  if (sectionKey === 'languages') return (data.items || []).some(item => itemHasContent(item, ['name', 'level', 'certificate', 'note']));
  if (sectionKey === 'certifications') return (data.items || []).some(item => itemHasContent(item, ['name', 'issuer', 'level', 'date']));
  if (sectionKey === 'volunteering') return (data.items || []).some(item => itemHasContent(item, ['organization', 'date', 'description']));
  if (sectionKey === 'education') return (data.items || []).some(item => itemHasContent(item, ['degree', 'institution', 'location', 'duration', 'startDate', 'endDate']));
  if (sectionKey === 'experience') return (data.items || []).some(item => itemHasContent(item, ['role', 'company', 'duration', 'startDate', 'endDate']));
  if (sectionKey === 'projects') return (data.items || []).some(item => itemHasContent(item, ['name', 'description', 'technologies', 'link']));
  return hasNestedContent(data);
}

function itemHasContent(item, fields) {
  return fields.some(field => hasText(item?.[field])) || (item?.bullets || []).some(bullet => hasText(bullet.text));
}

function hasText(value) {
  return String(value || '').trim().length > 0;
}

function hasNestedContent(value) {
  if (Array.isArray(value)) return value.some(hasNestedContent);
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => !['id', 'visible'].includes(key))
      .some(([, entry]) => hasNestedContent(entry));
  }
  if (typeof value === 'boolean') return false;
  return hasText(value);
}

function textStyle(style = {}) {
  const result = {};
  if (style.fontFamily) result.fontFamily = style.fontFamily;
  if (style.fontSize) {
    result.fontSize = `${style.fontSize}px`;
    result.lineHeight = 1.35;
  }
  if (style.fontWeight) result.fontWeight = style.fontWeight;
  if (style.fontStyle) result.fontStyle = style.fontStyle;
  return result;
}

import { useState, useRef } from 'react';
import { useCv } from '../../context/CvContext.jsx';
import PersonalSection from '../../sections/PersonalSection.jsx';
import SummarySection from '../../sections/SummarySection.jsx';
import ExperienceSection from '../../sections/ExperienceSection.jsx';
import EducationSection from '../../sections/EducationSection.jsx';
import SkillsSection from '../../sections/SkillsSection.jsx';
import LanguagesSection from '../../sections/LanguagesSection.jsx';
import ProjectsSection from '../../sections/ProjectsSection.jsx';
import CertificationsSection from '../../sections/CertificationsSection.jsx';
import InterestsSection from '../../sections/InterestsSection.jsx';

const SECTION_COMPONENTS = {
  summary: SummarySection,
  experience: ExperienceSection,
  education: EducationSection,
  skills: SkillsSection,
  languages: LanguagesSection,
  projects: ProjectsSection,
  certifications: CertificationsSection,
  interests: InterestsSection,
};

const SECTION_LABELS = {
  summary: 'Resumen',
  experience: 'Experiencia',
  education: 'Formación',
  skills: 'Habilidades',
  languages: 'Idiomas',
  projects: 'Proyectos',
  certifications: 'Certificaciones',
  interests: 'Intereses',
};

export default function EditorForm() {
  const { cv, dispatch } = useCv();
  const [openSections, setOpenSections] = useState(new Set(cv.layout.order));
  const [draggedSection, setDraggedSection] = useState(null);
  const dragOverRef = useRef(null);

  function toggleSection(key) {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleVisibility(e, key) {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_SECTION_VISIBILITY', payload: { section: key } });
  }

  // Drag & drop de secciones
  function onDragStart(e, key) {
    setDraggedSection(key);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e, key) {
    e.preventDefault();
    dragOverRef.current = key;
  }

  function onDrop(e) {
    e.preventDefault();
    if (!draggedSection || !dragOverRef.current || draggedSection === dragOverRef.current) {
      setDraggedSection(null);
      return;
    }
    const order = [...cv.layout.order];
    const fromIdx = order.indexOf(draggedSection);
    const toIdx = order.indexOf(dragOverRef.current);
    order.splice(fromIdx, 1);
    order.splice(toIdx, 0, draggedSection);
    dispatch({ type: 'REORDER_SECTIONS', payload: order });
    setDraggedSection(null);
    dragOverRef.current = null;
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      {/* Datos personales — siempre visible, no reordenable */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('personal')}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-800">Datos personales</span>
          <span className="text-gray-400 text-sm">{openSections.has('personal') ? '▲' : '▼'}</span>
        </button>
        {openSections.has('personal') && (
          <div className="px-4 pb-4">
            <PersonalSection />
          </div>
        )}
      </div>

      {/* Secciones reordenables */}
      {cv.layout.order.map(key => {
        const Component = SECTION_COMPONENTS[key];
        if (!Component) return null;
        const visible = cv.sections[key]?.visible ?? true;
        const isOpen = openSections.has(key);
        const isDragging = draggedSection === key;

        return (
          <div
            key={key}
            draggable
            onDragStart={e => onDragStart(e, key)}
            onDragOver={e => onDragOver(e, key)}
            onDrop={onDrop}
            className={`bg-white rounded-lg border overflow-hidden transition-opacity ${
              isDragging ? 'opacity-50 border-blue-400' : 'border-gray-200'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection(key)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-xs select-none">⠿</span>
                <span className={`font-medium ${visible ? 'text-gray-800' : 'text-gray-400'}`}>
                  {SECTION_LABELS[key] || key}
                </span>
                {!visible && <span className="text-xs text-gray-400">(oculta)</span>}
              </div>
              <div className="flex items-center gap-2">
                <span
                  title={visible ? 'Ocultar sección' : 'Mostrar sección'}
                  onClick={e => toggleVisibility(e, key)}
                  className="text-gray-400 hover:text-blue-500 text-xs select-none px-1"
                >
                  {visible ? '👁' : '🚫'}
                </span>
                <span className="text-gray-400 text-sm">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <Component />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

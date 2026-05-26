import EditorForm from './EditorForm.jsx';
import CvPreview from './CvPreview.jsx';
import { useCv } from '../../context/CvContext.jsx';

export default function EditorPage() {
  const { cv } = useCv();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="font-bold text-blue-700 text-lg">cvComillas</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">{cv.personal.fullName || 'Mi CV'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Guardado automáticamente</span>
          <span className="w-2 h-2 rounded-full bg-green-400" title="Autoguardado activo" />
        </div>
      </header>

      {/* Layout de dos paneles */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Panel izquierdo: formulario */}
        <div className="w-96 min-w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto px-4">
          <EditorForm />
        </div>

        {/* Panel derecho: preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="max-w-2xl mx-auto">
            <CvPreview />
          </div>
        </div>
      </div>
    </div>
  );
}

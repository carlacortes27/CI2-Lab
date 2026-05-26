import { useState } from 'react';
import { CvProvider } from './context/CvContext.jsx';
import EditorPage from './features/editor/EditorPage.jsx';
import OpePortalPage from './pages/OpePortalPage.jsx';

export default function App() {
  const [page, setPage] = useState('editor'); // 'editor' | 'ope'

  return (
    <CvProvider>
      {page === 'editor' && (
        <EditorPage onNavigateToOpe={() => setPage('ope')} />
      )}
      {page === 'ope' && (
        <OpePortalPage onNavigateToEditor={() => setPage('editor')} />
      )}
    </CvProvider>
  );
}

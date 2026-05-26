import { CvProvider } from './context/CvContext.jsx';
import EditorPage from './features/editor/EditorPage.jsx';

export default function App() {
  return (
    <CvProvider>
      <EditorPage />
    </CvProvider>
  );
}

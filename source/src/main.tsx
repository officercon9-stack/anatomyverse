import { createRoot } from 'react-dom/client';
import './styles/app.css';
import { AnatomyViewer } from './viewer/AnatomyViewer';

// temporary harness: just the 3D viewer, until the app shell is rebuilt
createRoot(document.getElementById('root')!).render(<AnatomyViewer className="h-screen w-screen" />);

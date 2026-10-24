// @ts-nocheck
import { useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { AnatomyViewer } from './AnatomyViewer';
import { Link } from 'react-router-dom';

export function ViewerPreview() {
  useEffect(() => {
    let e = setTimeout(() => {
      let e = useViewerStore.getState();
      e.setLayerVisible('muscles', false);
      e.setView('oblique');
      e.select('heart');
    }, 300);
    return () => {
      clearTimeout(e);
      useViewerStore.getState().resetAll();
    };
  }, []);
  return (
    <div className="relative h-full">
      <AnatomyViewer className="h-full w-full" minimal ariaLabel="Interactive preview of the 3D anatomy model" />
      <Link to="/app/lab" className="av-btn av-btn--primary av-btn--sm absolute bottom-3 right-3 z-10">
        Open in the lab
      </Link>
    </div>
  );
}

import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import WindowCanvasNavigationControls from '../containers/WindowCanvasNavigationControls';
import GlobalStyles from '@mui/material/GlobalStyles';
import globalWindowViewerStyles from '../styles/window-viewer-component';
const OSDViewer = lazy(() => import('../containers/OpenSeadragonViewer'));
/**
 * Represents a WindowViewer in the mirador workspace. Responsible for mounting
 * OSD and Navigation
 */
export function WindowViewer({ windowId }) {
  return (
    <>
    <GlobalStyles styles={{ ...globalWindowViewerStyles }} />
    <ErrorBoundary fallback={null}>
      <Suspense fallback={<div />}>
      <div className='viewer-wrap'>
        <WindowCanvasNavigationControls windowId={windowId} />
        <OSDViewer windowId={windowId}></OSDViewer>
      </div>
      </Suspense>
    </ErrorBoundary>
    </>
  );
}

WindowViewer.propTypes = {
  windowId: PropTypes.string.isRequired,
};

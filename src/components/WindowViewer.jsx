import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import WindowCanvasNavigationControls from '../containers/WindowCanvasNavigationControls';
import GlobalStyles from '@mui/material/GlobalStyles';
import globalWindowViewerStyles from '../styles/window-viewer-component';
import {
  Mosaic
} from 'react-mosaic-component2';
const GalleryView = lazy(() => import('../containers/GalleryView'));
const OSDViewer = lazy(() => import('../containers/OpenSeadragonViewer'));

const StyledMosaic = styled(Mosaic)({
  height: "calc(100% - 4em)",

  '& .mosaic-preview': {
    boxShadow: 'none',
  },
  '& .mosaic-tile': {
    boxShadow: 'none',
  },
  '& .mosaic-window': {
    boxShadow: 'none',
    borderRadius: '4px'
  },
  '& .mosaic-window-toolbar': {
    display: 'none !important',
  },
  '& .mosaic-root .mosaic-tile:first-of-type' : {
    inset: "0% calc(100% - (100% - 130px)) 0% 0%"
  },
  '& .mosaic-root .mosaic-tile:nth-of-type(2)' : {
    inset: "0% calc(100% - 130px) 0% 0%"
  }
  // mosaic tile 1 .mosaic-tile "calc(100% - (100% - 100px))", - inset: 0% 5% 0% 0%;
  // mosaic tile 2 .mosaic-tile "calc(100% - (100% - 100px))", - inset: 50% 0% 0% 95%;
  // .mosaic-split .-column - inset: 50% 0% 0% 95%;
});
/**
 * Represents a WindowViewer in the mirador workspace. Responsible for mounting
 * OSD and Navigation
 */
export function WindowViewer({ windowId }) {

  const ELEMENT_MAP = {
    a: <OSDViewer windowId={windowId}></OSDViewer>,
    b: <GalleryView windowId={windowId}/>
  };

  return (
    <>
    <GlobalStyles styles={{ ...globalWindowViewerStyles }} />
    <ErrorBoundary fallback={null}>
      <Suspense fallback={<div />}>
      <div className="viewer-mosaic" style={{width: '100%'}}>
        <WindowCanvasNavigationControls windowId={windowId} />
        <StyledMosaic
         renderTile={(id) => ELEMENT_MAP[id]}
         initialValue={{
           direction: 'row',
           first: 'a',
           second: 'b',
         }}
         resize={{
          minimumPaneSizePercentage: 1
         }}
        />
      </div>
      </Suspense>
    </ErrorBoundary>
    </>
  );
}

WindowViewer.propTypes = {
  windowId: PropTypes.string.isRequired,
};

import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import classNames from 'classnames';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import { useElementSize } from '@custom-react-hooks/use-element-size';
import mergeRefs from 'merge-refs';
import ViewerInfo from '../containers/ViewerInfo';
import ViewerNavigation from '../containers/ViewerNavigation';
import ns from '../config/css-ns';
import { PluginHook } from './PluginHook';

const Root = styled(Paper, { name: 'WindowCanvasNavigationControls', slot: 'root' })(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  bottom: 0,
  cursor: 'default',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  position: 'absolute',
  textAlign: 'left',
  width: '100%',
  height: '54px',
  paddingLeft: '1rem',
  border: `none`,
  borderRadius: "7px",
  boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)"
}));

/**
 * Represents the viewer controls in the mirador workspace.
 */
export const WindowCanvasNavigationControls = forwardRef(({ //showZoomControls = false, zoomToWorld,
   visible = true, windowId,  ...rest
}, ref) => {
  const [sizeRef, size] = useElementSize();

  const pluginProps = { //showZoomControls, 
    size, visible, windowId, ...rest,
  };
  /**
   * Determine if canvasNavControls are stacked (based on a hard-coded width)
  */
  const canvasNavControlsAreStacked = (size && size.width && size.width <= 253);

  if (!visible) return (<Typography style={visuallyHidden} component='div'><ViewerInfo windowId={windowId} /></Typography>);

  return (
    <Root
      square
      className={
        classNames(
          ns('canvas-nav'),
          canvasNavControlsAreStacked ? ns('canvas-nav-stacked') : null,
        )
      }
      elevation={0}
      ref={mergeRefs(ref, sizeRef)}
    >
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}>
        <Stack
          direction={canvasNavControlsAreStacked ? 'column' : 'row'}
          divider={<Divider orientation={canvasNavControlsAreStacked ? 'horizontal' : 'vertical'} variant='middle' flexItem />}
          spacing={0}
        >
          <ViewerNavigation windowId={windowId} />
        </Stack>
        <ViewerInfo windowId={windowId} />
        <PluginHook {...pluginProps} />
      </div>
    </Root>
  );
});

WindowCanvasNavigationControls.propTypes = {
  showZoomControls: PropTypes.bool,
  visible: PropTypes.bool,
  windowId: PropTypes.string.isRequired,
  zoomToWorld: PropTypes.func.isRequired,
};

WindowCanvasNavigationControls.defaultProps = {
  showZoomControls: false,
  visible: true,
};

WindowCanvasNavigationControls.displayName = 'WindowCanvasNavigationControls';

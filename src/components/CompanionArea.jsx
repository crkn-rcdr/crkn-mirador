import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Slide from '@mui/material/Slide';
import classNames from 'classnames';
import CompanionWindowFactory from '../containers/CompanionWindowFactory';
import ns from '../config/css-ns';

const Root = styled('div', { name: 'CompanionArea', slot: 'root' })(({ ownerState, theme }) => ({
  display: 'flex',
  minHeight: 0,
  position: 'relative',
  zIndex: theme.zIndex.appBar - 2,
  ...((ownerState.position === 'bottom' || ownerState.position === 'far-bottom') && {
    flexDirection: 'column',
    width: '100%',
  }),
}));

const Container = styled('div', { name: 'CompanionArea', slot: 'container' })(({ ownerState }) => ({
  display: ownerState?.companionAreaOpen ? 'flex' : 'none',
  ...((ownerState?.position === 'bottom' || ownerState?.position === 'far-bottom') && {
    flexDirection: 'column',
    width: '100%',
  }),
  ...((ownerState?.position === 'left' && (ownerState?.companionWindowIds && ownerState.companionWindowIds.length > 0)) && {
    minWidth: '235px',
  }),
}));

/** */
export function CompanionArea({
  classes = {}, className = undefined, direction,
  companionWindowIds, companionAreaOpen, setCompanionAreaOpen = () => {},
  position, sideBarOpen = false, windowId,
}) {
  /** */
  const areaLayoutClass = (position === 'bottom' || position === 'far-bottom') ? classes.horizontal : null;

  /** */
  const slideDirection = (() => {
    const defaultPosition = direction === 'rtl' ? 'left' : 'right';
    const oppositePosition = direction === 'rtl' ? 'right' : 'left';

    switch (position) {
      case 'right':
      case 'far-right':
        return oppositePosition;
      case 'bottom':
      case 'far-bottom':
        return 'up';
      default:
        return defaultPosition;
    }
  })();

  const rootClasses = classNames(areaLayoutClass, ns(`companion-area-${position}`), className);
  const ownerState = arguments[0]; // eslint-disable-line prefer-rest-params

  return (
    <Root ownerState={ownerState} className={rootClasses}>
      <Slide in={companionAreaOpen} direction={slideDirection}>
        <Container
          ownerState={ownerState}
          className={`${ns('companion-windows')}`}
        >
          {companionWindowIds.map((id) => (
            <CompanionWindowFactory id={id} key={id} windowId={windowId} />
          ))}
        </Container>
      </Slide>
    </Root>
  );
}

CompanionArea.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string),
  className: PropTypes.string,
  companionAreaOpen: PropTypes.bool.isRequired,
  companionWindowIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  direction: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired,
  setCompanionAreaOpen: PropTypes.func,
  sideBarOpen: PropTypes.bool,
  windowId: PropTypes.string.isRequired,
};

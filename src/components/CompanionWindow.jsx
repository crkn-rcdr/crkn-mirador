/* eslint-disable react/require-default-props */
import { Children, cloneElement, forwardRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
// Removed unused MUI icon imports; Bootstrap icons are used elsewhere as needed
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { Rnd } from 'react-rnd';
import { useElementSize } from '@custom-react-hooks/use-element-size';
import mergeRefs from 'merge-refs';
import MiradorMenuButton from '../containers/MiradorMenuButton';
import ns from '../config/css-ns';
import LocaleContext from '../contexts/LocaleContext';
import { getCompanionWindowLocale } from '../state/selectors/companionWindows';

const Root = styled(Paper, { name: 'CompanionWindow', slot: 'root' })({});
const StyledToolbar = styled(Toolbar, { name: 'CompanionWindow', slot: 'toolbar' })({
  background: "#ffffff !important",
  borderBottom: "1px solid #eee"
});
const StyledTitle = styled(Typography, { name: 'CompanionWindow', slot: 'title' })({});
const StyledTitleControls = styled('div', { name: 'CompanionWindow', slot: 'controls' })({});
const Contents = styled(Paper, { name: 'CompanionWindow', slot: 'contents' })({});
const StyledRnd = styled(Rnd, { name: 'CompanionWindow', slot: 'resize' })({});
const StyledPositionButton = styled(MiradorMenuButton, { name: 'CompanionWindow', slot: 'positionButton' })({});
const StyledCloseButton = styled(MiradorMenuButton, { name: 'CompanionWindow', slot: 'closeButton' })({});

/**
 * CompanionWindow
 */
export const CompanionWindow = forwardRef((props, innerRef) => {
  const {
    ariaLabel = undefined, classes = {}, direction, id, paperClassName = '', onCloseClick = () => {}, updateCompanionWindow = undefined, isDisplayed = false,
    content = null,
    position = null, title = null, children = undefined, titleControls = null,
    defaultSidebarPanelWidth = 235, defaultSidebarPanelHeight = 201,
  } = props;
  const [sizeRef, size] = useElementSize();
  const { t } = useTranslation();
  const locale = useSelector(state => getCompanionWindowLocale(state, { companionWindowId: id }), [id]);
  const isMobile = useMediaQuery('(max-width:600px)');
  const isCompactWidth = useMediaQuery('(max-width:1100px)');
  const isMobileLeft = isMobile && position === 'left';
  const isMobileThumbnail = isMobile && content === 'thumbnailNavigation';
  const isBottom = (position === 'bottom' || position === 'far-bottom');
  const isCompactBottomThumbnail = isBottom && content === 'thumbnailNavigation' && isCompactWidth;
  const isMobileResizableDisabled = isMobileLeft || isMobileThumbnail || isCompactBottomThumbnail;
  const compactBottomThumbnailHeight = 150;
  const resolvedSidebarPanelHeight = isCompactBottomThumbnail
    ? Math.min(defaultSidebarPanelHeight, compactBottomThumbnailHeight)
    : defaultSidebarPanelHeight;

  /** */
  const openInNewStyle = direction === 'rtl' ? { transform: 'scale(-1, 1)' } : {};

  /** */
  const resizeHandles = (() => {
    const positions = {
      ltr: {
        default: 'left',
        opposite: 'right',
      },
      rtl: {
        default: 'right',
        opposite: 'left',
      },
    };

    const base = {
      bottom: false,
      bottomLeft: false,
      bottomRight: false,
      left: false,
      right: false,
      top: false,
      topLeft: false,
      topRight: false,
    };

    if (position === 'right' || position === 'far-right') {
      return { ...base, [positions[direction].default]: true };
    }

    if (position === 'left') {
      return { ...base, [positions[direction].opposite]: true };
    }

    if (position === 'bottom' || position === 'far-bottom') {
      return { ...base, top: true };
    }

    return base;
  })();

  const childrenWithAdditionalProps = Children.map(children, (child) => {
    if (!child) return null;
    return cloneElement(
      child,
      {
        parentactions: {
          closeCompanionWindow: onCloseClick,
        },
      },
    );
  });

  return (
    <Root
      ownerState={props}
      ref={mergeRefs(innerRef, sizeRef)}
      style={{
        display: isDisplayed ? null : 'none',
        marginRight: isMobileLeft ? 0 : undefined,
        maxWidth: isMobileLeft ? '100%' : undefined,
        order: position === 'left' ? -1 : null,
        width: isMobileLeft ? '100%' : undefined,
      }}
      className={[ns(`companion-window-${position}`), paperClassName, position === 'bottom' ? classes.horizontal : classes.vertical].join(' ')}
      square
      component="aside"
      aria-label={ariaLabel || title}
    >
      <LocaleContext.Provider value={locale}>
        <StyledRnd
          style={{ display: 'inherit', position: 'inherit' }}
          ownerState={props}
          default={{
            height: isBottom ? resolvedSidebarPanelHeight : '100%',
            width: isBottom ? 'auto' : (isMobileLeft ? '100%' : defaultSidebarPanelWidth),
          }}
          disableDragging
          enableResizing={isMobileResizableDisabled ? {
            bottom: false,
            bottomLeft: false,
            bottomRight: false,
            left: false,
            right: false,
            top: false,
            topLeft: false,
            topRight: false,
          } : resizeHandles}
          minHeight={50}
          minWidth={isMobileLeft ? '100%' : (position === 'left' ? 235 : 100)}
        >

          <StyledToolbar
            variant="dense"
            className={[ns('companion-window-header'), size.width < 370 ? 'test' : null].join(' ')}
            disableGutters
          >
            <StyledTitle style={{padding: "12px 0"}}variant="h3">{title}</StyledTitle>
            
            {
              titleControls && (
                <StyledTitleControls
                  ownerState={{ position }}
                  sx={{
                    order: isBottom || size.width < 370 ? 'unset' : 1000,
                  }}
                  className={ns('companion-window-title-controls')}
                >
                  {titleControls}
                </StyledTitleControls>
              )
            }
          </StyledToolbar>
          <Contents
            className={ns('scrollto-scrollable')}
            elevation={0}
          >
            {childrenWithAdditionalProps}
          </Contents>
        </StyledRnd>
      </LocaleContext.Provider>
    </Root>
  );
});

CompanionWindow.propTypes = {
  ariaLabel: PropTypes.string,
  children: PropTypes.node,
  classes: PropTypes.objectOf(PropTypes.string),
  content: PropTypes.string,
  defaultSidebarPanelHeight: PropTypes.number,
  defaultSidebarPanelWidth: PropTypes.number,
  direction: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  isDisplayed: PropTypes.bool,
  onCloseClick: PropTypes.func,
  paperClassName: PropTypes.string,
  position: PropTypes.string,
  size: PropTypes.shape({ width: PropTypes.number }),
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  titleControls: PropTypes.node,
  updateCompanionWindow: PropTypes.func,
};

CompanionWindow.displayName = 'CompanionWindow';

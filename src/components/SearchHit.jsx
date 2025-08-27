import { useEffect, useId, useMemo } from 'react';
import { useEffectEvent } from 'use-effect-event';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import SanitizedHtml from '../containers/SanitizedHtml';
import TruncatedHit from '../lib/TruncatedHit';
import { ScrollTo } from './ScrollTo';

const Root = styled(ListItem)(({ ownerState, theme }) => ({
  '&.Mui-focused': {
    '&:hover': {
      ...(ownerState.windowSelected && { backgroundColor: 'inherit' }),
    },
    ...(ownerState.windowSelected && { backgroundColor: 'inherit' }),
  },
  paddingRight: theme.spacing(1),
}));

const CanvasLabel = styled('h4')(({ theme }) => ({
  display: 'inline',
  marginBottom: theme.spacing(1.5),
}));

const Counter = styled(Chip)(({ ownerState, theme }) => ({
  backgroundColor: theme.palette.hitCounter.default,
  ...(ownerState.windowSelected && { backgroundColor: theme.palette.highlights.primary }),
  ...(ownerState.adjacent && !ownerState.windowSelected && {
    backgroundColor: theme.palette.highlights.secondary,
  }),
  height: 30,
  marginRight: theme.spacing(1),
  typography: 'subtitle2',
  verticalAlign: 'inherit',
}));

export function SearchHit({
  annotation,
  annotationId,
  annotationLabel,
  announcer,
  canvasLabel,
  containerRef,
  hit,
  index,
  selectAnnotation,
  showDetails,
  focused,
  selected,
  windowSelected,
  adjacent,
  viewer,
  canvases,
  setCanvas,
}) {
  const { t } = useTranslation();

  const truncatedHit = useMemo(() => (hit && new TruncatedHit(hit, annotation)), [hit, annotation]);
  const canvasLabelHtmlId = useId();

  const announceHit = useEffectEvent(() => {
    if (!announcer || !truncatedHit) return;
    announcer(
      [
        t('pagination', { current: index + 1, total: truncatedHit?.total }),
        canvasLabel,
        annotationLabel,
        truncatedHit.before,
        truncatedHit.match,
        truncatedHit.after,
      ].join(' '),
      'polite'
    );
  });

  useEffect(() => {
    if (selected) announceHit();
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = () => {
    if (!annotation?.targetId) return;

    const canvasId = annotation.targetId.split('#')[0];
    const pageIndex = canvases.findIndex(c => c.id === canvasId);
    if (pageIndex < 0) return;

    // Update Redux state first
    setCanvas(canvasId);

    // Select the annotation
    if (annotation.id) selectAnnotation(annotation.id);

    // Jump OpenSeadragon safely
    if (viewer) {
      const osdItem = viewer.world?.getItemAt(pageIndex);
      if (osdItem) {
        // Image is loaded, go directly
        viewer.goToPage(pageIndex);
      } else {
        // Image not yet loaded, wait for it
        viewer.addOnceHandler('open', () => viewer.goToPage(pageIndex));
      }
    }
  };


  if (focused && !selected) return null;

  const renderedHit = focused ? hit : hit && truncatedHit;
  const truncated = hit && (renderedHit.before !== hit.before || renderedHit.after !== hit.after);
  const ownerState = { adjacent, focused, selected, windowSelected };

  const header = (
    <>
      <Counter component="span" ownerState={ownerState} label={index + 1} />
      <CanvasLabel id={canvasLabelHtmlId}>
        {canvasLabel}
        {annotationLabel && (
          <Typography component="span" sx={{ display: 'block', marginTop: 1 }}>
            {annotationLabel}
          </Typography>
        )}
      </CanvasLabel>
    </>
  );

  return (
    <ScrollTo containerRef={containerRef} offsetTop={96} scrollTo={windowSelected && !focused}>
      <Root
        ownerState={ownerState}
        className={windowSelected ? 'windowSelected' : ''}
        divider
        component={selected ? 'li' : ListItemButton}
        onClick={handleClick}
        selected={selected}
      >
        <ListItemText
          primary={header}
          primaryTypographyProps={{ component: 'div', sx: { marginBottom: 1 }, variant: 'subtitle2' }}
          secondaryTypographyProps={{ variant: 'body1' }}
          secondary={
            <>
              {hit && (
                <>
                  <SanitizedHtml ruleSet="iiif" htmlString={renderedHit.before} />{' '}
                  <strong>
                    <SanitizedHtml ruleSet="iiif" htmlString={renderedHit.match} />
                  </strong>{' '}
                  <SanitizedHtml ruleSet="iiif" htmlString={renderedHit.after} />{' '}
                  {truncated && !focused && (
                    <Button
                      sx={{ '& span': { lineHeight: '1.5em' }, margin: 0, padding: 0, textTransform: 'none' }}
                      onClick={showDetails}
                      color="secondary"
                      size="small"
                      aria-describedby={canvasLabelHtmlId}
                    >
                      {t('more')}
                    </Button>
                  )}
                </>
              )}
              {!hit && annotation && <SanitizedHtml ruleSet="iiif" htmlString={annotation.chars} />}
            </>
          }
        />
      </Root>
    </ScrollTo>
  );
}

SearchHit.propTypes = {
  annotation: PropTypes.object,
  annotationId: PropTypes.string,
  annotationLabel: PropTypes.string,
  announcer: PropTypes.func,
  canvasLabel: PropTypes.string,
  containerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  hit: PropTypes.object,
  index: PropTypes.number,
  selectAnnotation: PropTypes.func.isRequired,
  showDetails: PropTypes.func,
  focused: PropTypes.bool,
  selected: PropTypes.bool,
  windowSelected: PropTypes.bool,
  adjacent: PropTypes.bool,
  viewer: PropTypes.object,
  canvases: PropTypes.arrayOf(PropTypes.object),
  setCanvas: PropTypes.func.isRequired,
};

export default SearchHit;

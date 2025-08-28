import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ns from '../config/css-ns';

const StyledOsdInfo = styled('div')(() => ({
  overflow: 'hidden',
  paddingBottom: 0.5,
  textOverflow: 'ellipsis',
  unicodeBidi: 'plaintext',
  whiteSpace: 'nowrap'
}));

/**
 *
 */
export function ViewerInfo({
  canvasCount,
  canvasIndex,
  canvasLabel = undefined,
}) {
  const { t } = useTranslation();
  return (
    <StyledOsdInfo className={classNames(ns('osd-info'))}>
      <Typography display="inline" variant="caption" className={classNames(ns('canvas-count'))}>
        {` / ${canvasCount}`}
      </Typography>
    </StyledOsdInfo>
  );
}

ViewerInfo.propTypes = {
  canvasCount: PropTypes.number.isRequired,
  canvasIndex: PropTypes.number.isRequired,
  canvasLabel: PropTypes.string,
};

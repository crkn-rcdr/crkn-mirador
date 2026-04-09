import {
  useMemo, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { useInView } from 'react-intersection-observer';
import { IIIFResourceLabel } from './IIIFResourceLabel';
import { useThumbnailService } from '../hooks';

const Root = styled('div', { name: 'IIIFThumbnail', slot: 'root' })({});

const Label = styled('span', { name: 'IIIFThumbnail', slot: 'label' })(({ theme }) => ({
  ...theme.typography.caption,
}));

const Image = styled('img', { name: 'IIIFThumbnail', slot: 'image' })(() => ({
  display: 'block',
  height: 'auto',
  objectFit: 'contain',
  objectPosition: 'center',
  width: 'auto',
}));

/**
 * A lazy-loaded image that uses IntersectionObserver to determine when to
 * try to load the image (or even calculate that the image url/height/width are)
 */
const LazyLoadedImage = ({
  border = false, placeholder, style = {}, thumbnail = null,
  resource,
  maxHeight = null,
  maxWidth = null,
  requestMaxHeight = null,
  requestMaxWidth = null,
  preferFullRes = false,
  ...props
}) => {
  const { ref, inView } = useInView();
  const [loaded, setLoaded] = useState(false);
  const [requestFailureLevel, setRequestFailureLevel] = useState(0);
  const requestDivisor = 2 ** requestFailureLevel;
  const effectiveRequestMaxHeight = (requestMaxHeight ?? maxHeight)
    ? Math.max(120, Math.round((requestMaxHeight ?? maxHeight) / requestDivisor))
    : null;
  const effectiveRequestMaxWidth = (requestMaxWidth ?? maxWidth)
    ? Math.max(120, Math.round((requestMaxWidth ?? maxWidth) / requestDivisor))
    : null;
  const effectivePreferFullRes = preferFullRes && requestFailureLevel === 0;
  const thumbnailService = useThumbnailService(
    effectiveRequestMaxHeight,
    effectiveRequestMaxWidth,
    effectivePreferFullRes,
  );

  useEffect(() => {
    setRequestFailureLevel(0);
  }, [resource?.id, thumbnail?.url, requestMaxHeight, requestMaxWidth, preferFullRes]);
  /**
   * Handles the intersection (visibility) of a given thumbnail, by requesting
   * the image and then updating the state.
   */
  useEffect(() => {
    if (loaded || !inView) return;

    setLoaded(true);
  }, [inView, loaded]);

  const image = useMemo(() => {
    if (thumbnail) return thumbnail;

    const i = thumbnailService.get(resource);

    if (i && i.url) return i;

    return undefined;
  }, [resource, thumbnail, thumbnailService]);

  const imageStyles = useMemo(() => {
    const styleProps = {
      height: undefined,
      maxHeight: undefined,
      maxWidth: undefined,
      width: undefined,
    };

    if (!image) {
      return {
        ...style,
        maxHeight,
        maxWidth,
      };
    }

    const { height: thumbHeight, width: thumbWidth } = image;
    if (thumbHeight && thumbWidth) {
      const aspectRatio = thumbWidth / thumbHeight;

      if (maxHeight && maxWidth) {
        // Always fit to the requested render box so capped request sizes
        // still occupy the intended thumbnail tile dimensions.
        if ((maxWidth / maxHeight) < aspectRatio) {
          styleProps.height = Math.round(maxWidth / aspectRatio);
          styleProps.width = maxWidth;
        } else {
          styleProps.height = maxHeight;
          styleProps.width = Math.round(maxHeight * aspectRatio);
        }
      } else if ((maxHeight && (thumbHeight > maxHeight)) || (maxWidth && (thumbWidth > maxWidth))) {
        if (maxHeight) {
          styleProps.height = maxHeight;
          styleProps.maxWidth = Math.round(maxHeight * aspectRatio);
        } else if (maxWidth) {
          styleProps.width = maxWidth;
          styleProps.maxHeight = Math.round(maxWidth / aspectRatio);
        }
      } else {
        styleProps.width = thumbWidth;
        styleProps.height = thumbHeight;
      }
    } else if (thumbHeight && !thumbWidth) {
      styleProps.height = maxHeight;
    } else if (!thumbHeight && thumbWidth) {
      styleProps.width = maxWidth;
    } else {
      // The thumbnail wasn't retrieved via an Image API service,
      // and its dimensions are not specified in the JSON-LD
      // (note that this may result in a blurry image).
      // Fit the available thumbnail box so tiny intrinsic images don't
      // collapse to a small corner at large gallery sizes.
      if (maxWidth) styleProps.width = maxWidth;
      if (maxHeight) styleProps.height = maxHeight;
      styleProps.maxWidth = maxWidth;
      styleProps.maxHeight = maxHeight;
      styleProps.objectFit = 'contain';
      styleProps.objectPosition = 'left top';
    }

    return {
      ...styleProps,
      ...style,
    };
  }, [image, maxWidth, maxHeight, style]);

  const { url: src = placeholder } = (loaded && (thumbnail || image)) || {};

  return (
    <Image
      ownerState={{ border }}
      ref={ref}
      alt=""
      role="presentation"
      src={src}
      style={imageStyles}
      onError={() => {
        if (!loaded || thumbnail || requestFailureLevel >= 2) return;
        setRequestFailureLevel(prev => prev + 1);
      }}
      {...props}
    />
  );
};

LazyLoadedImage.propTypes = {
  border: PropTypes.bool,
  maxHeight: PropTypes.number,
  maxWidth: PropTypes.number,
  requestMaxHeight: PropTypes.number,
  requestMaxWidth: PropTypes.number,
  preferFullRes: PropTypes.bool,
  placeholder: PropTypes.string.isRequired,
  resource: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  thumbnail: PropTypes.shape({
    height: PropTypes.number,
    url: PropTypes.string.isRequired,
    width: PropTypes.number,
  }),
};

const defaultPlaceholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mMMDQmtBwADgwF/Op8FmAAAAABJRU5ErkJggg==';

/**
 * Uses InteractionObserver to "lazy" load canvas thumbnails that are in view.
 */
export function IIIFThumbnail({
  border = false,
  children = null,
  imagePlaceholder = defaultPlaceholder,
  label = undefined,
  labelled = false,
  maxHeight = null,
  maxWidth = null,
  requestMaxHeight = null,
  requestMaxWidth = null,
  preferFullRes = false,
  resource,
  style = {},
  thumbnail = null,
}) {
  const ownerState = arguments[0]; // eslint-disable-line prefer-rest-params

  return (
    <Root ownerState={ownerState}>
      <LazyLoadedImage
        placeholder={imagePlaceholder}
        thumbnail={thumbnail}
        resource={resource}
        maxHeight={maxHeight}
        maxWidth={maxWidth}
        requestMaxHeight={requestMaxHeight}
        requestMaxWidth={requestMaxWidth}
        preferFullRes={preferFullRes}
        style={style}
        border={border}
      />

      { labelled && (
        <Label ownerState={ownerState}>
          {label || <IIIFResourceLabel resource={resource} />}
        </Label>
      )}
      {children}
    </Root>
  );
}

IIIFThumbnail.propTypes = {
  border: PropTypes.bool,
  children: PropTypes.node,
  imagePlaceholder: PropTypes.string,
  label: PropTypes.string,
  labelled: PropTypes.bool,
  maxHeight: PropTypes.number,
  maxWidth: PropTypes.number,
  requestMaxHeight: PropTypes.number,
  requestMaxWidth: PropTypes.number,
  preferFullRes: PropTypes.bool,
  resource: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  thumbnail: PropTypes.shape({
    height: PropTypes.number,
    url: PropTypes.string.isRequired,
    width: PropTypes.number,
  }),
  variant: PropTypes.oneOf(['inside', 'outside']), // eslint-disable-line react/no-unused-prop-types
};

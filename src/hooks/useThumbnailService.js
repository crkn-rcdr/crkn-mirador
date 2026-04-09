import { useSelector } from 'react-redux';

import { getThumbnailFactory } from '../state/selectors/thumbnails';

/** */
export default function useThumbnailService(maxHeight, maxWidth, preferFullRes = false) {
  return useSelector(
    (state) => getThumbnailFactory(state, maxHeight, maxWidth, preferFullRes),
    [maxHeight, maxWidth, preferFullRes],
  );
}

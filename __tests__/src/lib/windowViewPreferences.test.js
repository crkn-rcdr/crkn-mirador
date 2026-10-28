import {
  persistWindowDisplayMode,
  persistWindowThumbnailSize,
  readPersistedWindowDisplayMode,
  readPersistedWindowThumbnailSize,
} from '../../../src/lib/windowViewPreferences';

describe('windowViewPreferences', () => {
  const displayModeKey = 'mirador.windowDisplayModePreference';
  const thumbnailSizeKey = 'mirador.windowThumbnailSizePreference';

  beforeEach(() => {
    window.localStorage.removeItem(displayModeKey);
    window.localStorage.removeItem(thumbnailSizeKey);
  });

  describe('display mode preference', () => {
    it('persists and reads split/gallery mode', () => {
      persistWindowDisplayMode('gallery');
      expect(readPersistedWindowDisplayMode()).toEqual('gallery');
    });

    it('ignores invalid values', () => {
      persistWindowDisplayMode('invalid');
      expect(readPersistedWindowDisplayMode()).toBeUndefined();
    });
  });

  describe('thumbnail size preference', () => {
    it('persists and reads thumbnail size', () => {
      persistWindowThumbnailSize('fit');
      expect(readPersistedWindowThumbnailSize()).toEqual('fit');
    });

    it('ignores invalid values', () => {
      persistWindowThumbnailSize('xxl');
      expect(readPersistedWindowThumbnailSize()).toBeUndefined();
    });
  });
});

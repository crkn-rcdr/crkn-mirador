export const OSDReferences = {
  /** */
  get(windowId) {
    return this.refs[windowId];
  },
  refs: {},
  /** */
  set(windowId, ref) {
    if (!ref) {
      delete this.refs[windowId];
      return;
    }

    if (ref.current === undefined) {
      Object.defineProperty(ref, 'current', {
        configurable: true,
        value: ref,
      });
    }

    this.refs[windowId] = ref;
  },
};

const globalWindowViewerStyles = {
  '.mirador-osd-container': {
    height: '100%'
  },
  '.mirador-canvas-nav' : {
    boxSizing: 'border-box'
  },
  '.mirador-canvas-nav + .mirador-osd-container': {
    height: 'calc(100% - 4rem)'
  },
  '.viewer-wrap' : {
    width: '100%'
  },
};
export default globalWindowViewerStyles;
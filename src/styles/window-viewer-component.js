import { borderRadius } from "@mui/system";

const globalWindowViewerStyles = {
  '.mirador-osd-container': {
    height: '100%',
    marginTop: "0.5rem"
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
  
  '.MuiInputBase-sizeSmall' : {
    paddingTop: '1px !important',
    paddingBottom: '1px !important'
  }
};
export default globalWindowViewerStyles;
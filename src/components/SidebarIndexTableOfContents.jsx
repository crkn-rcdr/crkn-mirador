import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import BiIcon from './BiIcon';
import { ScrollTo } from './ScrollTo';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';

const StyledVisibleNode = styled('div')(() => ({
}));

/** */
function getStartCanvasId(node) {
  const jsonld = node.data.__jsonld; // eslint-disable-line no-underscore-dangle
  if (jsonld.startCanvas && typeof jsonld.startCanvas === 'string') {
    return jsonld.startCanvas;
  }
  if (jsonld.start) {
    if (jsonld.start.type === 'Canvas' && typeof jsonld.start.id === 'string') {
      return jsonld.start.id;
    }
    if (jsonld.start.type === 'SpecificResource' && typeof jsonld.start.source === 'string') {
      return jsonld.start.source;
    }
  }
  return node.data.getCanvasIds()[0];
}

/** */
function deepFind(treeNode, id) {
  if (treeNode.id === id) {
    return treeNode;
  }

  let result = null;

  if (treeNode.nodes) {
    for (let i = 0; result == null && i < treeNode.nodes.length; i += 1) {
      result = deepFind(treeNode.nodes[i], id);
    }
  }

  return result;
}

/** */
const ScrollToForTreeItem = ({ children, itemId, ...props }) => (
  <ScrollTo {...props}>
    {children}
  </ScrollTo>
);

ScrollToForTreeItem.propTypes = {
  children: PropTypes.node.isRequired,
  itemId: PropTypes.string.isRequired,
};

/** */
const CollapseIcon = (props) => <BiIcon name="chevron-down" size={16} {...props} />;
/** */
const ExpandIcon = (props) => <BiIcon name="chevron-right" size={16} {...props} />;
/** */
export function SidebarIndexTableOfContents({
  toggleNode, expandNodes, setCanvas, windowId,
  treeStructure, visibleNodeIds, expandedNodeIds, containerRef, nodeIdToScrollTo,
}) {
  /** */
  
  const { t } = useTranslation();

  const handleNodeSelect = (event, itemId) => {
    if (event.key === ' ' || event.key === 'Spacebar') {
      toggleNode(itemId);
    }

    selectTreeItem(itemId);
  };

  /** */
  const handleNodeToggle = (_event, itemIds) => {
    expandNodes(itemIds);
  };

  /** */
  const selectTreeItem = (itemId) => {
    const node = deepFind(treeStructure, itemId);

    // Do not select if there are no canvases listed or it has children
    if (!node.data.getCanvasIds()
        || node.data.getCanvasIds().length === 0
        || node.nodes.length > 0) {
      return;
    }
    const target = getStartCanvasId(node);
    const canvasId = target.indexOf('#') === -1 ? target : target.substr(0, target.indexOf('#'));
    setCanvas(windowId, canvasId);
  };

  if (!treeStructure) {
    return null;
  }

  const getRenderNodes = () => {
    if (!treeStructure || !Array.isArray(treeStructure.nodes)) return [];
    if (
      treeStructure.nodes.length === 1 &&
      treeStructure.nodes[0].nodes &&
      treeStructure.nodes[0].nodes.length > 0
    ) {
      const singleNode = treeStructure.nodes[0];
      const label = (singleNode.label || '').trim().toLowerCase();
      const tocTitle = (t('tableOfContents') || '').trim().toLowerCase();
      if (
        label === 'table of contents' ||
        label === 'table des matières' ||
        label === 'table des matieres' ||
        label === 'contents' ||
        label === 'sommaire' ||
        label === tocTitle
      ) {
        return singleNode.nodes;
      }
    }
    return treeStructure.nodes;
  };

  const nodesToRender = getRenderNodes();

  /** */
  const renderTree = (node) => (
    <ScrollToForTreeItem
      containerRef={containerRef}
      key={node.id}
      itemId={node.id}
      offsetTop={96}
      scrollTo={nodeIdToScrollTo === node.id}
    >
      <TreeItem
        itemId={node.id}
        label={(
          <StyledVisibleNode>
            {node.label}
          </StyledVisibleNode>
        )}
      >
        {node.nodes && node.nodes.length > 0 ? node.nodes.map(renderTree) : null}
      </TreeItem>
    </ScrollToForTreeItem>
  );

  return (
    <SimpleTreeView
      sx={{ flexGrow: 1 }}
      slots={{
        collapseIcon: CollapseIcon,
        endIcon: null,
        expandIcon: ExpandIcon,
      }}
      onSelectedItemsChange={handleNodeSelect}
      onExpandedItemsChange={handleNodeToggle}
      expandedItems={expandedNodeIds}
    >
      {Array.isArray(nodesToRender) && nodesToRender.length > 0
        ? nodesToRender.map(n => renderTree(n))
        : <Alert severity="error">{t('noTableOfContents')}</Alert>}
    </SimpleTreeView>
  );
}

SidebarIndexTableOfContents.propTypes = {
  containerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
  expandedNodeIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  expandNodes: PropTypes.func.isRequired,
  nodeIdToScrollTo: PropTypes.string.isRequired,
  setCanvas: PropTypes.func.isRequired,
  toggleNode: PropTypes.func.isRequired,
  treeStructure: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    nodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      nodes: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    })),
  }).isRequired,
  visibleNodeIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  windowId: PropTypes.string.isRequired,
};

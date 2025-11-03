import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import HighScoreNode from './nodes/HighScoreNode';
import LowScoreNode from './nodes/LowScoreNode';
import { debounce } from 'lodash';
const nodeTypes = {
    highScoreNode: HighScoreNode,
    lowScoreNode: LowScoreNode,
};
const GraphView = () => {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeDrag, isLoading, setSelectedUser, users, } = useStore();
    // Debounce node drag to avoid excessive history saves
    const debouncedOnNodeDrag = useMemo(() => debounce(() => {
        onNodeDrag();
    }, 300), [onNodeDrag]);
    const handleNodeDrag = useCallback(() => {
        debouncedOnNodeDrag();
    }, [debouncedOnNodeDrag]);
    const onNodeClick = useCallback((_, node) => {
        const user = users.find(u => u.id === node.id);
        if (user) {
            setSelectedUser(user);
        }
    }, [users, setSelectedUser]);
    if (isLoading) {
        return (_jsx("div", { className: "graph-container", style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }, children: _jsx("div", { className: "spinner", "aria-label": "Loading" }) }));
    }
    return (_jsx(ReactFlowProvider, { children: _jsx("div", { className: "graph-container", style: { flex: 1, height: '100vh' }, children: _jsxs(ReactFlow, { nodes: nodes, edges: edges, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onConnect: onConnect, onNodeDrag: handleNodeDrag, onNodeClick: onNodeClick, nodeTypes: nodeTypes, attributionPosition: "bottom-left", children: [_jsx(Background, {}), _jsx(Controls, {}), _jsx(MiniMap, {})] }) }) }));
};
export default GraphView;

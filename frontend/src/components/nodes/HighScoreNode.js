import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useHobbyDrop } from '../../hooks/useHobbyDrop';
import './CustomNode.css';
const HighScoreNode = ({ data }) => {
    const { drop, isOver } = useHobbyDrop(data.id);
    // Calculate node size based on popularity score
    const nodeSize = Math.min(200 + data.popularityScore * 20, 400);
    const intensity = Math.min(data.popularityScore / 10, 1);
    const backgroundColor = `rgba(34, 197, 94, ${0.3 + intensity * 0.4})`; // Green gradient
    const borderColor = `rgba(34, 197, 94, ${0.8 + intensity * 0.2})`;
    return (_jsxs("div", { ref: drop, className: `custom-node high-score-node ${isOver ? 'drop-active' : ''}`, style: {
            width: nodeSize,
            backgroundColor,
            borderColor,
            boxShadow: `0 4px 20px ${borderColor}40`,
            transition: 'all 0.3s ease-in-out',
            ...(isOver && {
                borderColor: '#3b82f6',
                boxShadow: `0 4px 30px rgba(59, 130, 246, 0.5)`,
            }),
        }, children: [_jsx(Handle, { type: "target", position: Position.Top }), _jsxs("div", { className: "node-header", children: [_jsx("div", { className: "node-title", children: data.label }), _jsxs("div", { className: "node-age", children: ["Age: ", data.age] })] }), _jsxs("div", { className: "node-badges", children: [_jsxs("span", { className: "badge badge-popularity", children: ["\u2B50 ", data.popularityScore.toFixed(1)] }), _jsxs("span", { className: "badge badge-friends", children: ["\uD83D\uDC65 ", data.friendCount ?? 0] })] }), _jsxs("div", { className: "node-hobbies", children: [_jsx("div", { className: "hobbies-label", children: "Hobbies:" }), _jsxs("div", { className: "hobbies-list", children: [data.hobbies.length > 0 ? (data.hobbies.slice(0, 3).map((hobby, index) => (_jsx("span", { className: "hobby-tag", children: hobby }, index)))) : (_jsx("span", { className: "no-hobbies", children: "No hobbies" })), data.hobbies.length > 3 && (_jsxs("span", { className: "hobby-tag", children: ["+", data.hobbies.length - 3] }))] })] }), _jsx(Handle, { type: "source", position: Position.Bottom })] }));
};
export default memo(HighScoreNode);

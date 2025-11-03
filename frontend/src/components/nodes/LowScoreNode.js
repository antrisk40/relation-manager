import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useHobbyDrop } from '../../hooks/useHobbyDrop';
import './CustomNode.css';
const LowScoreNode = ({ data }) => {
    const { drop, isOver } = useHobbyDrop(data.id);
    // Calculate node size based on popularity score
    const nodeSize = Math.min(150 + data.popularityScore * 15, 300);
    const intensity = Math.min(data.popularityScore / 5, 1);
    const backgroundColor = `rgba(59, 130, 246, ${0.2 + intensity * 0.3})`; // Blue gradient
    const borderColor = `rgba(59, 130, 246, ${0.6 + intensity * 0.2})`;
    return (_jsxs("div", { ref: drop, className: `custom-node low-score-node ${isOver ? 'drop-active' : ''}`, style: {
            width: nodeSize,
            backgroundColor,
            borderColor,
            boxShadow: `0 2px 10px ${borderColor}30`,
            transition: 'all 0.3s ease-in-out',
            ...(isOver && {
                borderColor: '#3b82f6',
                boxShadow: `0 2px 20px rgba(59, 130, 246, 0.5)`,
            }),
        }, children: [_jsx(Handle, { type: "target", position: Position.Top }), _jsxs("div", { className: "node-header", children: [_jsx("div", { className: "node-title", children: data.label }), _jsxs("div", { className: "node-age", children: ["Age: ", data.age] })] }), _jsxs("div", { className: "node-badges", children: [_jsxs("span", { className: "badge badge-popularity", children: ["\u2B50 ", data.popularityScore.toFixed(1)] }), _jsxs("span", { className: "badge badge-friends", children: ["\uD83D\uDC65 ", data.friendCount ?? 0] })] }), _jsxs("div", { className: "node-popularity", children: [_jsx("span", { className: "popularity-label", children: "Popularity:" }), _jsx("span", { className: "popularity-score", children: data.popularityScore.toFixed(1) })] }), _jsxs("div", { className: "node-hobbies", children: [_jsx("div", { className: "hobbies-label", children: "Hobbies:" }), _jsxs("div", { className: "hobbies-list", children: [data.hobbies.length > 0 ? (data.hobbies.slice(0, 2).map((hobby, index) => (_jsx("span", { className: "hobby-tag", children: hobby }, index)))) : (_jsx("span", { className: "no-hobbies", children: "No hobbies" })), data.hobbies.length > 2 && (_jsxs("span", { className: "hobby-tag", children: ["+", data.hobbies.length - 2] }))] })] }), _jsx(Handle, { type: "source", position: Position.Bottom })] }));
};
export default memo(LowScoreNode);

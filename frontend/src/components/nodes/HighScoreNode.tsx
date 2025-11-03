import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useHobbyDrop } from '../../hooks/useHobbyDrop';
import './CustomNode.css';

interface CustomNodeData {
  label: string;
  age: number;
  hobbies: string[];
  popularityScore: number;
  id: string;
  friendCount?: number;
}

const HighScoreNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const { drop, isOver } = useHobbyDrop(data.id);
  // Calculate node size based on popularity score
  const nodeSize = Math.min(200 + data.popularityScore * 20, 400);
  const intensity = Math.min(data.popularityScore / 10, 1);
  const backgroundColor = `rgba(34, 197, 94, ${0.3 + intensity * 0.4})`; // Green gradient
  const borderColor = `rgba(34, 197, 94, ${0.8 + intensity * 0.2})`;

  return (
    <div
      ref={drop}
      className={`custom-node high-score-node ${isOver ? 'drop-active' : ''}`}
      style={{
        width: nodeSize,
        backgroundColor,
        borderColor,
        boxShadow: `0 4px 20px ${borderColor}40`,
        transition: 'all 0.3s ease-in-out',
        ...(isOver && {
          borderColor: '#3b82f6',
          boxShadow: `0 4px 30px rgba(59, 130, 246, 0.5)`,
        }),
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div className="node-header">
        <div className="node-title">{data.label}</div>
        <div className="node-age">Age: {data.age}</div>
      </div>

      <div className="node-badges">
        <span className="badge badge-popularity">⭐ {data.popularityScore.toFixed(1)}</span>
        <span className="badge badge-friends">👥 {data.friendCount ?? 0}</span>
      </div>
      
      
      
      <div className="node-hobbies">
        <div className="hobbies-label">Hobbies:</div>
        <div className="hobbies-list">
          {data.hobbies.length > 0 ? (
            data.hobbies.slice(0, 3).map((hobby, index) => (
              <span key={index} className="hobby-tag">
                {hobby}
              </span>
            ))
          ) : (
            <span className="no-hobbies">No hobbies</span>
          )}
          {data.hobbies.length > 3 && (
            <span className="hobby-tag">+{data.hobbies.length - 3}</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(HighScoreNode);


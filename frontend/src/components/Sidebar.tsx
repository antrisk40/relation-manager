import React, { useState, useMemo } from 'react';
import { User } from '../types/user';
import { useDrag } from 'react-dnd';
import { useStore } from '../store/useStore';
import './Sidebar.css';

interface DraggableHobbyProps {
  hobby: string;
}

const DraggableHobby: React.FC<DraggableHobbyProps> = ({ hobby }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'hobby',
    item: { hobby },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`hobby-item ${isDragging ? 'dragging' : ''}`}
    >
      {hobby}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { allHobbies, isLoading, users, selectedUser, linkUsers, unlinkUsers, edges, setFilterHobby } = useStore() as any;
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  // no labels anymore

  const filteredHobbies = useMemo<string[]>(() => {
    if (!searchTerm) return allHobbies;
    return allHobbies.filter((hobby: string) =>
      hobby.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allHobbies, searchTerm]);

  if (isCollapsed) {
    return (
      <button
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(false)}
        title="Expand sidebar"
      >
        ▶
      </button>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Hobbies</h2>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(true)}
          title="Collapse sidebar"
        >
          ◀
        </button>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search hobbies..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setFilterHobby(e.target.value);
          }}
          className="search-input"
        />
      </div>

      <div className="sidebar-content">
        {isLoading ? (
          <div className="loading">Loading hobbies...</div>
        ) : filteredHobbies.length > 0 ? (
          <div className="hobbies-list">
            {filteredHobbies.map((hobby: string, index: number) => (
              <DraggableHobby key={`${hobby}-${index}`} hobby={hobby} />
            ))}
          </div>
        ) : (
          <div className="no-hobbies">
            {searchTerm ? 'No hobbies found' : 'No hobbies available'}
          </div>
        )}
      </div>

      {/* Connections manager */}
      <div className="connections">
        <div className="connections-header">
          <h3>Connections</h3>
          <div className="selected-context">
            {selectedUser ? (
              <span>From: <strong>{selectedUser.username}</strong></span>
            ) : (
              <span>Select a user node to manage links</span>
            )}
          </div>
        </div>

        <div className="users-list">
          {users
            .filter((u: User) => !selectedUser || u.id !== selectedUser.id)
            .map((u: User) => (
            <div key={u.id} className="user-row">
              <input
                type="checkbox"
                disabled={!selectedUser}
                checked={!!edges?.some((e: any) => (e.source === selectedUser?.id && e.target === u.id) || (e.source === u.id && e.target === selectedUser?.id))}
                onChange={async (e) => {
                  if (!selectedUser) return;
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    await linkUsers(selectedUser.id, u.id);
                  } else {
                    await unlinkUsers(selectedUser.id, u.id);
                  }
                }}
              />
              <span className="user-name">{u.username}</span>
            </div>
          ))}
        </div>

      </div>

      <div className="sidebar-footer">
        <div className="hobby-count">
          {filteredHobbies.length} {filteredHobbies.length === 1 ? 'hobby' : 'hobbies'}
        </div>
        <div className="sidebar-hint">
          💡 Drag hobbies onto user nodes to add them
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


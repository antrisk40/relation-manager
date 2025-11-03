import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import './Header.css';

const Header: React.FC = () => {
  const { users, edges, selectedUser, linkUsers, unlinkUsers } = useStore() as any;
  const [filter, setFilter] = useState('');

  const list = useMemo(() => {
    return users
      .filter((u: any) => !selectedUser || u.id !== selectedUser.id)
      .filter((u: any) => (filter ? u.username.toLowerCase().includes(filter.toLowerCase()) : true));
  }, [users, selectedUser, filter]);

  return (
    <div className="header-bar">
      <div className="header-left">
        <div className="brand">Cybernauts Network</div>
      </div>
      <div className="header-right">
        <div className="rel-manager">
          <div className="rel-title">Relation Manager</div>
          <div className="rel-context">
            {selectedUser ? (
              <span>From: <strong>{selectedUser.username}</strong></span>
            ) : (
              <span>Select a node to manage links</span>
            )}
          </div>
          <input
            className="rel-search"
            placeholder="Filter users..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="rel-list">
            {list.map((u: any) => {
              const checked = !!edges?.some((e: any) =>
                (e.source === selectedUser?.id && e.target === u.id) ||
                (e.source === u.id && e.target === selectedUser?.id)
              );
              return (
                <label key={u.id} className={`rel-chip ${checked ? 'rel-chip-on' : ''}`}>
                  <input
                    type="checkbox"
                    disabled={!selectedUser}
                    checked={checked}
                    onChange={async (e) => {
                      if (!selectedUser) return;
                      if (e.target.checked) {
                        await linkUsers(selectedUser.id, u.id);
                      } else {
                        await unlinkUsers(selectedUser.id, u.id);
                      }
                    }}
                  />
                  <span className="rel-name">{u.username}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;



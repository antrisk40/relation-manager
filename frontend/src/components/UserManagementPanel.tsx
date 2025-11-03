import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useStore } from '../store/useStore';
import './UserManagementPanel.css';

const UserManagementPanel: React.FC = () => {
  const {
    users,
    selectedUser,
    setSelectedUser,
    createUser,
    updateUser,
    deleteUser,
    addHobbyToUser,
    undo,
    redo,
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    hobbies: [] as string[],
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newHobby, setNewHobby] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'hobby',
    drop: (item: { hobby: string }) => {
      if (selectedUser) {
        addHobbyToUser(selectedUser.id, item.hobby);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        username: selectedUser.username,
        age: selectedUser.age.toString(),
        hobbies: selectedUser.hobbies,
      });
      setEditingUserId(selectedUser.id);
    } else {
      resetForm();
    }
  }, [selectedUser]);

  const resetForm = () => {
    setFormData({
      username: '',
      age: '',
      hobbies: [],
    });
    setEditingUserId(null);
    setNewHobby('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.age) {
      alert('Please fill in all required fields');
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age <= 0) {
      alert('Please enter a valid age');
      return;
    }

    try {
      if (editingUserId) {
        await updateUser(editingUserId, {
          username: formData.username,
          age,
          hobbies: formData.hobbies,
        });
      } else {
        await createUser({
          username: formData.username,
          age,
          hobbies: formData.hobbies,
        });
      }
      resetForm();
      setIsOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deleteUser(confirmDelete);
      setConfirmDelete(null);
      setIsOpen(false);
      setSelectedUser(null);
      resetForm();
    } catch (error) {
      console.error('Error deleting user:', error);
      setConfirmDelete(null);
    }
  };

  const addHobby = () => {
    if (newHobby.trim() && !formData.hobbies.includes(newHobby.trim())) {
      setFormData({
        ...formData,
        hobbies: [...formData.hobbies, newHobby.trim()],
      });
      setNewHobby('');
    }
  };

  const removeHobby = (hobby: string) => {
    setFormData({
      ...formData,
      hobbies: formData.hobbies.filter((h) => h !== hobby),
    });
  };

  if (!isOpen) {
    return (
      <button
        className="panel-toggle"
        onClick={() => setIsOpen(true)}
        title="Open user management"
      >
        👥
      </button>
    );
  }

  return (
    <div className={`user-panel ${isOver ? 'drop-zone-active' : ''}`} ref={drop}>
      <div className="panel-header">
        <h2>{editingUserId ? 'Edit User' : 'Create User'}</h2>
        <button className="close-btn" onClick={() => {
          setIsOpen(false);
          resetForm();
          setSelectedUser(null);
        }}>
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label>
            Username <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            placeholder="Enter username"
          />
        </div>

        <div className="form-group">
          <label>
            Age <span className="required">*</span>
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
            min="1"
            placeholder="Enter age"
          />
        </div>

        <div className="form-group">
          <label>Hobbies</label>
          <div className="hobby-input-group">
            <input
              type="text"
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addHobby();
                }
              }}
              placeholder="Add hobby"
            />
            <button type="button" onClick={addHobby}>
              Add
            </button>
          </div>
          <div className="hobbies-display">
            {formData.hobbies.map((hobby, index) => (
              <span key={index} className="hobby-chip">
                {hobby}
                <button
                  type="button"
                  onClick={() => removeHobby(hobby)}
                  className="remove-hobby"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {isOver && (
            <div className="drop-hint">
              Drop hobby here to add it
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingUserId ? 'Update User' : 'Create User'}
          </button>
          {editingUserId && (
            <button
              type="button"
              className="btn-danger"
              onClick={() => setConfirmDelete(editingUserId)}
            >
              Delete User
            </button>
          )}
        </div>
      </form>

      <div className="panel-footer">
        <div className="history-controls">
          <button onClick={undo} className="history-btn" title="Undo">
            ↶ Undo
          </button>
          <button onClick={redo} className="history-btn" title="Redo">
            ↷ Redo
          </button>
        </div>
        <div className="users-count">
          {users.length} {users.length === 1 ? 'user' : 'users'} in network
        </div>
      </div>

      {confirmDelete && (
        <div className="confirm-dialog">
          <div className="confirm-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user?</p>
            <p className="warning">
              Note: Users with friendships cannot be deleted. Unlink all relationships first.
            </p>
            <div className="confirm-actions">
              <button
                className="btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                className="btn-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;


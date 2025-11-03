import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useStore } from '../store/useStore';
import './UserManagementPanel.css';
const UserManagementPanel = () => {
    const { users, selectedUser, setSelectedUser, createUser, updateUser, deleteUser, addHobbyToUser, undo, redo, } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        age: '',
        hobbies: [],
    });
    const [editingUserId, setEditingUserId] = useState(null);
    const [newHobby, setNewHobby] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'hobby',
        drop: (item) => {
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
        }
        else {
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
    const handleSubmit = async (e) => {
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
            }
            else {
                await createUser({
                    username: formData.username,
                    age,
                    hobbies: formData.hobbies,
                });
            }
            resetForm();
            setIsOpen(false);
            setSelectedUser(null);
        }
        catch (error) {
            console.error('Error saving user:', error);
        }
    };
    const handleDelete = async () => {
        if (!confirmDelete)
            return;
        try {
            await deleteUser(confirmDelete);
            setConfirmDelete(null);
            setIsOpen(false);
            setSelectedUser(null);
            resetForm();
        }
        catch (error) {
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
    const removeHobby = (hobby) => {
        setFormData({
            ...formData,
            hobbies: formData.hobbies.filter((h) => h !== hobby),
        });
    };
    if (!isOpen) {
        return (_jsx("button", { className: "panel-toggle", onClick: () => setIsOpen(true), title: "Open user management", children: "\uD83D\uDC65" }));
    }
    return (_jsxs("div", { className: `user-panel ${isOver ? 'drop-zone-active' : ''}`, ref: drop, children: [_jsxs("div", { className: "panel-header", children: [_jsx("h2", { children: editingUserId ? 'Edit User' : 'Create User' }), _jsx("button", { className: "close-btn", onClick: () => {
                            setIsOpen(false);
                            resetForm();
                            setSelectedUser(null);
                        }, children: "\u2715" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "user-form", children: [_jsxs("div", { className: "form-group", children: [_jsxs("label", { children: ["Username ", _jsx("span", { className: "required", children: "*" })] }), _jsx("input", { type: "text", value: formData.username, onChange: (e) => setFormData({ ...formData, username: e.target.value }), required: true, placeholder: "Enter username" })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: ["Age ", _jsx("span", { className: "required", children: "*" })] }), _jsx("input", { type: "number", value: formData.age, onChange: (e) => setFormData({ ...formData, age: e.target.value }), required: true, min: "1", placeholder: "Enter age" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Hobbies" }), _jsxs("div", { className: "hobby-input-group", children: [_jsx("input", { type: "text", value: newHobby, onChange: (e) => setNewHobby(e.target.value), onKeyPress: (e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addHobby();
                                            }
                                        }, placeholder: "Add hobby" }), _jsx("button", { type: "button", onClick: addHobby, children: "Add" })] }), _jsx("div", { className: "hobbies-display", children: formData.hobbies.map((hobby, index) => (_jsxs("span", { className: "hobby-chip", children: [hobby, _jsx("button", { type: "button", onClick: () => removeHobby(hobby), className: "remove-hobby", children: "\u00D7" })] }, index))) }), isOver && (_jsx("div", { className: "drop-hint", children: "Drop hobby here to add it" }))] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "submit", className: "btn-primary", children: editingUserId ? 'Update User' : 'Create User' }), editingUserId && (_jsx("button", { type: "button", className: "btn-danger", onClick: () => setConfirmDelete(editingUserId), children: "Delete User" }))] })] }), _jsxs("div", { className: "panel-footer", children: [_jsxs("div", { className: "history-controls", children: [_jsx("button", { onClick: undo, className: "history-btn", title: "Undo", children: "\u21B6 Undo" }), _jsx("button", { onClick: redo, className: "history-btn", title: "Redo", children: "\u21B7 Redo" })] }), _jsxs("div", { className: "users-count", children: [users.length, " ", users.length === 1 ? 'user' : 'users', " in network"] })] }), confirmDelete && (_jsx("div", { className: "confirm-dialog", children: _jsxs("div", { className: "confirm-content", children: [_jsx("h3", { children: "Confirm Delete" }), _jsx("p", { children: "Are you sure you want to delete this user?" }), _jsx("p", { className: "warning", children: "Note: Users with friendships cannot be deleted. Unlink all relationships first." }), _jsxs("div", { className: "confirm-actions", children: [_jsx("button", { className: "btn-danger", onClick: handleDelete, children: "Delete" }), _jsx("button", { className: "btn-secondary", onClick: () => setConfirmDelete(null), children: "Cancel" })] })] }) }))] }));
};
export default UserManagementPanel;

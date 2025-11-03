import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { useStore } from '../store/useStore';
import './Sidebar.css';
const DraggableHobby = ({ hobby }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'hobby',
        item: { hobby },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));
    return (_jsx("div", { ref: drag, className: `hobby-item ${isDragging ? 'dragging' : ''}`, children: hobby }));
};
const Sidebar = () => {
    const { allHobbies, isLoading, users, selectedUser, linkUsers, unlinkUsers, edges, setFilterHobby } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    // no labels anymore
    const filteredHobbies = useMemo(() => {
        if (!searchTerm)
            return allHobbies;
        return allHobbies.filter((hobby) => hobby.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allHobbies, searchTerm]);
    if (isCollapsed) {
        return (_jsx("button", { className: "sidebar-toggle", onClick: () => setIsCollapsed(false), title: "Expand sidebar", children: "\u25B6" }));
    }
    return (_jsxs("div", { className: "sidebar", children: [_jsxs("div", { className: "sidebar-header", children: [_jsx("h2", { children: "Hobbies" }), _jsx("button", { className: "collapse-btn", onClick: () => setIsCollapsed(true), title: "Collapse sidebar", children: "\u25C0" })] }), _jsx("div", { className: "sidebar-search", children: _jsx("input", { type: "text", placeholder: "Search hobbies...", value: searchTerm, onChange: (e) => {
                        setSearchTerm(e.target.value);
                        setFilterHobby(e.target.value);
                    }, className: "search-input" }) }), _jsx("div", { className: "sidebar-content", children: isLoading ? (_jsx("div", { className: "loading", children: "Loading hobbies..." })) : filteredHobbies.length > 0 ? (_jsx("div", { className: "hobbies-list", children: filteredHobbies.map((hobby, index) => (_jsx(DraggableHobby, { hobby: hobby }, `${hobby}-${index}`))) })) : (_jsx("div", { className: "no-hobbies", children: searchTerm ? 'No hobbies found' : 'No hobbies available' })) }), _jsxs("div", { className: "connections", children: [_jsxs("div", { className: "connections-header", children: [_jsx("h3", { children: "Connections" }), _jsx("div", { className: "selected-context", children: selectedUser ? (_jsxs("span", { children: ["From: ", _jsx("strong", { children: selectedUser.username })] })) : (_jsx("span", { children: "Select a user node to manage links" })) })] }), _jsx("div", { className: "users-list", children: users
                            .filter((u) => !selectedUser || u.id !== selectedUser.id)
                            .map((u) => (_jsxs("div", { className: "user-row", children: [_jsx("input", { type: "checkbox", disabled: !selectedUser, checked: !!edges?.some((e) => (e.source === selectedUser?.id && e.target === u.id) || (e.source === u.id && e.target === selectedUser?.id)), onChange: async (e) => {
                                        if (!selectedUser)
                                            return;
                                        const isChecked = e.target.checked;
                                        if (isChecked) {
                                            await linkUsers(selectedUser.id, u.id);
                                        }
                                        else {
                                            await unlinkUsers(selectedUser.id, u.id);
                                        }
                                    } }), _jsx("span", { className: "user-name", children: u.username })] }, u.id))) })] }), _jsxs("div", { className: "sidebar-footer", children: [_jsxs("div", { className: "hobby-count", children: [filteredHobbies.length, " ", filteredHobbies.length === 1 ? 'hobby' : 'hobbies'] }), _jsx("div", { className: "sidebar-hint", children: "\uD83D\uDCA1 Drag hobbies onto user nodes to add them" })] })] }));
};
export default Sidebar;

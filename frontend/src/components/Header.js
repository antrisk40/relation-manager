import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import './Header.css';
const Header = () => {
    const { users, edges, selectedUser, linkUsers, unlinkUsers } = useStore();
    const [filter, setFilter] = useState('');
    const list = useMemo(() => {
        return users
            .filter((u) => !selectedUser || u.id !== selectedUser.id)
            .filter((u) => (filter ? u.username.toLowerCase().includes(filter.toLowerCase()) : true));
    }, [users, selectedUser, filter]);
    return (_jsxs("div", { className: "header-bar", children: [_jsx("div", { className: "header-left", children: _jsx("div", { className: "brand", children: "Cybernauts Network" }) }), _jsx("div", { className: "header-right", children: _jsxs("div", { className: "rel-manager", children: [_jsx("div", { className: "rel-title", children: "Relation Manager" }), _jsx("div", { className: "rel-context", children: selectedUser ? (_jsxs("span", { children: ["From: ", _jsx("strong", { children: selectedUser.username })] })) : (_jsx("span", { children: "Select a node to manage links" })) }), _jsx("input", { className: "rel-search", placeholder: "Filter users...", value: filter, onChange: (e) => setFilter(e.target.value) }), _jsx("div", { className: "rel-list", children: list.map((u) => {
                                const checked = !!edges?.some((e) => (e.source === selectedUser?.id && e.target === u.id) ||
                                    (e.source === u.id && e.target === selectedUser?.id));
                                return (_jsxs("label", { className: `rel-chip ${checked ? 'rel-chip-on' : ''}`, children: [_jsx("input", { type: "checkbox", disabled: !selectedUser, checked: checked, onChange: async (e) => {
                                                if (!selectedUser)
                                                    return;
                                                if (e.target.checked) {
                                                    await linkUsers(selectedUser.id, u.id);
                                                }
                                                else {
                                                    await unlinkUsers(selectedUser.id, u.id);
                                                }
                                            } }), _jsx("span", { className: "rel-name", children: u.username })] }, u.id));
                            }) })] }) })] }));
};
export default Header;

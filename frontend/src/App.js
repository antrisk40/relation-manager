import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GraphView from './components/GraphView';
import Sidebar from './components/Sidebar';
import UserManagementPanel from './components/UserManagementPanel';
import Header from './components/Header';
import { useStore } from './store/useStore';
import './App.css';
function App() {
    const { fetchGraphData, fetchUsers } = useStore();
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined')
            return 'light';
        return localStorage.getItem('theme') || 'light';
    });
    const [showHobbyHint, setShowHobbyHint] = useState(() => {
        if (typeof window === 'undefined')
            return true;
        return localStorage.getItem('hobbyHintDismissed') !== 'true';
    });
    useEffect(() => {
        fetchGraphData();
        fetchUsers();
    }, [fetchGraphData, fetchUsers]);
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    return (_jsx(DndProvider, { backend: HTML5Backend, children: _jsxs("div", { className: "app", children: [_jsx(Toaster, { position: "top-right" }), _jsx(Header, {}), showHobbyHint && (_jsx("div", { "aria-live": "polite", style: {
                        position: 'fixed',
                        top: 16,
                        right: 16,
                        zIndex: 1000,
                        maxWidth: 320,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.08)',
                        background: 'var(--hint-bg, #ffffff)',
                        color: 'inherit',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
                    }, children: _jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'start' }, children: [_jsx("span", { style: { fontSize: 18 }, children: "\uD83D\uDCA1" }), _jsx("div", { style: { fontSize: 13, lineHeight: 1.4 }, children: "Tip: Drag hobbies from the sidebar and drop them onto a user node to add them." }), _jsx("button", { onClick: () => { localStorage.setItem('hobbyHintDismissed', 'true'); setShowHobbyHint(false); }, "aria-label": "Dismiss hint", style: {
                                    marginLeft: 'auto',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    fontSize: 16,
                                    lineHeight: 1
                                }, children: "\u00D7" })] }) })), _jsx("button", { onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'), title: "Toggle theme", style: {
                        position: 'fixed',
                        right: 16,
                        bottom: 16,
                        zIndex: 1000,
                        background: 'transparent',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 8,
                        color: 'inherit',
                        padding: '8px 10px',
                        cursor: 'pointer'
                    }, children: theme === 'dark' ? '☀️ Light' : '🌙 Dark' }), _jsxs("div", { className: "main", children: [_jsx(Sidebar, {}), _jsx(GraphView, {}), _jsx(UserManagementPanel, {})] })] }) }));
}
export default App;

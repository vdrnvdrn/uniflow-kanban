import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import Kanban from '../tasks/Kanban'
import EditProject from './EditProject'
import SideBar from '../SideBar'
import UsersList from './UsersList'
import Statistics from './Statistics'
import ActivityFeed from './ActivityFeed'
import { GlobalContext } from '../Home.jsx'
import { IconMenu } from '../ui/Icons'

const ManagerRoute = ({ children }) => {
    const user = useContext(GlobalContext);
    const { state } = useLocation();
    const project = state?.project;
    const role = user?.role;

    const isAdminOrManager =
        role === "admin" || (role === "manager" && project?.managerId === user?.id);

    if (!isAdminOrManager) {
        return <Navigate to="/project" state={state} replace />;
    }
    return children;
};

const Index = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <div className="flex min-h-[calc(100vh-4rem)]">
                <SideBar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 p-2 md:p-4">
                    {/* Mobile sidebar toggle */}
                    <button
                        className="md:hidden glass-btn-ghost mb-2 p-2"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        <IconMenu className="w-5 h-5" />
                    </button>
                    <div className="glass-card p-3 md:p-5 min-h-full">
                        <Routes>
                            <Route path="/" element={<Kanban />} />
                            <Route path="/edit" element={<ManagerRoute><EditProject /></ManagerRoute>} />
                            <Route path="/users" element={<ManagerRoute><UsersList /></ManagerRoute>} />
                            <Route path="/statistics" element={<ManagerRoute><Statistics /></ManagerRoute>} />
                            <Route path="/activity" element={<ActivityFeed />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Index

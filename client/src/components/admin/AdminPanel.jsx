import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import api, { API_URL } from "../../api";
import { GlobalContext } from "../Home";
import ResetPasswordModal from "./ResetPasswordModal";

const roleBadgeClass = {
  admin: "bg-white/15 border border-white/30 text-white",
  manager: "bg-white/15 border border-white/30 text-white",
  user: "bg-white/10 border border-white/20 text-white/70",
};

const projectRoleBadge = {
  manager: "bg-white/15 border border-white/30 text-white",
  member: "bg-white/10 border border-white/20 text-white/70",
};

const AdminPanel = () => {
  const { t } = useTranslation();
  const currentUser = useContext(GlobalContext);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetUser, setResetUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/api/admin/stats");
      setStats(data);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/api/admin/users");
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(t("roleUpdateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const prevUsers = [...users];
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
    } catch (err) {
      setUsers(prevUsers);
      alert(t("roleUpdateFailed"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-[100px]">
        <p className="text-white/50 text-lg">{t("loadingUsers")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center mt-[100px]">
        <p className="text-white/60 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] p-6 min-h-screen">
      <h2 className="text-3xl font-semibold text-white mb-6">
        {t("userManagement")}
      </h2>

      {stats && (
        <div className="glass-card p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <Stat label={t("statUsers")} value={stats.totalUsers} />
          <Stat label={t("statManagers")} value={stats.managers} />
          <Stat label={t("statProjects")} value={stats.totalProjects} />
          <Stat label={t("statActiveTasks")} value={stats.activeTasks} />
          <Stat label={t("statOverdue")} value={stats.overdueTasks} accent={stats.overdueTasks > 0 ? "red" : null} />
          <Stat label={t("statNoManager")} value={stats.projectsNoManager} accent={stats.projectsNoManager > 0 ? "amber" : null} />
          <Stat label={t("statProblemProjects")} value={stats.problemProjects} accent={stats.problemProjects > 0 ? "amber" : null} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const isAdmin = user.role === "admin";

          return (
            <div
              key={user.id}
              className="glass-card-subtle p-4 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <img
                  className="glass-avatar glass-avatar-md"
                  src={`${API_URL}/${user.photo}`}
                  alt={user.fullName}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-lg truncate">
                    {user.fullName}
                  </div>
                  <div className="text-white/50 text-sm truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-white/60 text-sm">{t("role")}:</span>
                {isAdmin ? (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadgeClass.admin}`}
                    title={t("cannotChangeAdminRole")}
                  >
                    {t("admin")}
                  </span>
                ) : (
                  <select
                    className="glass-select text-sm w-auto"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="manager">{t("manager")}</option>
                    <option value="user">{t("user")}</option>
                  </select>
                )}
              </div>

              {!isAdmin && (
                <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => setResetUser(user)}
                    className="text-xs text-white/60 hover:text-white px-2 py-1 rounded border border-white/15 hover:border-white/30 transition-colors"
                  >
                    {t("resetPassword") || "Reset password"}
                  </button>
                </div>
              )}

              {!isAdmin && user.projectRoles && user.projectRoles.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-white/60 text-sm mb-1">{t("projectRoles")}:</div>
                  <div className="flex flex-col gap-1">
                    {user.projectRoles.map((pr) => (
                      <div key={pr.projectId} className="flex items-center justify-between text-sm">
                        <span className="text-white truncate mr-2">{pr.projectName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${projectRoleBadge[pr.role]}`}>
                          {pr.role === "manager" ? t("manager") : t("member")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {resetUser && <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />}
    </div>
  );
};

const Stat = ({ label, value, accent }) => {
  const accentClass =
    accent === "red"
      ? "text-red-300"
      : accent === "amber"
      ? "text-amber-300"
      : "text-white";
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${accentClass}`}>{value ?? 0}</div>
      <div className="text-xs text-white/50 mt-0.5">{label}</div>
    </div>
  );
};

export default AdminPanel;

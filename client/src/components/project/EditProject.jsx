import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api";
import { IconCheckCircle } from "../ui/Icons";
import { GlobalContext } from "../Home.jsx";

const EditProject = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const { project } = state;
  const navigateTo = useNavigate();
  const currentUser = useContext(GlobalContext);
  const isAdmin = currentUser?.role === "admin";

  const [name, setName] = useState(project.name);
  const [desc, setDesc] = useState(project.description);
  const [managerId, setManagerId] = useState(project.managerId || "");
  const [managers, setManagers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    api
      .get("/api/admin/users")
      .then(({ data }) => {
        setManagers(data.filter((u) => u.role === "manager"));
      })
      .catch(() => {});
  }, [isAdmin]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.put(`/api/project/${project.id}`, { name, description: desc });

      if (isAdmin && managerId && parseInt(managerId) !== project.managerId) {
        await api.put(`/api/project/${project.id}/manager`, {
          managerId: parseInt(managerId),
        });
      }
      navigateTo("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-6 pt-16">
      <div className="w-full max-w-lg glass-card-strong p-8">
        <h1 className="text-center text-xl text-white font-semibold mb-6">
          {t("editProject")}
        </h1>

        <div className="space-y-5">
          <div>
            <label className="text-white/70 text-sm font-medium block mb-1.5">
              {t("projectName")}
            </label>
            <input
              className="glass-input"
              type="text"
              placeholder={t("projectName")}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div>
            <label className="text-white/70 text-sm font-medium block mb-1.5">
              {t("projectDescription")}
            </label>
            <textarea
              rows={4}
              className="glass-textarea"
              placeholder={t("projectDescription")}
              value={desc}
              onChange={(event) => setDesc(event.target.value)}
            />
          </div>

          {isAdmin && (
            <div>
              <label className="text-white/70 text-sm font-medium block mb-1.5">
                {t("projectManager")}
              </label>
              <select
                className="glass-select w-full"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
              >
                <option value="">{t("selectManager")}</option>
                {managers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email}) — {t(u.role)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/40 mt-1">
                {t("changeManagerHint") || "Доступно только администратору"}
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-300/90 bg-red-500/15 border border-red-400/30 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              className="glass-btn-primary flex items-center gap-1.5 px-4 py-2 disabled:opacity-40"
              onClick={handleSave}
              disabled={saving}
            >
              <IconCheckCircle className="w-4 h-4" />
              {saving ? "..." : t("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProject;

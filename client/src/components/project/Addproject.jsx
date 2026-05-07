import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api";
import GlassModal from "../ui/GlassModal";

const Addproject = ({ create, open, onClose }) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [des, setDes] = useState("");
  const [managerId, setManagerId] = useState("");
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    api
      .get("/api/admin/users")
      .then((response) => {
        const mgrs = response.data.filter(
          (u) => u.role === "manager" || u.role === "admin"
        );
        setManagers(mgrs);
      })
      .catch(() => {});
  }, []);

  const handleCreate = () => {
    create(name, des, managerId);
    setName("");
    setDes("");
    setManagerId("");
    onClose();
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      title={t("createProject")}
      footer={
        <button className="glass-btn-primary px-6 py-2.5" onClick={handleCreate}>
          {t("createProject")}
        </button>
      }
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-4">
          <label className="text-white/70 text-sm font-medium block mb-1.5">
            {t("projectName")}
          </label>
          <input
            type="text"
            className="glass-input"
            placeholder={t("projectName")}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="text-white/70 text-sm font-medium block mb-1.5">
            {t("projectDescription")}
          </label>
          <textarea
            className="glass-textarea"
            rows="3"
            placeholder={t("projectDescription")}
            value={des}
            onChange={(event) => setDes(event.target.value)}
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="text-white/70 text-sm font-medium block mb-1.5">
            {t("assignManager")}
          </label>
          <select
            className="glass-select"
            onChange={(event) => setManagerId(event.target.value)}
            value={managerId}
          >
            <option value="">{t("selectManager")}</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </form>
    </GlassModal>
  );
};

export default Addproject;

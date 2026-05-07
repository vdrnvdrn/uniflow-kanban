import { useTranslation } from "react-i18next";
import GlassModal from "../ui/GlassModal";

const Delete = ({ project, deleted, open, onClose }) => {
  const { t } = useTranslation();

  if (!project) return null;

  const handleDelete = () => {
    deleted(project.id);
    onClose();
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      title={t("confirmation")}
      size="sm"
      footer={
        <>
          <button className="glass-btn-secondary px-4 py-2" onClick={onClose}>
            {t("cancel")}
          </button>
          <button className="glass-btn-danger px-4 py-2" onClick={handleDelete}>
            {t("deleteProject")}
          </button>
        </>
      }
    >
      <h3 className="text-white/80 text-base">
        {t("deleteProjectConfirm", { name: project.name })}
      </h3>
    </GlassModal>
  );
};

export default Delete;

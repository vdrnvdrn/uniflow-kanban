import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconTrash, IconSettings } from "../ui/Icons";
import { API_URL } from "../../api";

const ProjectCard = ({ setProject, project, role, showAdmin, userRole, onRequestDelete }) => {
  const navigateTo = useNavigate();
  const { t } = useTranslation();

  const canEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const badgeStyles = {
    manager: "bg-white/15 text-white border-white/30",
    member: "bg-white/10 text-white/70 border-white/20",
    admin: "bg-white/15 text-white border-white/30",
  };

  return (
    <div className="relative glass-card-subtle hover:border-white/40 cursor-pointer overflow-hidden">
      {userRole && (
        <div
          className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-semibold z-10 border ${
            badgeStyles[userRole] || badgeStyles.member
          }`}
        >
          {t(userRole)}
        </div>
      )}

      <div
        className="p-4 hover:bg-white/5 duration-200"
        onClick={() => {
          navigateTo("/project", { state: { project } });
        }}
      >
        <div className="flex items-center pb-3">
          <div className="w-12 h-12 min-w-12 rounded-full border-2 border-white/40 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={`${API_URL}/images/projects/DefaultProject.svg`}
              alt=""
            />
          </div>
          <div className="text-white ml-3 font-semibold text-lg">
            {project.name}
          </div>
        </div>
        <div className="text-sm text-white/60 leading-relaxed">
          {project.description}
        </div>

        {showAdmin && project.manager && (
          <div className="mt-2 text-sm text-white/50">
            {t("projectManager")}: {project.manager.fullName}
          </div>
        )}
        {showAdmin && project.completionPercent !== undefined && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">
                {t("completionRate")}: {project.completionPercent}%
              </span>
              <div className="flex-1 bg-white/10 rounded-full h-1.5 max-w-[120px]">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${project.completionPercent}%`, background: "linear-gradient(135deg, #f59e0b, #ea580c)" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {(canEdit || canDelete) && (
        <div className="border-t border-white/10 p-2 flex justify-end gap-2">
          {canDelete && (
            <button
              className="glass-btn-ghost"
              onClick={(e) => {
                e.stopPropagation();
                setProject(project);
                onRequestDelete?.();
              }}
            >
              <IconTrash className="w-4 h-4" />
            </button>
          )}
          {canEdit && (
            <button
              className="glass-btn-ghost"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo("/project/edit", { state: { project } });
              }}
            >
              <IconSettings className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;

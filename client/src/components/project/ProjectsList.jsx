import { useEffect, useContext, useState, useMemo } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ProjectCard from "./ProjectCard.jsx";
import Addproject from "./Addproject.jsx";
import Delete from "./Delete.jsx";
import Achievements from "./Achievements.jsx";
import DailyDigest from "./DailyDigest.jsx";
import AdminDigest from "../admin/AdminDigest.jsx";
import StatCard from "./StatCard.jsx";
import { GlobalContext } from "../Home.jsx";
import {
  IconCheckCircle,
  IconClock,
  IconFolder,
  IconMessageCircle,
  IconCrown,
  IconUsers,
} from "../ui/Icons";

const ProjectsList = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [projectsMember, setProjectsMember] = useState([]);
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievementsOpen, setAchievementsOpen] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const user = useContext(GlobalContext);
  const role = user?.role;
  const navigateTo = useNavigate();

  useEffect(() => {
    fetchAllProjects();
    fetchStats();
  }, []);

  const fetchStats = () => {
    api
      .get("/api/user/achievements")
      .then(({ data }) => setStats(data))
      .catch(() => {});
  };

  const fetchAllProjects = () => {
    if (!user) return;

    if (role === "admin") {
      api
        .get("/api/project")
        .then((response) => setProjects(response.data))
        .catch(() => {});
    } else if (role === "manager") {
      api
        .get("/api/project")
        .then((response) => setProjects(response.data))
        .catch(() => {});

      api
        .get(`/api/user/${user.id}/projectin`)
        .then((response) => setProjectsMember(response.data))
        .catch(() => {});
    } else {
      api
        .get(`/api/user/${user.id}/projectin`)
        .then((response) => setProjectsMember(response.data))
        .catch(() => {});
    }
  };

  const createproject = (name, description, managerId) => {
    api
      .post(
        "/api/project",
        { name, description, managerId }
      )
      .then(() => {
        fetchAllProjects();
        fetchStats();
      })
      .catch(() => {});
  };

  const deleteProject = (id) => {
    api
      .delete(`/api/project/${id}`)
      .then(() => {
        fetchAllProjects();
        fetchStats();
      })
      .catch(() => {});
  };

  const allProjects = useMemo(() => {
    if (role === "admin") {
      return projects.map((p) => ({ ...p, userRole: "admin" }));
    } else if (role === "manager") {
      const managed = projects.map((p) => ({ ...p, userRole: "manager" }));
      const collab = projectsMember.map((p) => ({ ...p, userRole: "member" }));
      return [...managed, ...collab];
    } else {
      return projectsMember.map((p) => ({ ...p, userRole: "member" }));
    }
  }, [projects, projectsMember, role]);

  const onTimeRate =
    stats && stats.tasksDone > 0
      ? Math.round((stats.tasksOnTime / stats.tasksDone) * 100)
      : 0;

  const showManagerStats = role === "manager" || role === "admin";

  return (
    <>
      {role === "admin" && <Addproject create={createproject} open={createModalOpen} onClose={() => setCreateModalOpen(false)} />}
      <Delete deleted={deleteProject} project={project} open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />

      <div className="min-h-screen p-3 md:p-6">
        {/* Header */}
        <div className="mb-6 flex justify-end items-center gap-2">
          {role === "admin" && (
            <>
              <button
                onClick={() => navigateTo("/admin")}
                className="glass-btn-secondary glass-btn-sm"
              >
                {t("userManagement")}
              </button>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="glass-btn-primary glass-btn-sm"
              >
                {t("createProject")}
              </button>
            </>
          )}
        </div>

        {/* Daily digest */}
        {role === "admin" ? <AdminDigest /> : <DailyDigest />}

        {/* Stats Cards */}
        {stats && role !== "admin" && (
          <div
            className={`grid grid-cols-2 ${
              showManagerStats ? "lg:grid-cols-6" : "lg:grid-cols-4"
            } gap-4 mb-6`}
          >
            <StatCard
              icon={IconCheckCircle}
              label={t("tasksCompleted")}
              value={stats.tasksDone}
            />
            <StatCard
              icon={IconClock}
              label={t("onTimeRate")}
              value={`${onTimeRate}%`}
            />
            <StatCard
              icon={IconFolder}
              label={t("projectsInvolved")}
              value={stats.projectsCount}
            />
            <StatCard
              icon={IconMessageCircle}
              label={t("commentsMade")}
              value={stats.commentsCount}
            />
            {showManagerStats && (
              <>
                <StatCard
                  icon={IconCrown}
                  label={t("projectsManaged")}
                  value={stats.managedProjects}
                />
                <StatCard
                  icon={IconUsers}
                  label={t("largestTeam")}
                  value={stats.maxTeamSize}
                />
              </>
            )}
          </div>
        )}

        {/* Projects Section */}
        <div className="glass-card-static p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
            {t("myProjects")}
          </h2>
          {allProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProjects.map((proj) => (
                <ProjectCard
                  key={`${proj.userRole}-${proj.id}`}
                  project={proj}
                  setProject={setProject}
                  role={role}
                  showAdmin={role === "admin"}
                  userRole={proj.userRole}
                  onRequestDelete={() => setDeleteModalOpen(true)}
                  onProjectUpdated={fetchAllProjects}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/50">
              <div className="flex justify-center mb-3">
                <IconFolder className="w-12 h-12" />
              </div>
              <p className="text-lg">{t("noProjectsYet")}</p>
            </div>
          )}
        </div>

        {/* Achievements Section - Collapsible (not for admin) */}
        {role !== "admin" && (
        <div className="glass-card p-4 md:p-6">
          <button
            onClick={() => setAchievementsOpen(!achievementsOpen)}
            className="w-full flex justify-between items-center cursor-pointer"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              {t("myAchievements")}
            </h2>
            <svg
              className={`w-6 h-6 text-white/60 transform transition-transform duration-200 ${
                achievementsOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              achievementsOpen
                ? "max-h-[2000px] opacity-100 mt-4"
                : "max-h-0 opacity-0"
            }`}
          >
            <Achievements />
          </div>
        </div>
        )}
      </div>
    </>
  );
};

export default ProjectsList;

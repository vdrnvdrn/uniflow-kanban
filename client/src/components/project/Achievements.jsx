import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api";
import {
  IconSprout,
  IconDumbbell,
  IconStar,
  IconTrophy,
  IconClock,
  IconTarget,
  IconUsers,
  IconMessageCircle,
  IconFolder,
  IconLayers,
  IconCrown,
  IconCheckCircle,
} from "../ui/Icons";

const getExecutorAchievements = (t) => [
  { key: "firstSteps", icon: IconSprout, threshold: 1, stat: "tasksDone" },
  { key: "hardWorker", icon: IconDumbbell, threshold: 5, stat: "tasksDone" },
  { key: "professional", icon: IconStar, threshold: 15, stat: "tasksDone" },
  { key: "legend", icon: IconTrophy, threshold: 50, stat: "tasksDone" },
  { key: "onTime", icon: IconClock, threshold: 3, stat: "tasksOnTime" },
  { key: "deadlineMaster", icon: IconTarget, threshold: 10, stat: "tasksOnTime" },
  { key: "teamPlayer", icon: IconUsers, threshold: 2, stat: "projectsCount" },
  { key: "commentator", icon: IconMessageCircle, threshold: 10, stat: "commentsCount" },
];

const getManagerAchievements = (t) => [
  { key: "firstProject", icon: IconFolder, threshold: 1, stat: "managedProjects" },
  { key: "multiManager", icon: IconLayers, threshold: 3, stat: "managedProjects" },
  { key: "teamLeader", icon: IconCrown, threshold: 5, stat: "maxTeamSize" },
  { key: "projectDone", icon: IconCheckCircle, threshold: 1, stat: "completedProjects" },
];

const AchievementCard = ({ achievement, current, t }) => {
  const unlocked = current >= achievement.threshold;
  const progress = Math.min(current / achievement.threshold, 1);
  const IconComponent = achievement.icon;

  return (
    <div
      className={`relative rounded-lg border p-3 transition-all duration-300 ${
        unlocked
          ? "bg-white/15 border-white/30 text-white"
          : "bg-white/5 border-white/10 text-white/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`${unlocked ? "text-white/80" : "opacity-50"}`}>
          <IconComponent className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm truncate ${unlocked ? "text-white" : "text-white/50"}`}>
            {t(`ach_${achievement.key}`)}
          </div>
          <div className={`text-xs ${unlocked ? "text-white/60" : "text-white/50"}`}>
            {t(`ach_${achievement.key}_desc`)}
          </div>
        </div>
        {unlocked && (
          <span className="text-amber-400 text-xs">✓</span>
        )}
      </div>
      {!unlocked && (
        <div className="mt-2">
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              }}
            />
          </div>
          <div className="text-xs text-white/50 mt-0.5 text-right">
            {current}/{achievement.threshold}
          </div>
        </div>
      )}
    </div>
  );
};

const Achievements = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/user/achievements")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return null;

  const executorList = getExecutorAchievements(t);
  const managerList = getManagerAchievements(t);
  const showManager = stats.role === "manager" || stats.role === "admin";

  return (
    <div>
      <div className="mb-4">
        <div className="text-base font-medium text-white/70 mb-2">
          {t("ach_executorTitle")}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {executorList.map((a) => (
            <AchievementCard
              key={a.key}
              achievement={a}
              current={stats[a.stat] || 0}
              t={t}
            />
          ))}
        </div>
      </div>

      {showManager && (
        <div>
          <div className="text-base font-medium text-white/70 mb-2">
            {t("ach_managerTitle")}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {managerList.map((a) => (
              <AchievementCard
                key={a.key}
                achievement={a}
                current={stats[a.stat] || 0}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;

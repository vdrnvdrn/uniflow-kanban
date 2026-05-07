import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api";
import Avatar from "../ui/Avatar";

const formatRelative = (dateStr, t) => {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return t("justNow");
  if (diff < 3600) return t("minutesAgo", { n: Math.floor(diff / 60) });
  if (diff < 86400) return t("hoursAgo", { n: Math.floor(diff / 3600) });
  if (diff < 86400 * 7) return t("daysAgo", { n: Math.floor(diff / 86400) });
  return d.toLocaleDateString();
};

const stateColor = {
  Todo: "bg-white/40",
  Doing: "bg-amber-400/70",
  Done: "bg-emerald-400/70",
};

const ActivityFeed = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const { project } = state;
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/project/${project.id}/actions`)
      .then(({ data }) => setActions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [project.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white/50 text-lg">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">{t("recentActivity")}</h2>
      {actions.length === 0 ? (
        <p className="text-white/50 text-sm text-center py-10">{t("noActivity")}</p>
      ) : (
        <div className="space-y-2">
          {actions.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors duration-150"
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${stateColor[a.state] || "bg-white/40"}`} />
              {a.user?.photo ? (
                <Avatar photo={a.user.photo} alt={a.user.fullName} status={a.user.status} size={32} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">
                  <span className="font-medium">{a.user?.fullName || t("unknown")}</span>
                  <span className="text-white/50"> {t("movedTaskTo")} </span>
                  <span className="font-medium">{a.task?.name || "—"}</span>
                  <span className="text-white/50"> → </span>
                  <span className="font-medium">{t(a.state.toLowerCase()) || a.state}</span>
                </div>
              </div>
              <div className="text-xs text-white/50 flex-shrink-0">
                {formatRelative(a.createdAt, t)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;

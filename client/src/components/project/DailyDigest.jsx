import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api";
import Avatar from "../ui/Avatar";

const formatRelative = (dateStr, t) => {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return t("justNow");
  if (diff < 3600) return t("minutesAgo", { n: Math.floor(diff / 60) });
  if (diff < 86400) return t("hoursAgo", { n: Math.floor(diff / 3600) });
  return t("daysAgo", { n: Math.floor(diff / 86400) });
};

const stateDot = {
  Todo: "bg-white/40",
  Doing: "bg-amber-400/70",
  Done: "bg-emerald-400/70",
};

const DailyDigest = () => {
  const { t } = useTranslation();
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    api
      .get("/api/user/me/digest")
      .then(({ data }) => setDigest(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!digest) return null;

  const { actions = [], dueToday = [], stats = {} } = digest;
  const isEmpty = actions.length === 0 && dueToday.length === 0;

  return (
    <div className="glass-card p-4 md:p-5 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div>
          <h2 className="text-lg font-semibold text-white">{t("digestTitle")}</h2>
          <p className="text-xs text-white/50 mt-0.5">
            {t("digestSubtitle", {
              actions: stats.totalActions || 0,
              done: stats.doneToday || 0,
              due: dueToday.length,
            })}
          </p>
        </div>
        <button className="text-white/60 hover:text-white text-sm" aria-label="toggle">
          {collapsed ? "▼" : "▲"}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-4">
          {isEmpty ? (
            <p className="text-white/50 text-sm text-center py-6">{t("digestEmpty")}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent activity */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">{t("digestRecent")}</h3>
                {actions.length === 0 ? (
                  <p className="text-white/40 text-xs">{t("noActivity")}</p>
                ) : (
                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                    {actions.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stateDot[a.state] || "bg-white/40"}`} />
                        {a.user?.photo && (
                          <Avatar photo={a.user.photo} alt={a.user.fullName} status={a.user.status} size={24} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white truncate">
                            <span className="font-medium">{a.user?.fullName}</span>
                            <span className="text-white/50"> · </span>
                            <span>{a.task?.name || "—"}</span>
                            <span className="text-white/50"> → </span>
                            <span className="font-medium">{t(a.state.toLowerCase())}</span>
                          </div>
                          <div className="text-[10px] text-white/40">
                            {a.project?.name} · {formatRelative(a.createdAt, t)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Due today */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">{t("digestDueToday")}</h3>
                {dueToday.length === 0 ? (
                  <p className="text-white/40 text-xs">{t("digestNoDue")}</p>
                ) : (
                  <div className="space-y-1.5">
                    {dueToday.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-amber-300/20 bg-amber-500/5"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400/80 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white font-medium truncate">{task.name}</div>
                          <div className="text-[10px] text-white/50">
                            {task.project?.name} · {t(task.state.toLowerCase())}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyDigest;

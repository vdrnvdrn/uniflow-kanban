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

const Counter = ({ label, value, accent }) => (
  <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5">
    <div className={`text-xl font-bold ${accent || "text-white"}`}>{value ?? 0}</div>
    <div className="text-[11px] text-white/55 mt-0.5">{label}</div>
  </div>
);

const AdminDigest = () => {
  const { t } = useTranslation();
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    api
      .get("/api/admin/digest")
      .then(({ data }) => setDigest(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !digest) return null;

  const { newUsers = [], newProjects = [], counters = {} } = digest;
  const isEmpty =
    newUsers.length === 0 &&
    newProjects.length === 0 &&
    !counters.totalActions &&
    !counters.newComments;

  return (
    <div className="glass-card-static p-4 md:p-5 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div>
          <h2 className="text-lg font-semibold text-white">{t("adminDigestTitle")}</h2>
          <p className="text-xs text-white/50 mt-0.5">{t("adminDigestSubtitle")}</p>
        </div>
        <button className="text-white/60 hover:text-white text-sm" aria-label="toggle">
          {collapsed ? "▼" : "▲"}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-4 space-y-4">
          {/* Counters row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Counter
              label={t("digestCntNewUsers")}
              value={counters.newUsers}
              accent={counters.newUsers > 0 ? "text-emerald-300" : ""}
            />
            <Counter
              label={t("digestCntNewProjects")}
              value={counters.newProjects}
              accent={counters.newProjects > 0 ? "text-emerald-300" : ""}
            />
            <Counter label={t("digestCntActions")} value={counters.totalActions} />
            <Counter
              label={t("digestCntDone")}
              value={counters.doneCount}
              accent={counters.doneCount > 0 ? "text-emerald-300" : ""}
            />
            <Counter label={t("digestCntComments")} value={counters.newComments} />
          </div>

          {isEmpty ? (
            <p className="text-white/50 text-sm text-center py-4">{t("digestEmpty")}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* New users */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">{t("digestNewUsers")}</h3>
                {newUsers.length === 0 ? (
                  <p className="text-white/40 text-xs">{t("digestNoNewUsers")}</p>
                ) : (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {newUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-white/10 hover:bg-white/5"
                      >
                        <Avatar photo={u.photo} alt={u.fullName} size={28} showStatus={false} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white truncate">
                            <span className="font-medium">{u.fullName}</span>
                            <span className="text-white/50"> · {t(u.role) || u.role}</span>
                          </div>
                          <div className="text-[10px] text-white/40 truncate">
                            {u.email} · {formatRelative(u.createdAt, t)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* New projects */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">{t("digestNewProjects")}</h3>
                {newProjects.length === 0 ? (
                  <p className="text-white/40 text-xs">{t("digestNoNewProjects")}</p>
                ) : (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {newProjects.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-white/10 hover:bg-white/5"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400/70 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white font-medium truncate">{p.name}</div>
                          <div className="text-[10px] text-white/40 truncate">
                            {p.manager
                              ? `${t("projectManager")}: ${p.manager.fullName}`
                              : t("statNoManager")}
                            {" · "}
                            {formatRelative(p.createdAt, t)}
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

export default AdminDigest;

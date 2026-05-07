import { useTranslation } from "react-i18next";
import Avatar from "../../ui/Avatar";

const MemberBreakdown = ({ members }) => {
  const { t } = useTranslation();

  if (!members || members.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-lg font-semibold text-white mb-4">{t("memberContribution")}</h3>
        <p className="text-white/50 text-sm text-center py-6">{t("noMembers")}</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-lg font-semibold text-white mb-4">{t("memberContribution")}</h3>
      <div className="space-y-3">
        {members.map((m) => (
          <div
            key={m.userId}
            className="flex items-center gap-4 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors duration-150"
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-3 min-w-[180px]">
              <Avatar photo={m.photo} alt={m.fullName} status={m.status} size={36} />
              <div>
                <div className="text-sm font-medium text-white">{m.fullName}</div>
                <div className="text-xs text-white/50">{m.email}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-5 flex-1 ml-2">
              {/* Assigned / Completed */}
              <div className="text-center min-w-[60px]">
                <div className="text-base font-bold text-white">
                  {m.completed}<span className="text-white/50 font-normal">/{m.totalAssigned}</span>
                </div>
                <div className="text-xs text-white/50">{t("tasksCount")}</div>
              </div>

              {/* Progress bar */}
              <div className="flex-1 max-w-[160px]">
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>{t("progress")}</span>
                  <span>{m.completionRate}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${m.completionRate}%`,
                      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                    }}
                  />
                </div>
              </div>

              {/* On-time rate */}
              <div className="text-center min-w-[70px]">
                <div className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 border border-white/30 text-white/80">
                  {m.completed > 0 ? `${m.onTimeRate}%` : "\u2014"}
                </div>
                <div className="text-xs text-white/50 mt-0.5">{t("onTime")}</div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 min-w-[50px] justify-end">
                <svg width="14" height="14" fill="rgba(255,255,255,0.5)" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-semibold text-white">{m.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberBreakdown;

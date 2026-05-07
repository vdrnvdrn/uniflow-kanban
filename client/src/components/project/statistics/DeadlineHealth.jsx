import { useTranslation } from "react-i18next";
import { API_URL } from "../../../api";

const formatDate = (dateStr) => {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const TaskItem = ({ task, type, t }) => {
  const isOverdue = type === "overdue";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors duration-150">
      {/* Indicator dot */}
      <div
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOverdue ? 'bg-red-400/70' : 'bg-amber-400/70'}`}
      />

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{task.taskName}</div>
        <div className="flex items-center gap-2 mt-1">
          {task.assignedUser && (
            <div className="flex items-center gap-1.5">
              <img
                className="w-5 h-5 rounded-full object-cover"
                src={`${API_URL}/${task.assignedUser.photo}`}
                alt={task.assignedUser.fullName}
              />
              <span className="text-xs text-white/50">{task.assignedUser.fullName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Deadline + days */}
      <div className="text-right flex-shrink-0">
        <div className="text-xs text-white/50">{formatDate(task.deadline)}</div>
        <div className={`text-xs font-medium mt-0.5 ${isOverdue ? 'text-red-400/80' : 'text-white/60'}`}>
          {isOverdue
            ? t("overdueDays", { days: task.daysOverdue })
            : task.daysRemaining === 0
              ? t("today")
              : t("daysRemaining", { days: task.daysRemaining })
          }
        </div>
      </div>
    </div>
  );
};

const DeadlineHealth = ({ deadlineHealth }) => {
  const { t } = useTranslation();
  const { overdue = [], upcoming = [] } = deadlineHealth;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Overdue */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-400/70" />
          <h3 className="text-lg font-semibold text-white">{t("overdueTasks")}</h3>
          {overdue.length > 0 && (
            <span className="ml-auto bg-red-500/15 text-red-300/90 text-xs font-medium px-2 py-0.5 rounded-full border border-red-400/30">
              {overdue.length}
            </span>
          )}
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {overdue.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-6">{t("noOverdueTasks")}</p>
          ) : (
            overdue.map((task) => (
              <TaskItem key={task.taskId} task={task} type="overdue" t={t} />
            ))
          )}
        </div>
      </div>

      {/* Upcoming */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-amber-400/70" />
          <h3 className="text-lg font-semibold text-white">{t("upcomingDeadlines")}</h3>
          {upcoming.length > 0 && (
            <span className="ml-auto bg-white/15 text-white/80 text-xs font-medium px-2 py-0.5 rounded-full border border-white/30">
              {upcoming.length}
            </span>
          )}
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {upcoming.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-6">{t("noUpcomingDeadlines")}</p>
          ) : (
            upcoming.map((task) => (
              <TaskItem key={task.taskId} task={task} type="upcoming" t={t} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeadlineHealth;

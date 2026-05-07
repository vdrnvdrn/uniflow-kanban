import { useTranslation } from "react-i18next";

// Inline SVG icons with consistent styling (stroke: 1.5, rounded)
const IconClipboard = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
  </svg>
);

const IconCheckCircle = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconClock = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconAlertTriangle = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const cardDefs = [
  { key: "totalTasks", labelKey: "totalTasks", Icon: IconClipboard },
  { key: "completedTasks", labelKey: "completed", Icon: IconCheckCircle },
  { key: "inProgressTasks", labelKey: "inProgress", Icon: IconClock },
  { key: "overdueTasks", labelKey: "overdue", Icon: IconAlertTriangle },
];

const SummaryCards = ({ summary }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cardDefs.map((card) => {
        const IconComponent = card.Icon;
        return (
          <div
            key={card.key}
            className="glass-card-subtle overflow-hidden border-t border-white/30"
          >
            <div className="flex items-center p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3 flex-shrink-0 bg-white/15 text-white/60">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{summary[card.key] ?? 0}</div>
                <div className="text-sm text-white/60">{t(card.labelKey)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;

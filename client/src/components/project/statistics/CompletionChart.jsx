import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTranslation } from "react-i18next";

ChartJS.register(ArcElement, Tooltip, Legend);

const CompletionChart = ({ summary }) => {
  const { t } = useTranslation();
  const { completedTasks = 0, inProgressTasks = 0, todoTasks = 0, completionPercent = 0 } = summary;

  const data = {
    labels: [t("completed"), t("inProgress"), t("notStarted")],
    datasets: [
      {
        data: [completedTasks, inProgressTasks, todoTasks],
        backgroundColor: ["#f59e0b", "#ea580c", "#374151"],
        borderColor: ["#d97706", "#c2410c", "#4B5563"],
        borderWidth: 1,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: () => "",
          label: (ctx) => {
            const total = completedTasks + inProgressTasks + todoTasks;
            const pct = total > 0 ? Math.round((ctx.raw / total) * 100) : 0;
            return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
          },
        },
      },
    },
  };

  const legendItems = [
    { label: t("completed"), color: "#f59e0b" },
    { label: t("inProgress"), color: "#ea580c" },
    { label: t("notStarted"), color: "#374151" },
  ];

  return (
    <div className="glass-card p-5 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-white mb-4">{t("taskDistribution")}</h3>
      <div className="relative w-[220px] h-[220px]">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-white">{completionPercent}%</span>
          <span className="text-xs text-white/50">{t("completedLabel")}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-white/60">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletionChart;

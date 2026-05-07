import api from "../../api";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SummaryCards from "./statistics/SummaryCards";
import CompletionChart from "./statistics/CompletionChart";
import MemberBreakdown from "./statistics/MemberBreakdown";
import DeadlineHealth from "./statistics/DeadlineHealth";

const Statistics = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const { state } = useLocation();
    const { project } = state;

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get(`/api/project/${project.id}/statistics`);
            setStats(data);
        } catch {
            // silently ignore
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-white/50 text-lg">{t("loadingStatistics")}</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-white/60 text-lg">{t("errorLoadingStatistics")}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Section 1: Summary KPI Cards */}
            <SummaryCards summary={stats.summary} />

            {/* Section 2: Chart + Member Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                    <CompletionChart summary={stats.summary} />
                </div>
                <div className="lg:col-span-2">
                    <MemberBreakdown members={stats.memberBreakdown} />
                </div>
            </div>

            {/* Section 3: Deadline Health */}
            <DeadlineHealth deadlineHealth={stats.deadlineHealth} />
        </div>
    );
};

export default Statistics;

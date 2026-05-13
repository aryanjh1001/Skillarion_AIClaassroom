import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import Charts from "../components/Charts";
import DayStatusCard from "../components/DayStatusCard";
import AIInsights from "../components/AIInsights";
import Notifications from "../components/Notifications";
import ProgressCard from "../components/ProgressCard";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { listenLeaveRequests } from "../services/leaveServices";
import type { LeaveRequest } from "../services/leaveServices";

type PrincipalData = {
  name: string;
  totalStudents: number;
  faculty: number;
  departments: number;
  institutionPerformance: number;
  healthIndex: number;
  criticalAlerts: number;
  topDepartment: string;
  chartData: { name: string; value: number }[];
};

type TabType = "dashboard" | "leaves" | "alerts" | "performance";

const smartAlerts = [
  "12 students are below 75% attendance",
  "CSE department has highest performance this week",
  "3 leave requests require urgent review",
];

const card =
  "card-hover rounded-3xl border border-slate-200/60 bg-white/90 p-6 text-slate-900 shadow-card backdrop-blur-xl transition dark:border-blue-500/10 dark:bg-[#0C1330] dark:text-white";

const inner =
  "card-hover rounded-2xl border border-slate-200/40 bg-slate-50 p-4 text-slate-700 dark:border-blue-500/10 dark:bg-[#111B44] dark:text-white";

const SectionHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="card-hover mb-6 rounded-3xl border border-slate-200/60 bg-white/90 p-6 text-slate-900 shadow-card backdrop-blur-xl dark:border-blue-500/10 dark:bg-[#0C1330] dark:text-white">
    <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">
      {title}
    </h2>
    <p className="mt-2 text-slate-500 dark:text-slate-400">{description}</p>
  </div>
);

export default function PrincipalDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [data, setData] = useState<PrincipalData | null>(null);
  const [leaveOverview, setLeaveOverview] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "dashboards", "principal"));

      if (snap.exists()) {
        setData(snap.data() as PrincipalData);
      }
    };

    fetchData();

    const unsubscribe = listenLeaveRequests((leaves) => {
      setLeaveOverview(leaves);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<TabType>;
      setActiveTab(customEvent.detail);
    };

    window.addEventListener("principalTabChange", handler);

    return () => {
      window.removeEventListener("principalTabChange", handler);
    };
  }, []);

  if (!data) {
    return (
      <MainLayout>
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </MainLayout>
    );
  }

  const totalLeaves = leaveOverview.length;
  const pendingLeaves = leaveOverview.filter(
    (leave) => leave.status === "Pending"
  ).length;
  const approvedLeaves = leaveOverview.filter(
    (leave) => leave.status === "Approved"
  ).length;
  const rejectedLeaves = leaveOverview.filter(
    (leave) => leave.status === "Rejected"
  ).length;

  return (
    <MainLayout>
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Principal Dashboard
        </h1>

        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Welcome back, {data.name} 👋
        </p>
      </div>

      {activeTab === "dashboard" && (
        <>
          <SectionHeader
            title="Institution Overview"
            description="Institution-wide overview of students, faculty, departments and academic performance."
          />

          <div className="grid gap-6 md:grid-cols-5">
            <DayStatusCard />

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Students
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {data.totalStudents}
              </h2>
            </div>

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Faculty
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{data.faculty}</h2>
            </div>

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Departments
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{data.departments}</h2>
            </div>

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Performance
              </p>
              <h2 className="mt-2 text-3xl font-black text-gold-600 dark:text-blue-400">
                {data.institutionPerformance}%
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <ProgressCard
              label="Institution Performance"
              value={data.institutionPerformance}
            />
            <Notifications />
          </div>

          <AIInsights role="principal" />
        </>
      )}

      {activeTab === "leaves" && (
        <>
          <SectionHeader
            title="Leave Overview"
            description="Monitor leave statistics across the institution including pending, approved and rejected requests."
          />

          <div className={card}>
            <h2 className="mb-4 text-xl font-black text-gold-600 dark:text-blue-400">
              Leave Statistics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className={inner}>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Leaves
                </p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalLeaves}</h3>
              </div>

              <div className={inner}>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pending
                </p>
                <h3 className="text-3xl font-black text-gold-600 dark:text-blue-400">
                  {pendingLeaves}
                </h3>
              </div>

              <div className={inner}>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Approved
                </p>
                <h3 className="text-3xl font-black text-emerald-500">
                  {approvedLeaves}
                </h3>
              </div>

              <div className={inner}>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Rejected
                </p>
                <h3 className="text-3xl font-black text-red-500 dark:text-red-400">
                  {rejectedLeaves}
                </h3>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "alerts" && (
        <>
          <SectionHeader
            title="Smart Institutional Alerts"
            description="Review important institutional alerts and areas that require academic attention."
          />

          <div className={card}>
            <h2 className="mb-4 text-xl font-black text-accent-blue">
              Active Alerts
            </h2>

            <div className="space-y-3">
              {smartAlerts.map((alert, index) => (
                <div key={index} className={`${inner} border-l-4 border-l-gold-500`}>
                  {alert}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "performance" && (
        <>
          <SectionHeader
            title="Institution Performance"
            description="Track institutional growth, health index, critical alerts and top department performance."
          />

          <div className={card}>
            <Charts
              title1="Institution Growth"
              title2="Monthly Performance"
              data={data.chartData}
            />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className={card}>
              <h2 className="mb-2 text-xl font-black text-gold-600 dark:text-blue-400">
                Institutional Health Index
              </h2>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{data.healthIndex}/100</p>
            </div>

            <div className={card}>
              <h2 className="mb-2 text-xl font-black text-red-500 dark:text-red-400">
                Critical Alerts
              </h2>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{data.criticalAlerts}</p>
            </div>

            <div className={card}>
              <h2 className="mb-2 text-xl font-black text-accent-blue">
                Top Department
              </h2>
              <p className="text-3xl font-black text-gold-600 dark:text-blue-400">{data.topDepartment}</p>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}
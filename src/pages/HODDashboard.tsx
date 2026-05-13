import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import Charts from "../components/Charts";
import DayStatusCard from "../components/DayStatusCard";
import AIInsights from "../components/AIInsights";
import Notifications from "../components/Notifications";
import ProgressCard from "../components/ProgressCard";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  listenLeaveRequests,
  updateLeaveStatus,
} from "../services/leaveServices";
import type { LeaveRequest } from "../services/leaveServices";

type HODData = {
  name: string;
  departments: number;
  faculty: number;
  reports: number;
  averageScore: number;
  attendanceRate: number;
  studentsAtRisk: number;
  bestDepartment: string;
  chartData: { name: string; value: number }[];
};

type TabType = "dashboard" | "leaves" | "timetable" | "performance";

const departmentSchedule: Record<string, string[]> = {
  cse: [
    "CSE - AI Lab - 9:00 AM",
    "CSE - Data Structures - 11:00 AM",
  ],
  ece: [
    "ECE - Digital Systems - 11:00 AM",
    "ECE - VLSI Lab - 2:00 PM",
  ],
  eee: [
    "EEE - Power Systems - 10:00 AM",
    "EEE - Machines Lab - 1:00 PM",
  ],
  mech: [
    "MECH - CAD Lab - 9:30 AM",
    "MECH - Thermal Engineering - 12:00 PM",
  ],
};

const card =
  "card-hover rounded-3xl border border-slate-200/60 bg-white/90 p-6 text-slate-900 shadow-card backdrop-blur-xl transition dark:border-blue-500/10 dark:bg-[#0C1330] dark:text-white";

const inner =
  "card-hover rounded-2xl border border-slate-200/40 bg-slate-50 p-4 text-slate-700 dark:border-blue-500/10 dark:bg-[#111B44] dark:text-white";

const btn =
  "rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 dark:from-blue-600 dark:to-blue-400 px-5 py-2 font-semibold text-slate-900 shadow-md shadow-gold-600/15 dark:shadow-blue-600/15 transition hover:scale-105 hover:shadow-gold-600/25 dark:hover:shadow-blue-600/25";

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

export default function HODDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [data, setData] = useState<HODData | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const selectedBranch = localStorage.getItem("hodBranch") || "cse";
  const schedule = departmentSchedule[selectedBranch] || [];

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(
        doc(db, "dashboards", `hod_${selectedBranch}`)
      );

      if (snap.exists()) {
        setData(snap.data() as HODData);
      } else {
        console.log("No dashboard found for:", `hod_${selectedBranch}`);
      }
    };

    fetchData();

    const unsubscribe = listenLeaveRequests((items) => {
      setLeaves(
        items.filter(
          (leave) =>
            leave.status === "Pending" &&
            leave.department?.toLowerCase() === selectedBranch
        )
      );
    });

    return () => unsubscribe();
  }, [selectedBranch]);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<TabType>;
      setActiveTab(customEvent.detail);
    };

    window.addEventListener("hodTabChange", handler);

    return () => {
      window.removeEventListener("hodTabChange", handler);
    };
  }, []);

  const update = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await updateLeaveStatus(id, status);
    } catch {
      alert("Failed to update leave status");
    }
  };

  if (!data) {
    return (
      <MainLayout>
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          {selectedBranch.toUpperCase()} HOD Dashboard
        </h1>

        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Welcome back, {data.name} 👋
        </p>
      </div>

      {activeTab === "dashboard" && (
        <>
          <SectionHeader
            title={`${selectedBranch.toUpperCase()} HOD Overview`}
            description="Monitor department-level academics, faculty activity, reports and attendance performance."
          />

          <div className="grid gap-6 md:grid-cols-5">
            <DayStatusCard />

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Departments
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {data.departments}
              </h2>
            </div>

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Faculty
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {data.faculty}
              </h2>
            </div>

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Reports
              </p>
              <h2 className="mt-2 text-3xl font-black text-gold-600 dark:text-blue-400">
                {data.reports}
              </h2>
            </div>

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Avg Score
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {data.averageScore}%
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <ProgressCard
              label={`${selectedBranch.toUpperCase()} Attendance Rate`}
              value={data.attendanceRate}
            />
            <Notifications department={selectedBranch} />
          </div>

          <AIInsights role="hod" department={selectedBranch} />
        </>
      )}

      {activeTab === "leaves" && (
        <>
          <SectionHeader
            title={`${selectedBranch.toUpperCase()} Leave Monitoring`}
            description="Review pending leave requests for this department and take approval or rejection actions."
          />

          <div className={card}>
            <h2 className="mb-4 text-xl font-black text-gold-600 dark:text-blue-400">
              Pending Leave Requests
            </h2>

            {leaves.length > 0 ? (
              <div className="space-y-3">
                {leaves.map((leave) => (
                  <div key={leave.id} className={inner}>
                    <p>
                      <b>Name:</b> {leave.studentName}
                    </p>
                    <p>
                      <b>From:</b> {leave.fromDate}
                    </p>
                    <p>
                      <b>To:</b> {leave.toDate}
                    </p>
                    <p>
                      <b>Reason:</b> {leave.reason}
                    </p>

                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => leave.id && update(leave.id, "Approved")}
                        className="rounded-xl bg-accent-emerald px-4 py-2 font-semibold text-navy-900 shadow-sm transition hover:brightness-110"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => leave.id && update(leave.id, "Rejected")}
                        className="rounded-xl bg-accent-rose px-4 py-2 font-semibold text-navy-900 shadow-sm transition hover:brightness-110"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                No pending leave requests for {selectedBranch.toUpperCase()} 📭
              </p>
            )}
          </div>
        </>
      )}

      {activeTab === "timetable" && (
        <>
          <SectionHeader
            title={`${selectedBranch.toUpperCase()} Department Timetable`}
            description="View department schedules, labs, sessions and planned academic activities."
          />

          <div className={card}>
            <h2 className="mb-4 text-xl font-black text-accent-blue">
              Department Timetable Overview
            </h2>

            <div className="space-y-3">
              {schedule.map((item, index) => (
                <div key={index} className={inner}>
                  {item}
                </div>
              ))}
            </div>

            <button className={`mt-4 ${btn}`}>View Full Timetable</button>
          </div>
        </>
      )}

      {activeTab === "performance" && (
        <>
          <SectionHeader
            title={`${selectedBranch.toUpperCase()} Department Performance`}
            description="Analyze department performance, attendance rate, risk indicators and top-performing areas."
          />

          <div className={card}>
            <Charts
              title1={`${selectedBranch.toUpperCase()} Performance`}
              title2="Department Trend"
              data={data.chartData}
            />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className={card}>
              <h2 className="mb-2 text-xl font-black text-gold-600 dark:text-blue-400">
                Attendance Rate
              </h2>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {data.attendanceRate}%
              </p>
            </div>

            <div className={card}>
              <h2 className="mb-2 text-xl font-black text-red-500 dark:text-red-400">
                Students At Risk
              </h2>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {data.studentsAtRisk}
              </p>
            </div>

            <div className={card}>
              <h2 className="mb-2 text-xl font-black text-accent-blue">
                Best Department
              </h2>
              <p className="text-3xl font-black text-gold-600 dark:text-blue-400">
                {data.bestDepartment}
              </p>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}
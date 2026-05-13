import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import Charts from "../components/Charts";
import DayStatusCard, {
  getCurrentDayStatus,
} from "../components/DayStatusCard";
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

type TeacherData = {
  name: string;
  classes: number;
  students: number;
  assignmentsGiven: number;
  averageScore: number;
  atRiskStudents: number;
  upcomingExam: string;
  chartData: { name: string; value: number }[];
};

type TabType =
  | "dashboard"
  | "classes"
  | "leaves"
  | "attendance"
  | "exams"
  | "performance";

const timetable: Record<string, string[]> = {
  Monday: ["Class 10-A Maths", "Class 9-B AI Basics"],
  Tuesday: ["Class 8-A Computer Science"],
  Wednesday: ["Class 10-A Revision", "Project Review"],
  Thursday: ["Class 9-B Lab"],
  Friday: ["Weekly Assessment"],
  Saturday: ["Doubt Session"],
};

const card =
  "card-hover rounded-3xl border border-slate-200/60 bg-white/90 p-6 text-slate-900 shadow-card backdrop-blur-xl transition dark:border-blue-500/10 dark:bg-[#0C1330] dark:text-white";

const inner =
  "card-hover mb-3 rounded-2xl border border-slate-200/40 bg-slate-50 p-4 text-slate-700 dark:border-blue-500/10 dark:bg-[#111B44] dark:text-white";

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

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [data, setData] = useState<TeacherData | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const day = getCurrentDayStatus();
  const schedule = day.isWorkingDay ? timetable[day.dayName] || [] : [];

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "dashboards", "teacher"));
      if (snap.exists()) setData(snap.data() as TeacherData);
    };

    fetch();

    const unsub = listenLeaveRequests((l) =>
      setLeaves(l.filter((i) => i.status === "Pending"))
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<TabType>;
      setActiveTab(customEvent.detail);
    };

    window.addEventListener("teacherTabChange", handler);

    return () => {
      window.removeEventListener("teacherTabChange", handler);
    };
  }, []);

  const update = (id: string, status: "Approved" | "Rejected") =>
    updateLeaveStatus(id, status);

  if (!data) {
    return (
      <MainLayout>
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Welcome Banner */}
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Teacher Dashboard
        </h1>
 
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Welcome back, {data.name} 👋
        </p>
      </div>

      {activeTab === "dashboard" && (
        <>
          <SectionHeader
            title="Teacher Overview"
            description="Overview of today's classes, total students, pending leave requests and class performance insights."
          />

          <div className="grid gap-6 md:grid-cols-5">
            <DayStatusCard />

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Today Classes
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{schedule.length}</h2>
            </div>

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Students
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{data.students}</h2>
            </div>

            <div className={card}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pending Leaves
              </p>
              <h2 className="mt-2 text-3xl font-black text-gold-600 dark:text-blue-400">{leaves.length}</h2>
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
            <ProgressCard label="Class Performance" value={data.averageScore} />
            <Notifications />
          </div>

          <AIInsights role="teacher" />
        </>
      )}

      {activeTab === "classes" && (
        <>
          <SectionHeader
            title="Class Schedule"
            description="Review today's teaching schedule, planned sessions and classroom responsibilities."
          />

          <div className={card}>
            <h2 className="mb-4 text-xl font-black text-gold-600 dark:text-blue-400">
              Today Schedule
            </h2>

            {schedule.length ? (
              schedule.map((s, i) => (
                <div key={i} className={inner}>
                  {s}
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                No classes today
              </p>
            )}
          </div>
        </>
      )}

      {activeTab === "leaves" && (
        <>
          <SectionHeader
            title="Student Leave Requests"
            description="Review pending student leave applications and take approval or rejection actions."
          />

          <div className={card}>
            <h2 className="mb-4 text-xl font-black text-accent-blue">
              Leave Requests
            </h2>

            {leaves.length ? (
              leaves.map((l) => (
                <div key={l.id} className={inner}>
                  <p>
                    <b>{l.studentName}</b>
                  </p>
                  <p>{l.fromDate} → {l.toDate}</p>
                  <p>{l.reason}</p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => l.id && update(l.id, "Approved")}
                      className="rounded-xl bg-accent-emerald px-4 py-2 font-semibold text-navy-900 shadow-sm transition hover:brightness-110"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => l.id && update(l.id, "Rejected")}
                      className="rounded-xl bg-accent-rose px-4 py-2 font-semibold text-navy-900 shadow-sm transition hover:brightness-110"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                No pending leaves
              </p>
            )}
          </div>
        </>
      )}

      {activeTab === "attendance" && (
        <>
          <SectionHeader
            title="Attendance Management"
            description="Mark and manage student attendance for today's classes."
          />

          <div className={card}>
            <h2 className="mb-3 text-xl font-black text-gold-600 dark:text-blue-400">
              Mark Attendance
            </h2>

            <p className="mb-4 text-slate-500 dark:text-slate-400">
              Select a class and mark students as present or absent.
            </p>

            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <select className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white">
                <option>Class 10-A Maths</option>
                <option>Class 9-B AI Basics</option>
                <option>Class 8-A Computer Science</option>
              </select>

              <input
                type="date"
                className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white"
              />
            </div>

            <div className="space-y-3">
              {["Aarav", "Meera", "Charan", "Diya", "Rahul"].map((student) => (
                <div
                  key={student}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/50 bg-slate-50 p-4 dark:border-blue-500/10 dark:bg-[#111B44]"
                >
                  <p className="font-semibold">{student}</p>

                  <div className="flex gap-2">
                    <button className="rounded-xl bg-accent-emerald px-4 py-2 text-sm font-bold text-navy-900">
                      Present
                    </button>
                    <button className="rounded-xl bg-accent-rose px-4 py-2 text-sm font-bold text-navy-900">
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className={`${btn} mt-5`}>Submit Attendance</button>
          </div>
        </>
      )}

      {activeTab === "exams" && (
        <>
          <SectionHeader
            title="Create Exam"
            description="Create and schedule exams, tests and assessments for students."
          />

          <div className={card}>
            <h2 className="mb-4 text-xl font-black text-accent-blue">
              Exam Details
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Exam Title"
                className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white"
              />

              <select className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white">
                <option>Class 10-A Maths</option>
                <option>Class 9-B AI Basics</option>
                <option>Class 8-A Computer Science</option>
              </select>

              <input
                type="date"
                className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white"
              />

              <input
                type="time"
                placeholder="Select Time"
                className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 [color-scheme:dark] outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white"
              />

              <input
                type="number"
                placeholder="Total Marks"
                className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none appearance-auto focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white"
              />

              <input
                type="number"
                placeholder="Duration in minutes"
                className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none appearance-auto focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white"
              />
            </div>

            <textarea
              placeholder="Exam instructions"
              rows={4}
              className="mt-4 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white"
            />

            <button className={`${btn} mt-5`}>Create Exam</button>
          </div>
        </>
      )}

      {activeTab === "performance" && (
        <>
          <SectionHeader
            title="Class Performance"
            description="Track class activity, weekly trends, at-risk students and upcoming assessments."
          />

          <div className={card}>
            <Charts
              title1="Class Activity"
              title2="Weekly Trend"
              data={data.chartData}
            />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className={card}>
              <h2 className="mb-2 text-xl font-black text-gold-600 dark:text-blue-400">
                At Risk Students
              </h2>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {data.atRiskStudents}
              </p>
            </div>

            <div className={card}>
              <h2 className="mb-2 text-xl font-black text-accent-blue">
                Upcoming Exam
              </h2>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                {data.upcomingExam}
              </p>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}
import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import Charts from "../components/Charts";
import Loading from "../components/Loading";
import Error from "../components/Error";
import DayStatusCard, {
  getCurrentDayStatus,
} from "../components/DayStatusCard";
import AIInsights from "../components/AIInsights";
import Notifications from "../components/Notifications";
import ProgressCard from "../components/ProgressCard";
import { getStudentDoc } from "../services/firestore";
import { applyLeave, listenLeaveRequests } from "../services/leaveServices";
import type { LeaveRequest } from "../services/leaveServices";

type StudentData = {
  name: string;
  attendance: number;
  grade: string;
  chartData?: { name: string; value: number }[];
  rank: number;
  percentile: number;
  feedback: string;
  weakArea: string;
  leaderboardName: string;
  nearestCompetitor: string;
  competitorDelta: number;
  recommendedTopic: string;
  practiceLevel: string;
  practiceQuestions: number;
};

type TabType =
  | "dashboard"
  | "classes"
  | "attendance"
  | "leave"
  | "exams"
  | "performance";

const timetable: Record<string, string[]> = {
  Monday: ["Maths - 9:00 AM", "Physics - 10:30 AM", "AI Lab - 1:00 PM"],
  Tuesday: ["English - 9:00 AM", "Chemistry - 11:00 AM", "Coding - 2:00 PM"],
  Wednesday: ["Maths - 9:30 AM", "Biology - 11:00 AM", "Aptitude - 3:00 PM"],
  Thursday: ["Physics Lab - 10:00 AM", "Computer Science - 12:00 PM"],
  Friday: ["Chemistry - 9:00 AM", "Project Session - 1:30 PM"],
  Saturday: ["Weekly Test - 10:00 AM", "Doubt Session - 12:00 PM"],
};

const examsToday = [
  { subject: "Mathematics Quiz", time: "2:00 PM", status: "Available" },
  { subject: "Physics MCQ Test", time: "4:00 PM", status: "Upcoming" },
];

const cardClass =
  "card-hover rounded-3xl border border-slate-200/60 bg-white/90 p-6 text-slate-900 shadow-card backdrop-blur-xl transition dark:border-blue-500/10 dark:bg-[#0C1330] dark:text-white";

const innerCardClass =
  "card-hover rounded-2xl border border-slate-200/40 bg-slate-50 p-4 text-slate-800 dark:border-blue-500/10 dark:bg-[#111B44] dark:text-slate-100";

const buttonClass =
  "rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 dark:from-blue-600 dark:to-blue-400 px-5 py-2 font-semibold text-navy-900 shadow-md shadow-gold-600/15 dark:shadow-blue-600/15 transition hover:scale-105 hover:shadow-gold-600/25 dark:hover:shadow-blue-600/25";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 backdrop-blur-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-white/10 dark:bg-[#111B44] dark:text-white dark:placeholder:text-slate-500";

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

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [data, setData] = useState<StudentData | null>(null);
  const [error, setError] = useState("");

  const [leaveReason, setLeaveReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [department, setDepartment] = useState("cse");
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);

  const dayStatus = getCurrentDayStatus();

  const todaySchedule = dayStatus.isWorkingDay
    ? timetable[dayStatus.dayName] || []
    : [];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getStudentDoc();
        if (!res) setError("No data found");
        else setData(res);
      } catch {
        setError("Failed to load data");
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!data?.name) return;

    const unsubscribe = listenLeaveRequests((leaves) => {
      const filteredLeaves = leaves.filter(
        (leave) =>
          leave.studentName.toLowerCase().trim() ===
          data.name.toLowerCase().trim()
      );

      setMyLeaves(filteredLeaves);
    });

    return () => unsubscribe();
  }, [data]);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<TabType>;
      setActiveTab(customEvent.detail);
    };

    window.addEventListener("studentTabChange", handler);

    return () => {
      window.removeEventListener("studentTabChange", handler);
    };
  }, []);

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data) return;

    try {
      await applyLeave({
        studentName: data.name,
        role: "Student",
        department,
        reason: leaveReason,
        fromDate,
        toDate,
      });

      alert("Leave application submitted successfully!");
      setLeaveReason("");
      setFromDate("");
      setToDate("");
      setDepartment("cse");
    } catch {
      alert("Failed to submit leave request");
    }
  };

  if (error) {
    return (
      <MainLayout>
        <Error message={error} />
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Student Dashboard
        </h1>

        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Welcome back, {data.name} 👋
        </p>
      </div>

      {activeTab === "dashboard" && (
        <>
          <SectionHeader
            title="Dashboard Overview"
            description="Quick overview of your attendance, classes, exams, leave requests and AI-powered academic insights."
          />

          <div className="grid gap-6 md:grid-cols-5">
            <DayStatusCard />

            <div className={cardClass}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Attendance
              </p>
              <h2 className="mt-2 text-3xl font-black text-gold-600 dark:text-blue-400">
                {data.attendance}%
              </h2>
            </div>

            <div className={cardClass}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Today Classes
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {todaySchedule.length}
              </h2>
            </div>

            <div className={cardClass}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Exams Today
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {dayStatus.isWorkingDay ? examsToday.length : 0}
              </h2>
            </div>

            <div className={cardClass}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Leave Requests
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {myLeaves.length}
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <ProgressCard label="Attendance Progress" value={data.attendance} />
            <Notifications />
          </div>

          <AIInsights role="student" />
        </>
      )}

      {activeTab === "classes" && (
        <>
          <SectionHeader
            title="Classes & Timetable"
            description="View your daily timetable, scheduled classes, lab sessions and academic activities."
          />

          <div className={cardClass}>
            <h2 className="mb-4 text-xl font-black text-gold-600 dark:text-blue-400">
              Today's Timetable
            </h2>

            {todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div key={index} className={innerCardClass}>
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                No classes scheduled today because it is a leave day.
              </p>
            )}
          </div>
        </>
      )}

      {activeTab === "attendance" && (
        <>
          <SectionHeader
            title="Attendance Overview"
            description="Monitor your attendance percentage and maintain the required academic attendance level."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={cardClass}>
              <h2 className="mb-3 text-xl font-black text-gold-600 dark:text-blue-400">
                Current Attendance
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your current attendance percentage
              </p>
              <h3 className="mt-4 text-5xl font-black text-slate-900 dark:text-white">
                {data.attendance}%
              </h3>
            </div>

            <ProgressCard label="Attendance Progress" value={data.attendance} />
          </div>
        </>
      )}

      {activeTab === "leave" && (
        <>
          <SectionHeader
            title="Leave Application"
            description="Apply for leave and track the approval status of your submitted leave requests."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={cardClass}>
              <h2 className="mb-4 text-xl font-black text-accent-blue">
                Apply Leave
              </h2>

              <form onSubmit={handleLeaveSubmit}>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={`${inputClass} mb-4`}
                  required
                >
                  <option className="text-black" value="cse">
                    CSE
                  </option>
                  <option className="text-black" value="ece">
                    ECE
                  </option>
                  <option className="text-black" value="eee">
                    EEE
                  </option>
                  <option className="text-black" value="mech">
                    MECH
                  </option>
                </select>

                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      From
                    </label>

                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      To
                    </label>

                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Enter your leave reason..."
                  className={`${inputClass} h-32 resize-none p-4`}
                  required
                />

                <button className={`mt-4 ${buttonClass}`}>
                  Submit Leave Request
                </button>
              </form>
            </div>

            <div className={cardClass}>
              <h2 className="mb-4 text-xl font-black text-gold-600 dark:text-blue-400">
                My Leave Requests
              </h2>

              {myLeaves.length > 0 ? (
                <div className="space-y-3">
                  {myLeaves.map((leave) => (
                    <div key={leave.id} className={innerCardClass}>
                      <p>
                        <b>Department:</b> {leave.department?.toUpperCase()}
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
                      <p>
                        <b>Status:</b>{" "}
                        <span
                          className={
                            leave.status === "Approved"
                              ? "font-bold text-accent-emerald"
                              : leave.status === "Rejected"
                              ? "font-bold text-accent-rose"
                              : "font-bold text-gold-600 dark:text-blue-400"
                          }
                        >
                          {leave.status}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">
                  No leave requests submitted yet 📭
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "exams" && (
        <>
          <SectionHeader
            title="Exams & Attempts"
            description="Check available tests, upcoming exams and your daily exam attempt status."
          />

          <div className={cardClass}>
            <h2 className="mb-4 text-xl font-black text-accent-blue">
              Exam Attempts
            </h2>

            {dayStatus.isWorkingDay ? (
              <div className="grid gap-4 md:grid-cols-2">
                {examsToday.map((exam, index) => (
                  <div key={index} className={innerCardClass}>
                    <h3 className="font-black text-slate-900 dark:text-white">
                      {exam.subject}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      {exam.time}
                    </p>

                    <button className={`mt-3 ${buttonClass}`}>
                      {exam.status === "Available" ? "Attempt Now" : "Upcoming"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                No exams available on leave day.
              </p>
            )}
          </div>
        </>
      )}

      {activeTab === "performance" && (
        <>
          <SectionHeader
            title="Performance Insights"
            description="Analyze your progress, feedback, weak areas, leaderboard rank and adaptive practice suggestions."
          />

          <div className={cardClass}>
            <Charts
              title1="Performance Trend"
              title2="Weekly Performance"
              data={data.chartData}
            />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className={cardClass}>
              <h2 className="mb-2 text-xl font-black text-gold-600 dark:text-blue-400">
                Recent Feedback
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                {data.feedback}
              </p>
            </div>

            <div className={cardClass}>
              <h2 className="mb-2 text-xl font-black text-accent-blue">
                Weak Area
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                {data.weakArea}
              </p>
            </div>
          </div>

          <div className={`mt-8 ${cardClass}`}>
            <h2 className="mb-3 text-xl font-black text-gold-600 dark:text-blue-400">
              Leaderboard
            </h2>
            <p>
              <b>Student:</b> {data.leaderboardName}
            </p>
            <p>
              <b>Rank:</b> #{data.rank}
            </p>
            <p>
              <b>Competitor:</b> {data.nearestCompetitor} +
              {data.competitorDelta}
            </p>
          </div>

          <div className={`mt-8 ${cardClass}`}>
            <h2 className="mb-3 text-xl font-black text-gold-600 dark:text-blue-400">
              Adaptive Practice
            </h2>
            <p>
              <b>Topic:</b> {data.recommendedTopic}
            </p>
            <p>
              <b>Level:</b> {data.practiceLevel}
            </p>
            <p>
              <b>Questions:</b> {data.practiceQuestions}
            </p>

            <button className={`mt-4 ${buttonClass}`}>Start Practice</button>
          </div>
        </>
      )}
    </MainLayout>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { Eye, EyeOff } from "lucide-react";

type SignupRole = "student" | "teacher" | "hod" | "principal";

const roles = [
  {
    key: "student" as SignupRole,
    title: "Student",
    desc: "Access attendance, exams, leave requests and performance insights.",
    icon: "🎓",
  },
  {
    key: "teacher" as SignupRole,
    title: "Teacher",
    desc: "Manage classes, students, leave approvals and academic activities.",
    icon: "📘",
  },
  {
    key: "hod" as SignupRole,
    title: "HOD",
    desc: "Monitor department analytics, faculty reports and student progress.",
    icon: "📊",
  },
  {
    key: "principal" as SignupRole,
    title: "Principal",
    desc: "View institution-wide performance, summaries and key insights.",
    icon: "🏫",
  },
];

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<SignupRole>("student");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    localStorage.setItem(
      "signupUser",
      JSON.stringify({
        name,
        email,
        mobile: `${countryCode} ${mobile}`,
        role: selectedRole,
      })
    );

    alert(`${selectedRole.toUpperCase()} account created successfully!`);
    navigate("/login");
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:focus:border-blue-500 dark:focus:ring-blue-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white dark:placeholder:text-slate-500";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 text-slate-900 transition-colors duration-300 dark:bg-[#020817] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl dark:bg-accent-blue/12"></div>
      </div>

      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={index}
            className="particle-node"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[420px] rounded-3xl border border-slate-200/60 bg-white/90 p-8 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0f172a]/90 dark:shadow-card dark:text-white">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => (step === "form" ? setStep("role") : navigate("/"))}
            className="text-sm font-semibold text-gold-600 dark:text-blue-400 transition hover:text-gold-800 dark:hover:text-blue-300 dark:text-blue-400"
          >
            {step === "form" ? "← Back" : "← Go to Home"}
          </button>

          <ThemeToggle />
        </div>

        {step === "role" ? (
          <>
            <h1 className="mb-2 text-center font-display text-3xl font-black">
              <span className="gradient-text-gold">Choose Your Account</span>
            </h1>

            <p className="mb-6 text-center text-slate-500 dark:text-slate-400">
              Select your role to access role-specific features.
            </p>

            <div className="space-y-4">
              {roles.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setSelectedRole(role.key)}
                  className={`w-full rounded-2xl border p-4 text-left transition hover:scale-[1.02] ${
                    selectedRole === role.key
                      ? "border-gold-500 bg-gold-500/10 dark:border-blue-400 dark:bg-blue-500/10 shadow-lg shadow-gold-600/10"
                      : "border-slate-300 bg-white/70 dark:border-white/15 dark:bg-[#111B44]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 dark:bg-blue-500/15 text-2xl">
                      {role.icon}
                    </div>

                    <div>
                      <h2 className="font-display text-xl font-black text-slate-900 dark:text-white">
                        {role.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {role.desc}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 dark:from-blue-600 dark:to-blue-400 py-3 font-bold text-navy-900 shadow-lg shadow-gold-600/20 dark:shadow-blue-600/20 transition hover:scale-105 hover:shadow-gold-600/30 dark:hover:shadow-blue-600/30 dark:shadow-blue-600/30"
            >
              Continue
            </button>

            <p
              onClick={() => navigate("/login")}
              className="mt-5 cursor-pointer text-center text-sm font-medium text-gold-600 transition hover:text-accent-blue dark:text-blue-400"
            >
              Already have an account? Sign In
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <span className="text-[56px] leading-none">🧠</span>
            </div>

            <h1 className="mb-2 text-center font-display text-3xl font-black">
              <span className="gradient-text-gold">Create Account</span>
            </h1>

            <p className="mb-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
              Register as{" "}
              <span className="text-gold-600 dark:text-blue-400">
                {selectedRole.toUpperCase()}
              </span>
            </p>

            <p className="mb-6 text-center text-slate-500 dark:text-slate-400">
              Start your AI classroom journey
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Enter your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />

              <input
                type="email"
                placeholder="Enter your Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />

              <div className="flex overflow-hidden rounded-xl border border-slate-300 dark:border-blue-500/15">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-slate-100 px-3 text-slate-900 outline-none dark:bg-[#111B44] dark:text-white"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>

                <input
                  type="tel"
                  placeholder="Enter your Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-white px-4 py-3 text-slate-900 outline-none dark:bg-[#111B44] dark:text-white"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
               </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 dark:from-blue-600 dark:to-blue-400 py-3 font-bold text-navy-900 shadow-lg shadow-gold-600/20 dark:shadow-blue-600/20 transition hover:scale-105 hover:shadow-gold-600/30 dark:hover:shadow-blue-600/30 dark:shadow-blue-600/30"
              >
                Register
              </button>
            </form>

            <p
              onClick={() => navigate("/login")}
              className="mt-5 cursor-pointer text-center text-sm font-medium text-gold-600 transition hover:text-accent-blue dark:text-blue-400"
            >
              Already have an account? Sign In
            </p>
          </>
        )}
      </div>
    </div>
  );
}
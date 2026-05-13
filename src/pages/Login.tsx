import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

type Role = "student" | "teacher" | "hod" | "principal";

const demoCredentials: Record<Role, { email: string; password: string }> = {
  student: {
    email: "student@demo.com",
    password: "student123",
  },
  teacher: {
    email: "teacher@demo.com",
    password: "teacher123",
  },
  hod: {
    email: "hod@demo.com",
    password: "hod123",
  },
  principal: {
    email: "principal@demo.com",
    password: "principal123",
  },
};

export default function Login() {
  const [role, setRoleState] = useState<Role>("student");
  const [hodBranch, setHodBranch] = useState("cse");

  const [email, setEmail] = useState(demoCredentials.student.email);
  const [password, setPassword] = useState(demoCredentials.student.password);
  const [showPassword, setShowPassword] = useState(false);

  const { loginWithGoogle, setRole, resetPassword } = useAuth();

  const navigate = useNavigate();

  const handleRoleChange = (selectedRole: Role) => {
    setRoleState(selectedRole);
    setEmail(demoCredentials[selectedRole].email);
    setPassword(demoCredentials[selectedRole].password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();

    setRole(role);

    if (role === "hod") {
      localStorage.setItem("hodBranch", hodBranch);
    }

    navigate(`/${role}`);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const currentDemo = demoCredentials[role];

    if (email !== currentDemo.email || password !== currentDemo.password) {
      alert(`Please use the demo credentials for ${role}.`);
      return;
    }

    setRole(role);

    if (role === "hod") {
      localStorage.setItem("hodBranch", hodBranch);
    }

    alert("Login successful!");
    navigate(`/${role}`);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    try {
      await resetPassword(email);

      alert(
        `Password reset link sent to ${email}. Please check your Spam/Junk folder if the mail is not visible in Inbox.`
      );
    } catch {
      alert("Failed to send reset email.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 text-slate-900 transition-colors duration-300 dark:bg-[#020817] dark:text-white">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl dark:bg-accent-blue/12"></div>
      </div>

      {/* Floating Particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, index) => (
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

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-3xl border border-slate-200/60 bg-white/90 p-8 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-blue-500/15 dark:bg-[#0C1330]/80 dark:text-white">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-semibold text-gold-600 dark:text-blue-400 transition hover:text-gold-800 dark:hover:text-blue-300 dark:text-blue-400"
          >
            ← Go to Home
          </button>

          <ThemeToggle />
        </div>

        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <span className="text-[56px] leading-none">🧠</span>
        </div>

        {/* Heading */}
        <h2 className="mb-2 text-center font-display text-3xl font-black">
          <span className="gradient-text-gold">Welcome Back</span>
        </h2>

        <p className="mb-6 text-center text-slate-500 dark:text-slate-400">
          Sign in to continue your AI classroom journey
        </p>

        {/* HOD Department Select */}
        {role === "hod" && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold text-slate-400">
              Select Department
            </p>

            <select
              value={hodBranch}
              onChange={(e) => setHodBranch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:focus:border-blue-500 dark:focus:ring-blue-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white"
            >
              <option value="cse">CSE Department</option>
              <option value="ece">ECE Department</option>
              <option value="eee">EEE Department</option>
              <option value="mech">MECH Department</option>
            </select>
         </div>
        )}

        {/* Quick Demo Login */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm dark:border-blue-500/15 dark:bg-[#111B44]/80">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Quick Demo Login
          </p>

          <div className="flex flex-wrap gap-3">
            {Object.keys(demoCredentials).map((demoRole) => (
              <button
                key={demoRole}
                type="button"
                onClick={() => handleRoleChange(demoRole as Role)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300
                ${
                  role === demoRole
                    ? "border-gold-500 bg-gold-100 dark:border-blue-400 dark:bg-blue-500/20 dark:bg-blue-900/30 text-gold-700 dark:text-blue-300 shadow-lg shadow-gold-500/10 dark:shadow-blue-500/10 dark:border-blue-400 dark:bg-blue-500/20 dark:text-blue-300"
                    : "border-slate-300 bg-white text-slate-700 hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-blue-900/15 dark:hover:bg-blue-900/15 dark:bg-blue-900/20 hover:text-gold-700 dark:hover:text-blue-300 dark:text-blue-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                }`}
              >
                {demoRole === "student" && "🎓 Student"}
                {demoRole === "teacher" && "👨‍🏫 Teacher"}
                {demoRole === "hod" && "🏛️ HOD"}
                {demoRole === "principal" && "👑 Principal"}
              </button>
            ))}
          </div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 font-bold text-slate-800 shadow-lg transition hover:scale-105 hover:bg-slate-50 dark:border-white/10 dark:bg-[#111B44] dark:text-white dark:hover:bg-[#162044]"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5"
          />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-300 dark:bg-white/20"></div>
          <span className="text-sm text-slate-500 dark:text-slate-400">OR</span>
          <div className="h-px flex-1 bg-slate-300 dark:bg-white/20"></div>
        </div>

        {/* Email Login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:focus:border-blue-500 dark:focus:ring-blue-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white"
            />

            <Mail
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:focus:border-blue-500 dark:focus:ring-blue-500/30 dark:border-blue-500/15 dark:bg-[#111B44] dark:text-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Forgot Password */}
          <p
            onClick={handleForgotPassword}
            className="cursor-pointer text-right text-sm font-semibold text-gold-600 hover:text-accent-blue dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot Password?
          </p>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 dark:from-blue-600 dark:to-blue-400 py-3 font-bold text-navy-900 shadow-lg shadow-gold-600/20 dark:shadow-blue-600/20 transition hover:scale-105 hover:shadow-gold-600/30 dark:hover:shadow-blue-600/30 dark:shadow-blue-600/30"
          >
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>

        {/* Signup */}
        <p
          onClick={() => navigate("/signup")}
          className="mt-5 cursor-pointer text-center text-sm font-medium text-gold-600 transition hover:text-accent-blue dark:text-blue-400"
        >
          Don't have an account? Sign Up
        </p>
      </div>
    </div>
  );
}
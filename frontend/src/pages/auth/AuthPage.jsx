import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VerifyEmailBanner } from "@/components/auth/VerifyEmailBanner"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

/* ─── Logo Mark ────────────────────────────────────────────── */
function LogoMark({ size = "md" }) {
  const box  = size === "lg" ? "w-14 h-14 rounded-2xl" : size === "sm" ? "w-8 h-8 rounded-xl" : "w-11 h-11 rounded-xl"
  const svg  = size === "lg" ? 28  : size === "sm" ? 18 : 22
  const strokeW = size === "lg" ? 2.2 : 1.8

  return (
    <div className={`${box} bg-[#0f1520] flex items-center justify-center shrink-0 shadow-lg border border-white/5 relative overflow-hidden`}>
      {/* subtle glow */}
      <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
      <svg width={svg} height={svg} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top triangle */}
        <polygon points="11,1 21,10 1,10" fill="white" opacity="0.95" />
        {/* Green separator */}
        <line x1="0" y1="11" x2="22" y2="11" stroke="#10b981" strokeWidth={strokeW} strokeLinecap="round" />
        {/* Bottom triangle */}
        <polygon points="1,12 21,12 11,21" fill="white" opacity="0.95" />
      </svg>
    </div>
  )
}

/* ─── Logo Wordmark ─────────────────────────────────────────── */
function LogoWordmark({ size = "md", darkText = false }) {
  const text = size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-3xl"
  const sub  = size === "sm" ? "text-[0.45rem]" : "text-[0.52rem]"
  const mktColor = darkText ? "text-emerald-950" : "text-slate-800 dark:text-white"
  const subColor = darkText ? "text-emerald-800/60" : "text-slate-400 dark:text-slate-500"

  return (
    <div className="flex flex-col leading-none">
      <span className={`${text} font-black tracking-tighter ${mktColor} leading-tight`}>
        mkt<span className="text-emerald-500">hub</span>
      </span>
      <span className={`${sub} uppercase tracking-[0.2em] ${subColor} font-semibold mt-0.5`}>
        marketplace
      </span>
    </div>
  )
}

/* ─── Full Logo (mark + wordmark) ───────────────────────────── */
function Logo({ size = "md", darkText = false }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} />
      <LogoWordmark size={size} darkText={darkText} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN AUTH PAGE
══════════════════════════════════════════════════════════════ */
export default function AuthPage({ initialMode = "login" }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === "register")
  const [panelState, setPanelState] = useState("idle")
  const [panelContent, setPanelContent] = useState(initialMode === "register" ? "register" : "login")
  const lockRef = useRef(false)

  const toggle = () => {
    if (lockRef.current) return
    lockRef.current = true
    setPanelState("expanding")
    setTimeout(() => {
      setPanelState("sliding")
      setIsSignUp(v => !v)
      setPanelContent(c => c === "login" ? "register" : "login")
    }, 420)
    setTimeout(() => { setPanelState("contracting") }, 1000)
    setTimeout(() => {
      setPanelState("idle")
      lockRef.current = false
    }, 1400)
  }

  // Desktop panel geometry
  const panelLeft  = isSignUp ? "0%" : "50%"
  const panelWidth =
    panelState === "expanding"   ? "62%" :
    panelState === "sliding"     ? "62%" :
    panelState === "contracting" ? "50%" : "50%"

  const widthTransition   = "width 420ms cubic-bezier(0.4,0,0.2,1)"
  const leftTransition    = panelState === "sliding" ? "left 580ms cubic-bezier(0.65,0,0.35,1)" : ""
  const combinedTransition = [widthTransition, leftTransition].filter(Boolean).join(", ")

  return (
    <>
      {/* ══ MOBILE LAYOUT (< md) ══ */}
      <div className="md:hidden min-h-screen
        bg-gradient-to-b from-slate-50 via-white to-slate-100
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
        flex flex-col">

        {/* Header strip */}
        <div className="px-6 pt-10 pb-6 flex flex-col items-center gap-3">
          <Logo size="sm" />
        </div>

        {/* Tab switcher */}
        <div className="mx-6 mb-6 flex rounded-2xl
          bg-slate-200/70 dark:bg-slate-800/60
          p-1 border border-slate-300/60 dark:border-white/5">
          <button
            onClick={() => !isSignUp || toggle()}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              !isSignUp
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => isSignUp || toggle()}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              isSignUp
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form card */}
        <div className="mx-4 flex-1">
          <div className="rounded-3xl
            bg-white dark:bg-slate-900/90
            border border-slate-200 dark:border-white/8
            shadow-xl dark:shadow-2xl shadow-slate-200/80
            overflow-hidden">
            {/* Top accent strip */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

            <div className="p-6 pb-8">
              {!isSignUp ? (
                <MobileLoginPanel onSwitch={toggle} />
              ) : (
                <MobileRegisterPanel onSwitch={toggle} />
              )}
            </div>
          </div>
        </div>

        <div className="h-8" />
      </div>

      {/* ══ DESKTOP LAYOUT (≥ md) ══ */}
      <div className="hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex min-h-[600px] select-none">

          {/* Left: Login */}
          <div className="w-1/2 flex items-center">
            <LoginPanel visible={!isSignUp} onSwitch={toggle} />
          </div>

          {/* Right: Register */}
          <div className="w-1/2 flex items-center border-l border-slate-100 dark:border-slate-800">
            <RegisterPanel visible={isSignUp} onSwitch={toggle} />
          </div>

          {/* Sliding green overlay */}
          <div
            className="absolute top-0 bottom-0 z-30 overflow-hidden"
            style={{
              left: panelLeft,
              width: panelWidth,
              borderRadius: "1.5rem",
              transition: combinedTransition || "none",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <div
              className="relative w-full h-full flex flex-col items-center justify-center text-white overflow-hidden"
              style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)" }}
            >
              {/* Decorative blobs */}
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-emerald-400 pointer-events-none" />
              <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full opacity-10 bg-emerald-400 pointer-events-none" />
              <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full opacity-10 bg-emerald-400 pointer-events-none" />

              <div className="relative z-10 text-center space-y-5 px-10">
                <div className="flex flex-col items-center pb-2 gap-4">
                  <Logo size="lg" darkText />
                </div>

                {panelContent === "login" ? (
                  <>
                    <h3 className="text-2xl font-black leading-tight tracking-tight text-emerald-950">New Here?</h3>
                    <p className="text-sm text-emerald-800 leading-relaxed max-w-[190px] mx-auto">
                      Create an account and discover thousands of products from verified sellers.
                    </p>
                    <button
                      onClick={toggle}
                      className="mt-3 border-2 border-emerald-600 text-emerald-700 font-bold px-10 py-2.5 rounded-full
                                 hover:bg-emerald-600 hover:text-white transition-all duration-200 text-sm tracking-widest shadow-sm"
                    >
                      SIGN UP
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-black leading-tight tracking-tight text-emerald-950">Already a Member?</h3>
                    <p className="text-sm text-emerald-800 leading-relaxed max-w-[190px] mx-auto">
                      Sign in to manage your orders, track deliveries, and access your account.
                    </p>
                    <button
                      onClick={toggle}
                      className="mt-3 border-2 border-emerald-600 text-emerald-700 font-bold px-10 py-2.5 rounded-full
                                 hover:bg-emerald-600 hover:text-white transition-all duration-200 text-sm tracking-widest shadow-sm"
                    >
                      SIGN IN
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Mobile Login Panel ───────────────────────────────────── */
function MobileLoginPanel({ onSwitch }) {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState(null)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setUnverifiedEmail(null)
    try {
      const user = await login(data)
      toast.success(`Welcome back, ${user.name}!`)
      const from = location.state?.from?.pathname
      if (from) navigate(from, { replace: true })
      else if (user.role === "ADMIN")  navigate("/admin")
      else if (user.role === "SELLER") navigate("/seller")
      else navigate("/dashboard")
    } catch (err) {
      if (err.response?.status === 403) setUnverifiedEmail(getValues("email"))
      else toast.error(err.response?.data?.message || "Login failed.")
    } finally { setIsLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <MobileField label="Email" id="m-login-email" error={errors.email?.message}>
          <input id="m-login-email" type="email" placeholder="m@example.com"
            disabled={isLoading} {...register("email")}
            className={mobileInputCls} />
        </MobileField>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="m-login-pw" className={mobileLabelCls}>Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">Forgot?</Link>
          </div>
          <input id="m-login-pw" type="password" disabled={isLoading}
            {...register("password")}
            className={mobileInputCls} />
          {errors.password && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{errors.password.message}</p>}
        </div>

        {unverifiedEmail && <VerifyEmailBanner email={unverifiedEmail} />}

        <MobileSubmitBtn isLoading={isLoading} label="Sign In" loadingLabel="Signing in…" />
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-500 pt-2">
        No account?{" "}
        <button onClick={onSwitch} className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">Sign up</button>
      </p>
    </div>
  )
}

/* ─── Mobile Register Panel ─────────────────────────────────── */
function MobileRegisterPanel({ onSwitch }) {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await registerUser(data)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.")
    } finally { setIsLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create account</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join MarketHub and start exploring</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <MobileField label="Full Name" id="m-reg-name" error={errors.name?.message}>
          <input id="m-reg-name" placeholder="John Doe" disabled={isLoading}
            {...register("name")} className={mobileInputCls} />
        </MobileField>
        <MobileField label="Email" id="m-reg-email" error={errors.email?.message}>
          <input id="m-reg-email" type="email" placeholder="m@example.com"
            disabled={isLoading} {...register("email")} className={mobileInputCls} />
        </MobileField>
        <MobileField label="Password" id="m-reg-pw" error={errors.password?.message}>
          <input id="m-reg-pw" type="password" disabled={isLoading}
            {...register("password")} className={mobileInputCls} />
        </MobileField>

        <MobileSubmitBtn isLoading={isLoading} label="Create Account" loadingLabel="Creating…" />
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-500 pt-2">
        Have an account?{" "}
        <button onClick={onSwitch} className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">Sign in</button>
      </p>
    </div>
  )
}

/* ─── Desktop Login Panel ──────────────────────────────────── */
function LoginPanel({ visible, onSwitch }) {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState(null)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setUnverifiedEmail(null)
    try {
      const user = await login(data)
      toast.success(`Welcome back, ${user.name}!`)
      const from = location.state?.from?.pathname
      if (from) navigate(from, { replace: true })
      else if (user.role === "ADMIN")  navigate("/admin")
      else if (user.role === "SELLER") navigate("/seller")
      else navigate("/dashboard")
    } catch (err) {
      if (err.response?.status === 403) setUnverifiedEmail(getValues("email"))
      else toast.error(err.response?.data?.message || "Login failed.")
    } finally { setIsLoading(false) }
  }

  return (
    <div
      className="w-full flex flex-col justify-center px-10 py-12 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0.12, pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="mb-7 flex flex-col items-center text-center">
        <div className="mb-5">
          <Logo size="sm" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 tracking-tight">Sign in</h2>
        <p className="text-sm text-slate-400 mt-1">Enter your credentials below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field label="Email" id="login-email" error={errors.email?.message}>
          <Input id="login-email" type="email" placeholder="m@example.com"
            disabled={isLoading} {...register("email")} className={inputCls} />
        </Field>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-pw" className={labelCls}>Password</Label>
            <Link to="/forgot-password" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Forgot?</Link>
          </div>
          <Input id="login-pw" type="password" disabled={isLoading}
            {...register("password")} className={inputCls} />
          {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
        </div>

        {unverifiedEmail && <VerifyEmailBanner email={unverifiedEmail} />}
        <SubmitBtn isLoading={isLoading} label="Sign In" loadingLabel="Signing in…" />
      </form>
    </div>
  )
}

/* ─── Desktop Register Panel ───────────────────────────────── */
function RegisterPanel({ visible, onSwitch }) {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await registerUser(data)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.")
    } finally { setIsLoading(false) }
  }

  return (
    <div
      className="w-full flex flex-col justify-center px-10 py-12 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0.12, pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="mb-7 flex flex-col items-center text-center">
        <div className="mb-5">
          <Logo size="sm" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 tracking-tight">Create Account</h2>
        <p className="text-sm text-slate-400 mt-1">Join MarketHub and start exploring today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full Name" id="reg-name" error={errors.name?.message}>
          <Input id="reg-name" placeholder="John Doe" disabled={isLoading}
            {...register("name")} className={inputCls} />
        </Field>
        <Field label="Email" id="reg-email" error={errors.email?.message}>
          <Input id="reg-email" type="email" placeholder="m@example.com"
            disabled={isLoading} {...register("email")} className={inputCls} />
        </Field>
        <Field label="Password" id="reg-pw" error={errors.password?.message}>
          <Input id="reg-pw" type="password" disabled={isLoading}
            {...register("password")} className={inputCls} />
        </Field>
        <SubmitBtn isLoading={isLoading} label="Create Account" loadingLabel="Creating…" />
      </form>
    </div>
  )
}

/* ─── Shared helpers ──────────────────────────────────────── */
const inputCls = "h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-visible:ring-emerald-500 transition-shadow"
const labelCls = "text-sm font-semibold text-slate-600 dark:text-slate-300"

const mobileInputCls = [
  "w-full h-12 rounded-xl px-4 text-sm transition-all",
  "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
  // Light mode
  "border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
  // Dark mode
  "dark:border-white/10 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500",
].join(" ")
const mobileLabelCls = "text-sm font-semibold text-slate-700 dark:text-slate-300"

function Field({ label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={labelCls}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

function MobileField({ label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={mobileLabelCls}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  )
}

function SubmitBtn({ isLoading, label, loadingLabel }) {
  return (
    <Button type="submit" disabled={isLoading}
      className="w-full h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all mt-1">
      {isLoading
        ? <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {loadingLabel}
          </span>
        : label}
    </Button>
  )
}

function MobileSubmitBtn({ isLoading, label, loadingLabel }) {
  return (
    <button type="submit" disabled={isLoading}
      className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
      {isLoading
        ? <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {loadingLabel}
          </span>
        : label}
    </button>
  )
}

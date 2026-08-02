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

function DiamondLogo({ size = "md" }) {
  const boxCls = size === "lg" ? "w-14 h-14 rounded-2xl" : "w-10 h-10 rounded-xl"
  const innerCls = size === "lg" ? "w-6 h-6" : "w-4 h-4"
  const lineCls = size === "lg" ? "-left-2 -right-2 h-[4px]" : "-left-1.5 -right-1.5 h-[3px]"
  
  return (
    <div className={`${boxCls} bg-[#1a1f2c] flex items-center justify-center relative shrink-0 shadow-lg border border-white/5`}>
      <div className={`relative ${innerCls}`}>
        <div className="absolute inset-0 bg-white rotate-45 rounded-[2px]"></div>
        <div className={`absolute top-1/2 ${lineCls} bg-emerald-500 -translate-y-1/2 z-10 rounded-full`}></div>
      </div>
    </div>
  )
}

export default function AuthPage({ initialMode = "login" }) {
  // isSignUp = true  → green panel on LEFT, register form active
  // isSignUp = false → green panel on RIGHT, login form active
  const [isSignUp, setIsSignUp] = useState(initialMode === "register")
  const [panelState, setPanelState] = useState("idle") // idle | expanding | sliding | contracting
  const [panelContent, setPanelContent] = useState(initialMode === "register" ? "register" : "login")
  const lockRef = useRef(false)

  const toggle = () => {
    if (lockRef.current) return
    lockRef.current = true

    // Phase 1 — expand (snail comes out)
    setPanelState("expanding")

    setTimeout(() => {
      // Phase 2 — slide + flip content
      setPanelState("sliding")
      setIsSignUp(v => !v)
      setPanelContent(c => c === "login" ? "register" : "login")
    }, 420)

    setTimeout(() => {
      // Phase 3 — contract (snail goes in)
      setPanelState("contracting")
    }, 1000)

    setTimeout(() => {
      setPanelState("idle")
      lockRef.current = false
    }, 1400)
  }

  // Panel geometry
  const panelLeft  = isSignUp ? "0%"  : "50%"
  const panelWidth =
    panelState === "expanding"   ? "62%" :
    panelState === "sliding"     ? "62%" :
    panelState === "contracting" ? "50%" : "50%"

  const widthTransition  = "width 420ms cubic-bezier(0.4,0,0.2,1)"
  const leftTransition   = panelState === "sliding" ? "left 580ms cubic-bezier(0.65,0,0.35,1)" : ""
  const combinedTransition = [widthTransition, leftTransition].filter(Boolean).join(", ")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex min-h-[600px] select-none">

        {/* ── Left half: Login ── */}
        <div className="w-1/2 flex items-center">
          <LoginPanel visible={!isSignUp} onSwitch={toggle} />
        </div>

        {/* ── Right half: Register ── */}
        <div className="w-1/2 flex items-center border-l border-slate-100 dark:border-slate-800">
          <RegisterPanel visible={isSignUp} onSwitch={toggle} />
        </div>

        {/* ── Snail Green Overlay Panel ── */}
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
          <div className="relative w-full h-full flex flex-col items-center justify-center text-white overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", // Light Emerald gradient
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-emerald-400 pointer-events-none" />
            <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full opacity-10 bg-emerald-400 pointer-events-none" />
            <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full opacity-10 bg-emerald-400 pointer-events-none" />

            <div className="relative z-10 text-center space-y-5 px-10">
              {/* Logo wordmark - Larger for green panel */}
              <div className="flex flex-col items-center pb-2 gap-4">
                <DiamondLogo size="lg" />
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-950 font-black text-5xl tracking-tight">mkt</span>
                    <span className="text-emerald-600 font-black text-5xl tracking-tight">hub</span>
                  </div>
                  <span className="text-emerald-800/70 text-sm font-semibold tracking-[0.3em] uppercase mt-1">Marketplace</span>
                </div>
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
  )
}

/* ─── Login Panel ─────────────────────────────────────────── */
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
      else if (user.role === "ADMIN")   navigate("/admin")
      else if (user.role === "SELLER")  navigate("/seller")
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
        <div className="flex flex-col items-center gap-3 mb-4">
          <DiamondLogo size="md" />
          <div className="flex items-center gap-1">
            <span className="text-slate-800 dark:text-white font-black text-3xl tracking-tight">mkt</span>
            <span className="text-emerald-600 font-black text-3xl tracking-tight">hub</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 tracking-tight">
          Sign in
        </h2>
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

      <p className="text-center text-sm text-slate-400 mt-6 md:hidden">
        No account? <button onClick={onSwitch} className="font-bold text-emerald-600">Sign up</button>
      </p>
    </div>
  )
}

/* ─── Register Panel ──────────────────────────────────────── */
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
        <div className="flex flex-col items-center gap-3 mb-4">
          <DiamondLogo size="md" />
          <div className="flex items-center gap-1">
            <span className="text-slate-800 dark:text-white font-black text-3xl tracking-tight">mkt</span>
            <span className="text-emerald-600 font-black text-3xl tracking-tight">hub</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 tracking-tight">
          Create Account
        </h2>
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

      <p className="text-center text-sm text-slate-400 mt-6 md:hidden">
        Have an account? <button onClick={onSwitch} className="font-bold text-emerald-600">Sign in</button>
      </p>
    </div>
  )
}

/* ─── Shared helpers ──────────────────────────────────────── */
const inputCls = "h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-visible:ring-emerald-500 transition-shadow"
const labelCls = "text-sm font-semibold text-slate-600 dark:text-slate-300"

function Field({ label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={labelCls}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
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

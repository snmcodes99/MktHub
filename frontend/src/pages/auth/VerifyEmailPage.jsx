import { useEffect, useState, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { verifyEmail } from "@/api/authApi"
import { Logo } from "@/components/common/Logo"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const { token } = useParams()
  const [status, setStatus] = useState("loading") // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("")
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("No verification token found in the link.")
      return
    }

    if (hasFetched.current) return
    hasFetched.current = true

    const run = async () => {
      try {
        await verifyEmail(token)
        setStatus("success")
      } catch (error) {
        setStatus("error")
        setErrorMessage(
          error?.response?.data?.message ||
            "This link is invalid or has expired. Please request a new verification email."
        )
      }
    }

    run()
  }, [token])

  return (
    <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left decorative panel */}
      <div className="relative hidden h-full flex-col bg-white p-10 text-white dark:border-r lg:flex">
        <img
          src="/auth-bg-3.png"
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>

      {/* Right content panel */}
      <div className="lg:p-8 w-full p-4">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="mx-auto mb-4">
            <Logo />
          </div>

          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">Verifying your email…</h1>
              <p className="text-sm text-muted-foreground">Please wait a moment.</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-green-100 dark:bg-green-950/40 p-4">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Email verified!</h1>
              <p className="text-sm text-muted-foreground">
                Your email has been confirmed. You can now sign in to your account.
              </p>
              <Button asChild className="w-full">
                <Link to="/login">Go to sign in</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Verification failed</h1>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Back to sign in</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

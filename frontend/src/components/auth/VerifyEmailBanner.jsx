import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { resendVerificationEmail } from "@/api/authApi"
import { Button } from "@/components/ui/button"
import { MailCheck, AlertCircle } from "lucide-react"

const COOLDOWN_SECONDS = 60

/**
 * Shown in the LoginForm when a 403 "unverified email" error is returned,
 * OR immediately after registration.
 * Lets the user resend their verification email with a cooldown timer.
 */
export function VerifyEmailBanner({ email, isSuccess = false }) {
  const [cooldown, setCooldown] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const timerRef = useRef(null)

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS)
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return
    setIsSending(true)
    try {
      await resendVerificationEmail({ email })
      toast.success("Verification email sent! Check your inbox.")
      startCooldown()
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend email. Try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${
      isSuccess 
        ? "border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-950/30" 
        : "border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30"
    }`}>
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <MailCheck className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        )}
        <div className="space-y-1">
          <p className={`text-sm font-semibold ${isSuccess ? "text-green-800 dark:text-green-300" : "text-amber-800 dark:text-amber-300"}`}>
            {isSuccess ? "Account created successfully!" : "Email not verified"}
          </p>
          <p className={`text-sm ${isSuccess ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
            {isSuccess 
              ? "We've sent a verification link to your email. Please verify before signing in."
              : "Please verify your email address before logging in. Check your inbox for a verification link."
            }
          </p>
          {email && (
            <p className={`text-xs font-mono mt-1 ${isSuccess ? "text-green-600 dark:text-green-500" : "text-amber-600 dark:text-amber-500"}`}>
              Sent to: {email}
            </p>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`w-full ${
          isSuccess
            ? "border-green-300 text-green-800 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/40"
            : "border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40"
        }`}
        onClick={handleResend}
        disabled={cooldown > 0 || isSending}
      >
        <MailCheck className="mr-2 h-4 w-4" />
        {isSending
          ? "Sending..."
          : cooldown > 0
          ? `Resend in ${cooldown}s`
          : "Resend Verification Email"}
      </Button>
    </div>
  )
}

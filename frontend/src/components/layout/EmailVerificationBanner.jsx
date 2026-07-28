import { useState, useContext } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { resendVerificationEmail } from "@/api/authApi";
import { AuthContext } from "@/context/AuthContext";

export function EmailVerificationBanner() {
    const { user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);

    if (!user || user.isEmailVerified) {
        return null;
    }

    const handleResend = async () => {
        setIsLoading(true);
        try {
            await resendVerificationEmail({ email: user.email });
            toast.success("Verification email sent", {
                description: "Please check your inbox (and spam folder) for the verification link.",
            });
        } catch (error) {
            toast.error("Failed to resend email", {
                description: error.response?.data?.message || "Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-900 px-4 py-3 flex items-center justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm font-medium">
                    Please verify your email address to unlock all features.
                </p>
            </div>
            <button
                onClick={handleResend}
                disabled={isLoading}
                className="ml-4 flex-shrink-0 bg-amber-200 hover:bg-amber-300 text-amber-900 text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Sending..." : "Resend Email"}
            </button>
        </div>
    );
}

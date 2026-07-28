import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-background p-10 text-white border-r border-border lg:flex">
        <img src="/auth-bg-3.png" alt="Background" className="absolute inset-0 h-full w-full object-cover object-center dark:hidden" />
        <img src="/auth-bg-dark.png" alt="Background" className="absolute inset-0 h-full w-full object-cover object-center hidden dark:block" />
      </div>
      <div className="lg:p-8 w-full p-4">
        <LoginForm />
      </div>
    </div>
  )
}

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { changePassword } from "@/api/authApi"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, LogOut } from "lucide-react"

export default function CustomerProfile() {
  const { user, logout, logoutAll, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [profileLoading, setProfileLoading] = useState(false)
  const [profileName, setProfileName] = useState(user?.name ?? "")

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [logoutAllLoading, setLogoutAllLoading] = useState(false)

  // --- Profile Update (name only — email is immutable) ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      await updateProfile({ name: profileName })
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile")
    } finally {
      setProfileLoading(false)
    }
  }

  // --- Change Password ---
  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    setPasswordLoading(true)
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success("Password changed. Please sign in again.")
      // Backend revokes all sessions on password change — force logout
      await logout()
      navigate("/login")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }

  // --- Logout all devices ---
  const handleLogoutAll = async () => {
    setLogoutAllLoading(true)
    try {
      await logoutAll()
      navigate("/login")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to logout from all devices")
    } finally {
      setLogoutAllLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">Manage your account settings and password.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info — name only, email is read-only */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>You can update your name. Email cannot be changed.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Current Role</span>
                  <div className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary w-fit">
                    {user?.role}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  disabled={profileLoading}
                />
              </div>

              {/* Email is immutable — shown as read-only */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
              </div>

              <Button type="submit" disabled={profileLoading} className="w-full">
                {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Changing your password will log you out of all devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={passwordLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={passwordLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={passwordLoading}
                />
              </div>
              <Button type="submit" disabled={passwordLoading} className="w-full">
                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone — Logout all devices */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Security</CardTitle>
          <CardDescription>
            Sign out from all devices where your account is currently active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleLogoutAll}
            disabled={logoutAllLoading}
          >
            {logoutAllLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Logout from all devices
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

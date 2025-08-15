import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Eye, EyeOff } from "lucide-react"
import { Password, createPassword, updatePassword } from "@/api/passwords"
import { useToast } from "@/hooks/useToast"
import { useAuth } from "@/contexts/AuthContext"

interface PasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  password?: Password | null
  onSave: () => void
}

export function PasswordDialog({ open, onOpenChange, password, onSave }: PasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { masterPassword } = useAuth();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      website: "",
      username: "",
      password: "",
    }
  })

  useEffect(() => {
    if (open) {
        if (password) {
            reset({
                website: password.website,
                username: password.username,
                password: '', // Do not pre-fill password for security
            })
        } else {
            reset({
                website: "",
                username: "",
                password: "",
            })
        }
    }
  }, [password, open, reset])

  const onSubmit = async (data: any) => {
    if (!masterPassword) {
        toast({
            title: "Error",
            description: "Master password is not set.",
            variant: "destructive",
        });
        return;
    }
    setLoading(true)
    try {
      const passwordData = { ...data };
      if (!passwordData.password) {
        delete passwordData.password;
      }

      if (password) {
        await updatePassword(password.id, passwordData, masterPassword)
        toast({
          title: "Success",
          description: "Password updated successfully",
        })
      } else {
        await createPassword(passwordData, masterPassword)
        toast({
          title: "Success",
          description: "Password added successfully",
        })
      }
      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving password:', error)
      toast({
        title: "Error",
        description: "Failed to save password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>
            {password ? 'Edit Password' : 'Add New Password'}
          </DialogTitle>
          <DialogDescription>
            {password ? 'Update your password information. Leave password blank to keep it unchanged.' : 'Add a new password to your vault'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website Name</Label>
              <Input
                id="website"
                placeholder="e.g., Google, Facebook"
                {...register("website", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username/Email</Label>
              <Input
                id="username"
                placeholder="your@email.com"
                {...register("username", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={password ? "New password" : "Enter password"}
                  className="pr-10"
                  {...register("password", { required: !password })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : password ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
// auth/Login.tsx
import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import { CiUnread, CiRead } from "react-icons/ci"
import { userRepo } from "../repositories/userRepo"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/hooks/store/authStore"
import Loader from "@/components/Loader"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { setUser, isAuthenticated } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate("/")
  }, [isAuthenticated, navigate])

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)

    try {
      const response = await userRepo.loginAdmin(data)

      // Store token for API calls
      if (response.token) {
        localStorage.setItem('token', response.token)
      }

      setUser(response.user)
      toast.success("Login successful")
      navigate("/", { replace: true })
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Login failed"
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-black tracking-tight">Admin Login</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6 border rounded-xl shadow-sm bg-card">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              className={cn(
                "h-12 rounded-xl border-muted/50 bg-muted/5 px-4 focus-visible:ring-primary/20",
                errors.username ? "border-red-500" : ""
              )}
              {...register("username")}
            />
            {errors.username && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className={cn(
                  "h-12 rounded-xl border-muted/50 bg-muted/5 px-4 pr-12 focus-visible:ring-primary/20",
                  errors.password ? "border-red-500" : ""
                )}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 cursor-pointer hover:text-primary transition-colors select-none"
              >
                {showPassword ? <CiUnread size={22} /> : <CiRead size={22} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password.message}</p>}
          </div>

          <Button
            className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : "Login"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Login

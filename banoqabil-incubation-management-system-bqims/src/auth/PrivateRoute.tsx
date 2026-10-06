// auth/PrivateRoute.tsx
import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/hooks/store/authStore"
import Loader from "@/components/Loader"

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, setLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  // Wait for Zustand persist to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      setIsChecking(false)
    }, 100) // small delay for persist rehydration
    return () => clearTimeout(timer)
  }, [setLoading])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

export default PrivateRoute

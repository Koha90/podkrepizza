import { Navigate } from "react-router"
import { useAuth } from "../context/AuthContext"

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isLoggedIn, user, loading } = useAuth()

  if (loading) return null

  console.log("AdminRoute debug:", { isLoggedIn, user, loading })

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (!user?.is_admin) {
    return <Navigate to="/profile" replace />
  }

  return children
}

export default AdminRoute

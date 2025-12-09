// import { Navigate } from "react-router"
import { useAuth } from "../context/AuthContext"

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isLoggedIn, user, loading } = useAuth()

  if (loading) return <div>Загрузка...</div>

  console.log("AdminRoute debug:", { isLoggedIn, user, loading })

  if (!isLoggedIn || user?.is_admin !== true) {
    // console.warn("Redirecting to /profile:", { isLoggedIn, user })
    // return <Navigate to="/profile" replace />
  }

  return children
}

export default AdminRoute

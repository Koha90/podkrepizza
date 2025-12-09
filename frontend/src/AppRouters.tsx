import { Routes, Route } from "react-router";
import AdminRoute from "./components/AdminRoute"

import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import AdminUsers from "./components/AdminUsers";


export default function AppRouters() {
  return (
    <div className="flex items-center justify-center">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
      </Routes>
    </div>
  )
}

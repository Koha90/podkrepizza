import { Routes, Route } from "react-router";

import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";


export default function AppRouters() {
  return (
    <div className="flex items-center justify-center">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}

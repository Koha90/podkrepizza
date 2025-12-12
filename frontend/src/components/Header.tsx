import { useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext";


export default function Header() {
  const navigate = useNavigate()
  const { isLoggedIn, logout, user, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login")
  }

  if (loading) {
    return (
      <header className="header pt-2">
        <div className="flex max-w-6xl mx-auto px-4 inset-0">
          <div className="p-4 text-gray-500">Загрузка...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="header pt-2">
      <div className="flex max-w-6xl mx-auto px-4 inset-0">

        {!isLoggedIn ? (
          <div className="flex flex-col space-y-3 items-end">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 w-40 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Войти
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 w-40 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              Регистрация
            </button>
          </div>
        ) : (
          <nav className="flex space-x-4 p-4 w-full bg-grey-100">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              onClick={handleLogout}
            >
              Выйти
            </button>
            {user?.is_admin && (
              <button
                onClick={() => navigate("/admin/users")}
                className="px-4 py-2 w-40 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                Пользователи
              </button>
            )}
          </nav>
        )}
      </div>
    </header >
  )
}

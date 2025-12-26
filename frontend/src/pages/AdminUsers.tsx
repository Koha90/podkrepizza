import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

type User = {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  blocked: boolean;
  created_at: string;
  updated_at: string;
}

const roles = {
  admin: "Админ",
  moderator: "Модер",
  user: "Пользователь"
} as const

type Role = keyof typeof roles

export default function AdminUsers() {
  const { isLoggedIn, user, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([])

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/admin/users", {
        method: "GET",
        credentials: "include"
      })
      if (!res.ok) throw new Error("Не удалось загрузить пользователей")
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      toast.error((err as Error).message)
      console.error(err)
    }
  }

  const toggleAdmin = async (id: number, role: Role) => {
    try {
      await fetch(`http://localhost:8080/api/admin/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      })

      toast.success(`Роль изменена на "${roles[role]}"`)
      fetchUsers();
    } catch (err) {
      toast.error("Ошибка при изменении прав")
    }
  }

  const toggleBlocked = async (id: number, blocked: boolean) => {
    try {
      await fetch(`http://localhost:8080/api/admin/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_blocked: !blocked })
      })

      toast.success(!blocked ? "Пользователь заблокирован" : "Разблокирован")
      fetchUsers();
    } catch (err) {
      toast.error("Ошибка при изменении статуса")
    }
  }

  useEffect(() => {
    if (!loading && isLoggedIn && user?.role) {
      fetchUsers();
    }
  }, [loading, isLoggedIn, user])

  if (loading) return <div>Загрузка...</div>
  if (!isLoggedIn || user?.role !== "admin") return <div>Нет доступа</div>

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">Пользователи</h2>
      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">Имя</th>
            <th className="py-2 px-4 border">Телефон</th>
            <th className="py-2 px-4 border">Admin</th>
            <th className="py-2 px-4 border">Блокировка</th>
            <th className="py-2 px-4 border">Зарегистрирован</th>
            <th className="py-2 px-4 border">Обновлён профиль</th>
            <th className="py-2 px-4 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr className="text-center border py-2 px-3" key={u.id}>
              <td className="py-2 px-4 border">{u.email}</td>
              <td className="py-2 px-4 border">{u.name}</td>
              <td className="py-2 px-4 border">{u.phone}</td>
              <td className="py-2 px-4 border">
                {u.role === "admin"
                  ? "Админ"
                  : u.role === "moderator"
                    ? "Модер"
                    : "Пользователь"}
              </td>
              <td className="py-2 px-4 border">{u.blocked ? "В бане" : "Активен"}</td>
              <td className="py-2 px-4 border">{new Date(u.created_at).toLocaleString("ru-RU", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</td>
              <td className="py-2 px-4 border">{new Date(u.updated_at).toLocaleString("ru-RU", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</td>
              <td className="py-2 px-4 border">
                <select
                  value={u.role}
                  onChange={(e) => toggleAdmin(u.id, e.target.value as Role)}
                  className="border px-2 py-1 rounded"
                >
                  {Object.entries(roles).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => toggleBlocked(u.id, u.blocked)}
                  className="px-2 py-1 bg-red-500 hover:bg-red-400 text-white rounded w-full">
                  {u.blocked ? "Из бана" : "В бан"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

}

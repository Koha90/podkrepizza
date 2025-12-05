import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";


export default function Profile() {
  const [email, setEmail] = useState("");
  const { isLoggedIn, logout } = useAuth();
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [admin, setAdmin] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include"
        })

        if (!response.ok) {
          logout()
          const err = await response.text()
          toast.error("Ошибка авторизации")
          console.error(err)
          return
        }

        const data = await response.json()
        setEmail(data.email)
        setName(data.name)
        setPhone(data.phone)
        setBlocked(data.blocked)
        setAdmin(data.is_admin)

        if (data.created_at) {
          setCreatedAt(new Date(data.created_at).toISOString().split("T")[0])
        }

        if (data.updated_at) {
          setUpdatedAt(new Date(data.updated_at).toISOString().split("T")[0])
        }
      } catch (err) {
        if (!isLoggedIn) {
          toast.error("Сервер недоступен")
        }
        console.error(err)
      }
    }

    fetchProfile();
  }, [isLoggedIn, logout])

  return (
    <>
      {!isLoggedIn ? (
        <div className="flex flex-col space-y-3 items-end">Войдите или Зарегистрируйтесь</div>
      ) : (
        <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow">
          <h1 className="text-2xl font-bold mb-4">
            Приветствуем{name ? `, ${name}` : ""}!
          </h1>
          {email ? (
            <p>
              Email:  <pre className="font-mono">{email}</pre>
            </p>
          ) : (
            <p>Загрузка...</p>
          )}
          {phone ? (
            <p>
              Телефон: <pre className="font-mono">{phone}</pre>
            </p>
          ) : (
            <p>Загрузка...</p>
          )}
          <p>
            Роль: <pre className="font-mono">{admin ? "Администратор" : "Пользователь"}</pre>
          </p>
          <p>
            Статус: <pre className="font-mono">{blocked ? "Заблокирован" : "Активен"}</pre>
          </p>
          <p>
            Дата регистрации: <pre className="font-mono">{createdAt}</pre>
          </p>
          {updatedAt ? (
            <p>
              Последнее обновление профиля: <pre className="font-mono">{updatedAt}</pre>
            </p>
          ) : (
            <p>
              Обновлений профиля не было.</p>
          )}
        </div>
      )}
    </>
  )
}

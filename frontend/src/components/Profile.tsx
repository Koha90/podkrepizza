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
        <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow shadow-black">
          <h1 className="text-2xl font-bold mb-4">
            Приветствуем{name ? `, ${name}` : ""}!
          </h1>
          {email ? (
            <p className="font-bold">
              Email:  <pre className="font-medium font-mono">{email}</pre>
            </p>
          ) : (
            <p className="font-bold">Загрузка...</p>
          )}
          {phone ? (
            <p className="font-bold">
              Телефон: <pre className="font-medium font-mono">{phone}</pre>
            </p>
          ) : (
            <p>Загрузка...</p>
          )}
          <p className="font-bold">
            Роль: <pre className="font-medium font-mono">{admin ? "Администратор" : "Пользователь"}</pre>
          </p>
          <p className="font-bold">
            Статус: <pre className="font-medium font-mono">{blocked ? "Заблокирован" : "Активен"}</pre>
          </p>
          <p className="font-bold">
            Дата регистрации: <pre className="font-medium font-mono">{createdAt}</pre>
          </p>
          {updatedAt ? (
            <p className="font-bold">
              Последнее обновление профиля: <pre className="font-medium font-mono">{updatedAt}</pre>
            </p>
          ) : (
            <p className="font-bold">
              Обновлений профиля не было.</p>
          )}
          <button className="border border-tertiary-600 rounded-md py-2 px-5 mt-5 bg-tertiary-500 hover:bg-tertiary-600 font-bold text-priamry-50">Обновить</button>
        </div>
      )}
    </>
  )
}

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";


export default function Profile() {
  const [email, setEmail] = useState("");
  const { isLoggedIn, logout } = useAuth();
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [blocked, setBlocked] = useState(false)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const [editMode, setEditMode] = useState(false)


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/profile", {
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
        setRole(data.role)

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

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/profile/update", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })

      if (!response.ok) {
        toast.error("Ошибка обновления профиля")
        return
      }

      toast.success("Профиль обновлён!")
      setEditMode(false)
    } catch (err) {
      toast.error("Ошибка сервера")
      console.error(err)
    }
  }

  return (
    <>
      {!isLoggedIn ? (
        <div className="flex flex-col space-y-3 items-end">Войдите или Зарегистрируйтесь</div>
      ) : (
        <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow shadow-black">
          {!editMode ? (
            <>

              <h1 className="text-2xl font-bold mb-4">
                Приветствуем{name ? `, ${name}` : ""}!
              </h1>
              {email ? (
                <p className="font-bold">
                  Email:<br /><span className="font-medium font-mono">{email}</span>
                </p>
              ) : (
                <p className="font-bold">Загрузка...</p>
              )}
              {phone ? (
                <p className="font-bold">
                  Телефон:<br /> <span className="font-medium font-mono">{phone}</span>
                </p>
              ) : (
                <p className="font-bold">
                  <p>Телефон:<br /> <span className="font-medium font-mono">Не указан</span></p>
                </p>
              )}
              <p className="font-bold">
                Роль:<br /> <span className="font-medium font-mono">{role === "admin" ? "Администратор" : role === "moderator" ? "Модератор" : "Пользователь"}</span>
              </p>
              <p className="font-bold">
                Статус:<br /> <span className="font-medium font-mono">{blocked ? "Заблокирован" : "Активен"}</span>
              </p>
              <p className="font-bold">
                Дата регистрации:<br /> <span className="font-medium font-mono">{createdAt}</span>
              </p>
              {updatedAt ? (
                <p className="font-bold">
                  Последнее обновление профиля:<br /> <span className="font-medium font-mono">{updatedAt}</span>
                </p>
              ) : (
                <p className="font-bold">
                  Последнее обновление профиля:<br /> <span className="font-medium font-mono">не было</span>
                </p>
              )}
              <button
                className="border border-tertiary-600 rounded-md py-2 px-5 mt-5 bg-tertiary-500 hover:bg-tertiary-600 font-bold text-priamry-50"
                onClick={() => setEditMode(true)}>
                Редактировать
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Редактирование профиля</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm">Email</label>
                  <input
                    type="text"
                    disabled value={email}
                    className="w-full border p-2 rounded bg-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm">Имя</label>
                  <input
                    type="text"
                    value={name}
                    className="w-full border p-2 rounded"
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm">Телефон</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded">
                    Отменить
                  </button>
                </div>
              </div>
            </>
          )}
        </div >
      )
      }
    </>
  )
}

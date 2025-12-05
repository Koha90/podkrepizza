import { useState } from "react";
import toast from "react-hot-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");


    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const err = await response.text();
        toast.error(err || "Ошибка регистрации");
        return
      }

      const data = await response.json();
      toast.success(data.message || "Вы зарегестрировались");

      setMessage("Регистрация прошла успешно!")
    } catch (error) {
      toast.error("Сервер не доступен")
      console.error(error)
    }
  }

  return (
    <div className="container m-10 p-5 w-2xl border-2 border-black rounded-md shadow-sm shadow-black-100">
      <h2 className="font-bold text-center mb-5">Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Пароль</label>
          <input
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          className="px-4 py-2 my-2 bg-green-500 text-white rounded-lg"
          type="submit">
          Зарегистрироваться</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

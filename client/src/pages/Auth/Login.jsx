// src/pages/auth/SignIn.jsx   (adjust the path if needed)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AxiosInstance from "../../components/AxiosInstance";
import { useUser } from "../../Provider/UserProvider";
import { SetCategory } from "./SetDefaultCategory";

const Login = () => {
  const { refreshUser, user} = useUser(); // pull refresh function from context
  const [showPassword, setShowPassword] = useState(false);

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      alert("Username and password are required!");
      return;
    }

    try {
      const response = await AxiosInstance.post("login/", credentials);
      const { access } = response.data;
      localStorage.setItem("access_token", access);

      // Optional: immediately refresh context user
      if (refreshUser) {
        refreshUser();
      }

      console.log("Superuser! Found !")
      console.log("Superuser", user.role)
      if (user?.role === "superuser") {
        console.log("Superuser Found !")
        await SetCategory();
      }

      alert("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          alert("Invalid username or password!");
        } else if (status === 400) {
          alert("Please provide both username and password.");
        } else {
          alert(error.response.data?.message || "Something went wrong!");
        }
      } else {
        alert("Network error. Please try again.");
      }
    }
  };

  return (
    <div className="w-80 md:w-96 my-16 lg:w-[500px] mx-auto bg-white flex items-center relative overflow-hidden shadow-xl">
      {/* Login form */}
      <form onSubmit={handleLogin} className="p-8 w-full duration-500">
        <h1 className="text-2xl lg:text-4xl pb-4">Login</h1>

        <div className="space-y-3">
          <label htmlFor="login_username" className="block text-sm text-gray-600">
            User Name
          </label>
          <input
            id="login_username"
            name="username"
            type="text"
            value={credentials.username}
            onChange={handleLoginChange}
            placeholder="example1234"
            autoComplete="username"
            className="p-3 block w-full outline-none border rounded-md border-black"
            required
          />

          <label htmlFor="login_password" className="block text-sm text-gray-600">
            Password
          </label>
          <div className="relative">
            <input
              id="login_password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={handleLoginChange}
              placeholder="********"
              autoComplete="current-password"
              className="p-3 block w-full outline-none border rounded-md border-black"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="btn py-2 px-5 mt-6 shadow-lg border rounded-md border-black block w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;

import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

import api from "./api";
import Login from "./components/auth/Login.jsx";
import SignUp from "./components/auth/SignUp.jsx";
import Home from "./components/Home.jsx";

function App() {

  const navigateTo = useNavigate();
  const [authError, setAuthError] = useState("");

  const login = async (username, password) => {
    try {
      setAuthError("");
      const { data } = await api.post("/api/auth/signin", { username, password });
      localStorage.setItem("token", data.token);
      navigateTo("/");
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      setAuthError(msg);
    }
  };

  const signUp = async (username, password, email, fullName, image) => {
    try {
      setAuthError("");
      const formValues = { username, password, email, fullName, image };
      const formData = new FormData();
      for (const key in formValues) {
        if (formValues[key] != null) formData.append(key, formValues[key]);
      }

      await api.post("/api/auth/signup", formData);
      navigateTo("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      setAuthError(msg);
    }
  };

  return (
    <>
      <Routes>

        <Route path="/login" element={<Login login={login} error={authError} />} />
        <Route path="/signup" element={<SignUp signUp={signUp} error={authError} />} />

        <Route path="/*" element={<Home />} />

      </Routes>
    </>
  );
}

export default App;

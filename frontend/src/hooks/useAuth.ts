import { useState, useEffect } from "react";
import api from "@/lib/axios";

interface User {
  id: number;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur si token déjà présent
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/api/me")
        .then((res) => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);


  // Déconnexion
  async function logout() {
  try {
    await api.post("/api/logout"); // ton endpoint Laravel
  } catch (e) {
    console.error("Erreur logout :", e);
  } finally {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/"; // pour forcer la redirection
  }
}


  return {
    user, logout, loading
  };
}

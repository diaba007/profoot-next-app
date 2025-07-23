// src/app/auth/signin/page.jsx

"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation"; // <--- NOUVEL IMPORT : useRouter

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter(); // <--- NOUVEAU : Initialisation du router

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Appel à la fonction signIn de next-auth
    const result = await signIn("credentials", {
      redirect: false, // Important: ne pas rediriger automatiquement
      username,
      password,
    });

    if (result.error) {
      setError(result.error);
    } else {
      // SI LA CONNEXION RÉUSSIT, REDIRIGER VERS LA PAGE D'ACCUEIL
      console.log("Connexion réussie ! Redirection vers la page d'accueil."); // Pour le débogage
      router.push("/"); // <--- C'EST LA LIGNE QUI MANQUAIT !
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
      <h1 style={{ textAlign: 'center', color: '#007bff' }}>Connexion Admin</h1>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Nom d'utilisateur:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            required
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Mot de passe:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            required
          />
        </div>
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' }}>
          Se connecter
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: '0.8em', marginTop: '20px', color: '#666' }}>
        (Nom d'utilisateur: admin, Mot de passe: adminpass)
      </p>
    </div>
  );
}
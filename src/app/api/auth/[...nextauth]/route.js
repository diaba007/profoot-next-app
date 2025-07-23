// src/app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Votre configuration NextAuth
// AJOUTEZ 'export' ICI pour rendre authOptions disponible pour d'autres fichiers
export const authOptions = {
  // Configuration des fournisseurs d'authentification
  providers: [
    CredentialsProvider({
      // Nom affiché sur le formulaire de connexion (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` est utilisé pour générer un formulaire sur la page de connexion
      credentials: {
        username: { label: "Nom d'utilisateur", type: "text", placeholder: "admin" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials, req) {
        // Dans un cas réel, vous vérifieriez ici une base de données
        // Ici, nous utilisons un utilisateur admin codé en dur pour la démo
        if (credentials.username === "admin" && credentials.password === "adminpass") {
          // Si les identifiants sont valides, retournez l'objet utilisateur
          // 'role' est un champ personnalisé que nous allons utiliser pour l'autorisation
          return { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" };
        }
        // Si les identifiants sont invalides, retournez null et NextAuth affichera une erreur
        return null;
      }
    })
    // Vous pouvez ajouter d'autres fournisseurs ici (Google, GitHub, etc.)
  ],

  // Configuration des callbacks pour personnaliser le JWT et la session
  callbacks: {
    async jwt({ token, user }) {
      // Le user est disponible sur le premier appel après la connexion réussie
      // Ajouter les informations du rôle à votre token JWT
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Les informations du token JWT sont disponibles ici
      // Exposer le rôle dans l'objet de session accessible côté client
      if (token.role) {
        session.user.role = token.role;
      }
      return session;
    }
  },

  // Pages personnalisées (facultatif, mais recommandé pour un meilleur contrôle de l'UX)
  pages: {
    signIn: '/auth/signin', // Créez cette page plus tard pour votre formulaire de connexion
  },

  // Stratégie de session (par défaut 'jwt', 'database' est une autre option)
  session: {
    strategy: "jwt",
  },

  // Options de débogage (utile en développement)
  debug: process.env.NODE_ENV === "development",
};

// Exportez les handlers GET et POST pour les requêtes API
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
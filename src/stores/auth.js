import { defineStore } from "pinia";
//import jwtAuthService from "@/services/jwtAuthService";
export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    refreshTimer: null,
    showLoginModal: false,
  }),
  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    userDisplayName: (state) => state.user?.display_name || "Utilisateur",
    userName: (state) => state.user?.nicename || "user",
    userEmail: (state) => state.user?.email || "",
    userId: (state) => state.user?.id || null,
    isLoginModalOpen: (state) => state.showLoginModal,
  },
  actions: {
    async initialize() {
      try {
        const isAuthenticated = await jwtAuthService.checkAuthStatus();
        if (isAuthenticated) {
          //this.token = jwtAuthService.getToken();
          this.token =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjEwMDA0IiwiaWF0IjoxNzU4NzAyOTA3LCJuYmYiOjE3NTg3MDI5MDcsImV4cCI6MTc1OTMwNzcwNywiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMiJ9fX0.Wcm0omNc7_2ykhZEuKjisDzXkE59MJkti1YEVx1pCPM";
          //this.user = jwtAuthService.getUser();
          this.isAuthenticated = true;
          console.log("Utilisateur JWT reconnecté:", this.user?.display_name);
          this.startTokenRefreshTimer();
        } else {
          console.log("Aucun utilisateur connecté");
          this.resetAuth();
        }
      } catch (error) {
        console.error("Erreur initialisation auth:", error);
        this.resetAuth();
      }
    },
    async init() {
      return await this.initialize();
    },
    async login(credentials) {
      console.log("Tentative de connexion JWT...");

      this.loading = true;
      this.error = null;

      try {
        const result = await jwtAuthService.login(
          credentials.username,
          credentials.password
        );

        if (result.success) {
          this.token = result.token;
          this.user = result.user;
          this.isAuthenticated = true;
          console.log("Connexion réussie!");
          console.log("Utilisateur connecté:", this.user.display_name);
          this.closeLoginModal();
          return { success: true };
        } else {
          throw new Error("Échec de la connexion");
        }
      } catch (error) {
        console.error("Erreur connexion JWT:", error);
        this.error = error.message;
        this.resetAuth();
        throw error;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      console.log("Déconnexion...");
      jwtAuthService.logout();
      this.resetAuth();
      router.push("/login");
    },
    resetAuth() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.error = null;
      this.loading = false;
      this.showLoginModal = false;
    },
    closeLoginModal() {
      console.log("Fermeture du modal de connexion");
      this.showLoginModal = false;
    },
    openLoginModal() {
      console.log("Ouverture du modal de connexion");
      this.showLoginModal = true;
    },
  },
});

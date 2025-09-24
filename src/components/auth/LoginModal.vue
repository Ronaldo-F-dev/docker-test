<template>
    <Modal @close="handleClose">
        <template #header>
            <div class="login-header">
                <h3>Connexion WordPress</h3>
                <p class="login-subtitle">Connectez-vous pour gérer le board</p>
            </div>
        </template>
        <template #body>
            <form @submit.prevent="handleLogin" class="login-form">
                <div v-if="authStore.error" class="error-message">
                    {{ authStore.error }}
                </div>

                <div class="form-group">
                    <label for="username">Nom d'utilisateur ou email</label>
                    <input id="username" v-model="credentials.username" type="text" required class="form-input"
                        placeholder="Votre nom d'utilisateur WordPress" :disabled="authStore.loading"
                        autocomplete="username" />
                </div>
                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <div class="password-field">
                        <input id="password" v-model="credentials.password" :type="showPassword ? 'text' : 'password'"
                            required class="form-input" placeholder="Votre mot de passe" :disabled="authStore.loading"
                            autocomplete="current-password" />
                        <button type="button" @click="togglePassword" class="password-toggle"
                            :disabled="authStore.loading">
                            {{ showPassword ? 'Masquer' : 'Voir' }}
                        </button>
                    </div>
                </div>
            </form>
        </template>

        <template #footer>
            <div class="login-footer">
                <button @click="handleClose" class="btn btn-secondary" :disabled="authStore.loading">
                    Annuler
                </button>

                <button @click="handleLogin" class="btn btn-primary" :disabled="!isFormValid || authStore.loading">
                    <span v-if="authStore.loading" class="loading-spinner"></span>
                    {{ authStore.loading ? 'Connexion...' : 'Se connecter' }}
                </button>
            </div>
        </template>
    </Modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Modal from '@/components/ui/Modal.vue'
import axios from 'axios'
const authStore = useAuthStore()

const credentials = ref({
    username: '',
    password: ''
})

const showPassword = ref(false)

const isFormValid = computed(() => {
    return credentials.value.username.trim() && credentials.value.password.trim()
})

const handleLogin = async () => {
    if (!isFormValid.value) return
    try {
        //await authStore.login(credentials.value)
        authStore.loading = true;
        const jwtResult = await axios.post('https://twp.coding-academy.website/wp-json/jwt-auth/v1/token', {
            username: credentials.value.username,
            password: credentials.value.password
        }).then(response => {
            authStore.loading = false;
            console.log(response);
            localStorage.setItem("token", response.data.token);
            authStore.isAuthenticated = true;
            authStore.token = response.data.token;
            handleClose();
        }).catch(error => {
            console.log(error)
        });


    } catch (error) {
        console.error('Erreur de connexion:', error)
    }
}

const handleClose = () => {
    authStore.closeLoginModal()
    credentials.value = { username: '', password: '' }
    showPassword.value = false
}

const togglePassword = () => {
    showPassword.value = !showPassword.value
}


</script>

<style scoped>
.login-header {
    text-align: center;
}

.login-subtitle {
    margin: 8px 0 0 0;
    color: #6b778c;
    font-size: 14px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-weight: 500;
    color: #172b4d;
    font-size: 14px;
}

.form-input {
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #0079bf;
}

.form-input:disabled {
    background: #f4f5f7;
    cursor: not-allowed;
}

.password-field {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #6b778c;
    padding: 4px;
}

.password-toggle:hover {
    color: #172b4d;
}

.password-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.error-message {
    background: #ffebee;
    color: #c62828;
    padding: 12px;
    border-radius: 6px;
    border-left: 4px solid #f44336;
    font-size: 14px;
}

.info-box {
    background: #e3f2fd;
    border: 1px solid #bbdefb;
    border-radius: 6px;
    padding: 16px;
}

.info-box h4 {
    margin: 0 0 8px 0;
    color: #1565c0;
    font-size: 14px;
}

.info-box p {
    margin: 0 0 8px 0;
    color: #1976d2;
    font-size: 13px;
}

.info-box ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
}

.info-box li {
    color: #1976d2;
    font-size: 12px;
    margin-bottom: 4px;
}

.demo-section {
    background: #f3e5f5;
    border: 1px solid #e1bee7;
    border-radius: 6px;
    padding: 16px;
    text-align: center;
}

.demo-title {
    margin: 0 0 12px 0;
    color: #6a1b9a;
    font-size: 14px;
    font-weight: 500;
}

.btn-demo {
    background: #9c27b0;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background-color 0.2s;
}

.btn-demo:hover:not(:disabled) {
    background: #7b1fa2;
}

.btn-demo:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.demo-note {
    margin: 8px 0 0 0;
    color: #8e24aa;
    font-size: 11px;
    font-style: italic;
}

.login-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background: #0079bf;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #005a8b;
}

.btn-secondary {
    background: #f4f5f7;
    color: #172b4d;
}

.btn-secondary:hover:not(:disabled) {
    background: #e4e6ea;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.loading-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 600px) {
    .login-footer {
        flex-direction: column;
        gap: 12px;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
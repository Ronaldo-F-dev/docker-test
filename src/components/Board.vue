<template>
    <div class="board">
        <div class="board-header">
            <h1 class="board-title">Trello WordPress</h1>
            <div class="board-actions">
                <button v-if="true" @click="handleCreateListClick" class="btn btn-primary">
                    + Ajouter une liste
                </button>
                <div class="auth-section">
                    <div v-if="authStore.isLoggedIn" class="user-profile">
                        <UserProfile />
                    </div>
                    <div v-else class="login-section">
                        <button @click="authStore.openLoginModal()" class="btn btn-login">
                            Se connecter
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="status-bar">
            <div v-if="authStore.isLoggedIn" class="status-connected">
                Connecté JWT : <strong>{{ authStore.userName }}</strong>
            </div>
            <div v-else class="status-visitor">
                Mode visiteur - Connectez-vous pour interagir avec le board
            </div>
        </div>

        <div v-if="boardStore.error || authStore.error" class="error-message">
            {{ boardStore.error || authStore.error }}
            <button @click="clearAllErrors" class="btn-close">&times;</button>
        </div>
        <div v-if="boardStore.loading || authStore.loading" class="loading">
            <div class="spinner"></div>
            <p>{{ boardStore.loading ? 'Chargement du board...' : 'Connexion en cours...' }}</p>
        </div>

        <div class="board-content" v-else>
            <div class="lists-container">
                <List v-for="list in boardStore.lists" :key="list.id" :list="list"
                    :posts="boardStore.getPostsByListId(list.id)" @update-list="handleUpdateList"
                    @delete-list="handleDeleteList" @create-post="handleCreatePost" />
                <div class="add-list-column">
                    <button @click="handleCreateListClick" class="add-list-btn"
                        :disabled="!authStore.canManageCategories" :title="authStore.isLoggedIn ?
                            (authStore.canManageCategories ? 'Ajouter une liste' : 'Permissions insuffisantes') :
                            'Connectez-vous pour ajouter une liste'">
                        + Ajouter une autre liste
                    </button>
                </div>
            </div>
        </div>

        <Modal v-if="showCreateListModal" @close="showCreateListModal = false">
            <template #header>
                <h3>Ajouter une liste</h3>
            </template>
            <template #body>
                <form @submit.prevent="handleCreateList">
                    <div class="form-group">
                        <label for="listName">Nom de la liste</label>
                        <input id="listName" v-model="newListName" type="text" required class="form-input"
                            placeholder="Entrez le nom de la liste" />
                    </div>
                    <div class="form-group">
                        <label for="listDescription">Description (optionnel)</label>
                        <textarea id="listDescription" v-model="newListDescription" class="form-input"
                            placeholder="Description de la liste"></textarea>
                    </div>
                </form>
            </template>
            <template #footer>
                <button @click="showCreateListModal = false" class="btn btn-secondary">
                    Annuler
                </button>
                <button @click="handleCreateList" class="btn btn-primary" :disabled="!newListName.trim()">
                    Créer la liste
                </button>
            </template>
        </Modal>

        <LoginModal v-if="authStore.showLoginModal" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import List from './List.vue'
import Modal from './ui/Modal.vue'
import UserProfile from './auth/UserProfile.vue'
import LoginModal from './auth/LoginModal.vue'
//const boardStore = {}
const boardStore = useBoardStore()
const authStore = useAuthStore()

const showCreateListModal = ref(false)
const newListName = ref('')
const newListDescription = ref('')

onMounted(async () => {
    await authStore.init()
    await boardStore.fetchLists();
    await boardStore.fetchPosts()
})

const clearAllErrors = () => {
    boardStore.clearError()
    authStore.clearError()
}

const handleCreateListClick = () => {
    /*return true;
    if (!authStore.requirePermission('manage_categories', 'créer une liste')) {
        return true;
    }*/
    showCreateListModal.value = true
}

const handleCreateList = async () => {
    if (!newListName.value.trim()) return

    try {

        const axiosInstance = axios.create({
            baseURL: 'http://localhost:10004/wp-json/wp/v2',
        });
        axiosInstance.interceptors.request.use(
            (config) => {
                const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjEwMDA0IiwiaWF0IjoxNzU4NzAyOTA3LCJuYmYiOjE3NTg3MDI5MDcsImV4cCI6MTc1OTMwNzcwNywiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMiJ9fX0.Wcm0omNc7_2ykhZEuKjisDzXkE59MJkti1YEVx1pCPM";
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const response = await axiosInstance.post('/categories', {
            name: newListName.value,
            description: newListDescription.value || "",

        });
        console.log(response.data);
        /*await boardStore.createList({
            name: newListName.value.trim(),
            description: newListDescription.value.trim()
        })*/

        newListName.value = ''
        newListDescription.value = ''
        showCreateListModal.value = false
    } catch (error) {
        console.error('Erreur lors de la création de la liste:', error)
    }
}


const handleUpdateList = async (listId, listData) => {
    /*if (!authStore.requirePermission('manage_categories', 'modifier cette liste')) {
        return
    }*/

    try {
        //await boardStore.updateList(listId, listData)
        const axiosInstance = axios.create({
            baseURL: 'http://localhost:10004/wp-json/wp/v2',
        });
        axiosInstance.interceptors.request.use(
            (config) => {
                const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjEwMDA0IiwiaWF0IjoxNzU4NzAyOTA3LCJuYmYiOjE3NTg3MDI5MDcsImV4cCI6MTc1OTMwNzcwNywiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMiJ9fX0.Wcm0omNc7_2ykhZEuKjisDzXkE59MJkti1YEVx1pCPM";
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const response = await axiosInstance.post('/categories/' + listId, listData);
        console.log(response.data);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la liste:', error)
    }
}

const handleDeleteList = async (listId) => {
    if (!authStore.requirePermission('manage_categories', 'supprimer cette liste')) {
        return
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette liste et tous ses éléments ?')) {
        try {
            await boardStore.deleteList(listId)
        } catch (error) {
            console.error('Erreur lors de la suppression de la liste:', error)
        }
    }
}

const handleCreatePost = async (postData) => {
    /*if (!authStore.requirePermission('edit_posts', 'créer une carte')) {
        return
    }*/

    try {
        await boardStore.createPost(postData)


        /*const reponse = await axios.post(
            "https://twp.coding-academy.website/wp-json/wp/v2/posts",
            {
                title: postData.title,
                content: postData.content || "",
                status: "publish",
                categories: postData.categories || [],
            }
        );
        console.log(reponse.data);*/
    } catch (error) {
        console.error('Erreur lors de la création du post:', error)
    }
}
</script>

<style scoped>
.board {
    height: 100vh;
    background: #fff;
    padding: 20px;
    overflow-x: auto;
}

.board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    color: white;
}

.board-title {
    font-size: 2rem;
    font-weight: bold;
    color: #0079bf;
    margin: 0;
}

.board-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.auth-section {
    display: flex;
    align-items: center;
}

.btn-login {
    background: rgba(255, 255, 255, 0.9);
    color: #0079bf;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.btn-login:hover {
    background: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-bar {
    margin-bottom: 16px;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
}

.status-connected {
    background: rgba(76, 175, 80, 0.15);
    color: #2e7d32;
    border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-visitor {
    background: rgba(176, 8, 16, 0.531);
    color: #FFFFFF;
    border: 1px solid rgba(255, 193, 7, 0.3);
    text-align: center;
    font-size: 1.3rem;
    font-weight: bold;
    padding: 10px;
    border-radius: 15px;
    position: inherit;

}

.board-content {
    height: calc(100vh - 180px);
}

.lists-container {
    display: flex;
    gap: 20px;
    height: 100%;
    padding-bottom: 20px;
}

.add-list-column {
    min-width: 272px;
    height: fit-content;
}

.add-list-btn {
    width: 100%;
    padding: 12px;
    background: rgba(3, 19, 241, 0.97);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.add-list-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.32);
}

.add-list-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.error-message {
    background: #f44336;
    color: white;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    margin-left: 10px;
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: white;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.btn-primary {
    background: #0079bf;
    color: white;
}

.btn-primary:hover {
    background: #005a8b;
}

.btn-secondary {
    background: #f4f5f7;
    color: #172b4d;
}

.btn-secondary:hover {
    background: #e4e6ea;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.form-group {
    margin-bottom: 16px;
    overflow: hidden;
}

.form-group label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: #172b4d;
}

.form-input {
    width: 100%;
    padding: 8px 12px;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #0079bf;
}

.form-input[type="textarea"] {
    resize: vertical;
    min-height: 80px;
}

/* Responsive */
@media (max-width: 768px) {
    .board-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }

    .board-actions {
        justify-content: space-between;
    }

    .status-bar {
        text-align: center;
    }
}
</style>
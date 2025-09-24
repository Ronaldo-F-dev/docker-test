<template>
    <div class="list">
        <div class="list-header">
            <h3 v-if="!isEditing" @click="startEditing" class="list-title" :title="list.description">
                {{ list.name }}
            </h3>
            <input v-else v-model="editTitle" @blur="saveEdit" @keyup.enter="saveEdit" @keyup.escape="cancelEdit"
                class="list-title-input" ref="titleInput" />

            <div class="list-options">
                <button @click="toggleMenu" class="options-btn">
                    ⋯
                </button>
                <div v-if="showMenu" class="options-menu" v-click-outside="closeMenu">
                    <button @click="startEditing" class="menu-item">
                        Modifier le titre
                    </button>
                    <button @click="showAddCard = true; closeMenu()" class="menu-item">
                        Ajouter une carte
                    </button>
                    <hr>
                    <button @click="deleteList" class="menu-item danger">
                        Supprimer la liste
                    </button>
                </div>
            </div>
        </div>
        <div class="list-body">
            <div class="cards-container">
                <Card v-for="post in posts" :key="post.id" :post="post" @update-post="handleUpdatePost"
                    @delete-post="handleDeletePost" @open-comments="handleOpenComments" />
            </div>
            <div v-if="!showAddCard" class="add-card-section">
                <button @click="showAddCard = true" class="add-card-btn">
                    + Ajouter une carte
                </button>
            </div>

            <div v-else class="add-card-form">
                <textarea v-model="newCardTitle" @keyup.enter="handleCreateCard" @keyup.escape="cancelAddCard"
                    placeholder="Saisissez un titre pour cette carte..." class="card-title-input"
                    ref="cardTitleInput"></textarea>

                <div class="add-card-actions">
                    <button @click="handleCreateCard" class="btn btn-primary" :disabled="!newCardTitle.trim()">
                        Ajouter une carte
                    </button>
                    <button @click="cancelAddCard" class="btn btn-cancel">
                        ✕
                    </button>
                </div>
            </div>
        </div>
        <Modal v-if="showCommentsModal" @close="showCommentsModal = false">
            <template #header>
                <h3>{{ selectedPost?.title?.rendered || 'Commentaires' }}</h3>
            </template>
            <template #body>
                <Comment v-if="selectedPost" :post="selectedPost" @close="showCommentsModal = false" />
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import Card from './Card.vue'
import Comment from './Comment.vue'
import Modal from './ui/Modal.vue'

const props = defineProps({
    list: {
        type: Object,
        required: true
    },
    posts: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update-list', 'delete-list', 'create-post'])

const isEditing = ref(false)
const editTitle = ref('')
const showMenu = ref(false)
const showAddCard = ref(false)
const newCardTitle = ref('')
const showCommentsModal = ref(false)
const selectedPost = ref(null)

const titleInput = ref(null)
const cardTitleInput = ref(null)

const startEditing = () => {
    editTitle.value = props.list.name
    isEditing.value = true
    nextTick(() => {
        titleInput.value?.focus()
        titleInput.value?.select()
    })
}

const saveEdit = () => {
    if (editTitle.value.trim() && editTitle.value !== props.list.name) {
        emit('update-list', props.list.id, {
            name: editTitle.value.trim()
        })
    }
    isEditing.value = false
}

const cancelEdit = () => {
    editTitle.value = props.list.name
    isEditing.value = false
}

const toggleMenu = () => {
    showMenu.value = !showMenu.value
}

const closeMenu = () => {
    showMenu.value = false
}

const handleCreateCard = () => {
    if (!newCardTitle.value.trim()) return

    emit('create-post', {
        title: newCardTitle.value.trim(),
        categories: [props.list.id],
        status: 'publish'
    })

    newCardTitle.value = ''
    showAddCard.value = false
}

const cancelAddCard = () => {
    newCardTitle.value = ''
    showAddCard.value = false
}

const handleUpdatePost = (postId, postData) => {
    emit('update-post', postId, postData)
}

const handleDeletePost = (postId) => {
    emit('delete-post', postId)
}

const handleOpenComments = (post) => {
    selectedPost.value = post
    showCommentsModal.value = true
}

const deleteList = () => {
    closeMenu()
    emit('delete-list', props.list.id)
}

watch(showAddCard, (newValue) => {
    if (newValue) {
        nextTick(() => {
            cardTitleInput.value?.focus()
        })
    }
})

const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = function (event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value()
            }
        }
        document.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent)
    }
}
</script>

<style scoped>
.list {
    width: 272px;
    background: #ebecf0;
    border-radius: 8px;
    padding: 8px;
    height: fit-content;
    max-height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 4px;
    margin-bottom: 8px;
    position: relative;
}

.list-title {
    font-size: 14px;
    font-weight: 600;
    color: #172b4d;
    margin: 0;
    cursor: pointer;
    flex: 1;
    padding: 4px;
    border-radius: 3px;
    transition: background-color 0.1s;
}

.list-title:hover {
    background: #ddd;
}

.list-title-input {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: #172b4d;
    border: 2px solid #0079bf;
    border-radius: 3px;
    padding: 4px;
    background: white;
    outline: none;
}

.list-options {
    position: relative;
}

.options-btn {
    background: none;
    border: none;
    font-size: 16px;
    color: #6b778c;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 3px;
    transition: background-color 0.1s;
}

.options-btn:hover {
    background: #ddd;
    color: #172b4d;
}

.options-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    z-index: 10;
    min-width: 180px;
    padding: 8px 0;
}

.menu-item {
    width: 100%;
    padding: 8px 16px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    color: #172b4d;
    transition: background-color 0.1s;
}

.menu-item:hover {
    background: #f4f5f7;
}

.menu-item.danger {
    color: #cf513d;
}

.menu-item.danger:hover {
    background: #ffebe6;
}

.options-menu hr {
    margin: 8px 0;
    border: none;
    border-top: 1px solid #ddd;
}

.list-body {
    flex: 1;
    overflow-y: auto;
}

.cards-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
}

.add-card-section {
    margin-top: 8px;
}

.add-card-btn {
    width: 100%;
    padding: 8px;
    background: none;
    border: none;
    color: #6b778c;
    cursor: pointer;
    border-radius: 8px;
    font-size: 14px;
    text-align: left;
    transition: all 0.1s;
}

.add-card-btn:hover {
    background: #ddd;
    color: #172b4d;
}

.add-card-form {
    margin-top: 8px;
}

.card-title-input {
    width: 100%;
    min-height: 54px;
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: none;
    outline: none;
    box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
    margin-bottom: 8px;
}

.add-card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn {
    padding: 6px 12px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.1s;
}

.btn-primary {
    background: #0079bf;
    color: white;
}

.btn-primary:hover {
    background: #005a8b;
}

.btn-primary:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.btn-cancel {
    background: none;
    color: #6b778c;
    font-size: 20px;
    padding: 4px 8px;
}

.btn-cancel:hover {
    color: #172b4d;
}
</style>
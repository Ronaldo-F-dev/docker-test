<template>
    <div class="card" @click="openCard">
        <div class="card-content">
            <h4 class="card-title">{{ post.title?.rendered || 'Sans titre' }}</h4>
            <div v-if="hasContent" class="card-description">
                {{ getContentPreview() }}
            </div>
            <div class="card-meta">
                <span class="card-date" :title="formatFullDate(post.date)">
                    {{ formatDate(post.date) }}
                </span>
                <span v-if="post.comment_status === 'open'" class="card-comments">
                    {{ commentCount }}
                </span>
            </div>
        </div>

        <div class="card-actions">
            <button @click.stop="toggleMenu" class="card-menu-btn">
                ⋯
            </button>

            <div v-if="showMenu" class="card-menu" v-click-outside="closeMenu">
                <button @click.stop="editCard" class="menu-item">
                    Modifier
                </button>
                <button @click.stop="openComments" class="menu-item">
                    Commentaires
                </button>
                <hr>
                <button @click.stop="deleteCard" class="menu-item danger">
                    Supprimer
                </button>
            </div>
        </div>
        <Modal v-if="showEditModal" @close="closeEditModal">
            <template #header>
                <h3>Modifier la carte</h3>
            </template>
            <template #body>
                <form @submit.prevent="saveCard">
                    <div class="form-group">
                        <label for="cardTitle">Titre</label>
                        <input id="cardTitle" v-model="editData.title" type="text" required class="form-input"
                            placeholder="Titre de la carte" />
                    </div>

                    <div class="form-group">
                        <label for="cardContent">Description</label>
                        <textarea id="cardContent" v-model="editData.content" class="form-input" rows="4"
                            placeholder="Description de la carte (optionnel)"></textarea>
                    </div>
                </form>
            </template>
            <template #footer>
                <button @click="closeEditModal" class="btn btn-secondary">
                    Annuler
                </button>
                <button @click="saveCard" class="btn btn-primary" :disabled="!editData.title.trim()">
                    Enregistrer
                </button>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from './ui/Modal.vue'

const props = defineProps({
    post: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update-post', 'delete-post', 'open-comments'])

const showMenu = ref(false)
const showEditModal = ref(false)
const editData = ref({
    title: '',
    content: ''
})

const hasContent = computed(() => {
    return props.post.content?.rendered &&
        props.post.content.rendered.replace(/<[^>]*>/g, '').trim().length > 0
})

const commentCount = computed(() => {
    return props.post.comment_count || 0
})
const getContentPreview = () => {
    if (!props.post.content?.rendered) return ''
    const text = props.post.content.rendered
        .replace(/<[^>]*>/g, '')
        .trim()

    return text.length > 100 ? text.substring(0, 100) + '...' : text
}

const formatDate = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`

    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    })
}

const formatFullDate = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const toggleMenu = () => {
    showMenu.value = !showMenu.value
}

const closeMenu = () => {
    showMenu.value = false
}

const openCard = () => {
    editCard()
}

const editCard = () => {
    editData.value = {
        title: props.post.title?.rendered || '',
        content: props.post.content?.rendered?.replace(/<[^>]*>/g, '') || ''
    }
    showEditModal.value = true
    closeMenu()
}

const saveCard = () => {
    if (!editData.value.title.trim()) return

    emit('update-post', props.post.id, {
        title: editData.value.title.trim(),
        content: editData.value.content.trim()
    })

    closeEditModal()
}

const closeEditModal = () => {
    showEditModal.value = false
    editData.value = { title: '', content: '' }
}

const openComments = () => {
    emit('open-comments', props.post)
    closeMenu()
}

const deleteCard = () => {
    closeMenu()
    if (confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
        emit('delete-post', props.post.id)
    }
}
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
.card {
    background: white;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    transition: box-shadow 0.1s ease;
    position: relative;
    border: 1px solid transparent;
}

.card:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-color: #ddd;
}

.card-content {
    margin-right: 20px;
}

.card-title {
    font-size: 14px;
    font-weight: 400;
    color: #172b4d;
    margin: 0 0 4px 0;
    line-height: 1.3;
    word-wrap: break-word;
}

.card-description {
    font-size: 12px;
    color: #6b778c;
    margin: 8px 0;
    line-height: 1.4;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 11px;
    color: #6b778c;
}

.card-date {
    display: flex;
    align-items: center;
}

.card-comments {
    display: flex;
    align-items: center;
    gap: 2px;
}

.card-actions {
    position: absolute;
    top: 4px;
    right: 4px;
}

.card-menu-btn {
    background: none;
    border: none;
    font-size: 14px;
    color: #6b778c;
    cursor: pointer;
    padding: 4px;
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.1s, background-color 0.1s;
}

.card:hover .card-menu-btn {
    opacity: 1;
}

.card-menu-btn:hover {
    background: #f4f5f7;
    color: #172b4d;
}

.card-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    z-index: 10;
    min-width: 160px;
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

.card-menu hr {
    margin: 8px 0;
    border: none;
    border-top: 1px solid #ddd;
}

.form-group {
    margin-bottom: 16px;
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
    font-family: inherit;
}

.form-input:focus {
    outline: none;
    border-color: #0079bf;
}

.form-input[type="textarea"],
textarea.form-input {
    resize: vertical;
    min-height: 80px;
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
</style>
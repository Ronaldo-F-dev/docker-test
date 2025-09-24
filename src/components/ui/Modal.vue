<template>
    <div class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
            <div class="modal-header">
                <slot name="header">
                    <h3>Modal</h3>
                </slot>
                <button @click="closeModal" class="modal-close-btn">
                    ✕
                </button>
            </div>

            <div class="modal-body">
                <slot name="body">
                    <p>Contenu du modal</p>
                </slot>
            </div>

            <div class="modal-footer" v-if="$slots.footer">
                <slot name="footer">
                    <button @click="closeModal" class="btn btn-secondary">Fermer</button>
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close'])

const closeModal = () => {
    emit('close')
}

const handleEscape = (event) => {
    if (event.key === 'Escape') {
        closeModal()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px 16px;
    border-bottom: 1px solid #ddd;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #172b4d;
}

.modal-close-btn {
    background: none;
    border: none;
    font-size: 16px;
    color: #6b778c;
    cursor: pointer;
    padding: 4px;
    border-radius: 3px;
    transition: all 0.1s;
}

.modal-close-btn:hover {
    background: #f4f5f7;
    color: #172b4d;
}

.modal-body {
    padding: 20px 24px;
    overflow-y: auto;
    flex: 1;
}

.modal-footer {
    padding: 16px 24px 20px;
    border-top: 1px solid #ddd;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.modal-footer .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.modal-footer .btn-primary {
    background: #0079bf;
    color: white;
}

.modal-footer .btn-primary:hover {
    background: #005a8b;
}

.modal-footer .btn-secondary {
    background: #f4f5f7;
    color: #172b4d;
}

.modal-footer .btn-secondary:hover {
    background: #e4e6ea;
}

.modal-footer .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.modal-overlay {
    animation: fadeIn 0.2s ease-out;
}

.modal-container {
    animation: slideIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@media (max-width: 768px) {
    .modal-overlay {
        padding: 10px;
    }

    .modal-container {
        max-width: 100%;
        max-height: 95vh;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding-left: 16px;
        padding-right: 16px;
    }
}
</style>
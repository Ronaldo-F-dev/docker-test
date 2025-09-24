<template>
    <div class="board-view">
        <Board />
    </div>
</template>

<script setup>
import Board from '@/components/Board.vue'
</script>

<style scoped>
.board-view {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}
</style>
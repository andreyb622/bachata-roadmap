<script setup lang="ts">
interface Props {
  id: string;
  text: string;
  checked: boolean;
}

defineProps<Props>();

const emit = defineEmits<{ toggle: [id: string] }>();
</script>

<template>
  <label class="checklist-item" data-test="checklist-item">
    <input
      type="checkbox"
      class="checklist-item__input"
      :checked="checked"
      @change="emit('toggle', id)"
    />
    <span class="checklist-item__check" aria-hidden="true"></span>
    <span class="checklist-item__text">{{ text }}</span>
  </label>
</template>

<style scoped src="./ChecklistItem.css"></style>

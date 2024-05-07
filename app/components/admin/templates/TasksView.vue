<template>
  <div class="container-tasks-view ? pt-1">
    <div v-for="(task, i) in tasks" :key="i" class="pb-2">
      <header class="task-toolbar | terciary d-flex pa-2 align-center rounded">
        <div class="d-flex flex-column pl-2">
          <h2 class="task-title flex-shrink-1">{{ task.title }}</h2>
        </div>

        <v-spacer></v-spacer>

        <v-tooltip
          v-if="task.type !== 'inspections'"
          open-delay="600"
          content-class="small"
          top
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mr-2"
              icon
              color="primary"
              x-small
              v-bind="attrs"
              v-on="on"
              @click="handlerEditTask(task)"
            >
              <v-icon size="17">mdi-text-box-edit-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('editTask') }}</span>
        </v-tooltip>
        <v-tooltip
          v-if="task.type !== 'inspections'"
          open-delay="600"
          content-class="small"
          top
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mr-1"
              icon
              x-small
              v-bind="attrs"
              v-on="on"
              @click="handlerDeleteTask(task)"
            >
              <v-icon color="error" size="17">mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('deleteTask') }}</span>
        </v-tooltip>
      </header>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TasksView',
  props: {
    tasks: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {}
  },

  methods: {
    handlerDeleteTask(task) {
      this.$emit('delete-task', task)
    },
    handlerEditTask(task) {
      this.$emit('edit-task', task)
    },
  },
}
</script>

<style lang="scss" scoped>
.task-title {
  font-size: 1.125rem;
}
</style>

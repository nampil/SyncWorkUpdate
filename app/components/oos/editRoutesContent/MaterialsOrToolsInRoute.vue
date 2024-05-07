<template>
  <div class="materials-container | pt-2">
    <p class="ma-0 pa-0 caption">
      <span class="info_stops--text">{{ $t('materialsOrTools') }}: </span>

      <span v-for="(material, idx) in materialsInRoute" :key="idx">
        {{ material }}{{ idx !== materialsInRoute.length - 1 ? ', ' : '.' }}
      </span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'MaterialsOrTools',
  components: {},
  props: {
    orders: { type: Array, default: () => [] },
    editing: { type: Boolean, default: true },
  },
  data() {
    return { showMaterialsInRoute: false }
  },
  computed: {
    materialsInRoute() {
      if (!this.orders?.length) {
        return []
      }
      const materialsInRoute = []
      for (let i = 0; i < this.orders.length; i++) {
        const order = this.orders[i]
        if (!order) continue
        const allowables = order.allowables || []
        const workToDos = order.workToDos || []
        const _tasks = workToDos.concat(allowables)

        for (let j = 0; j < _tasks.length; j++) {
          const task = _tasks[j]

          if (task && task.materialsOrTools?.length) {
            for (let k = 0; k < task.materialsOrTools.length; k++) {
              const material = task.materialsOrTools[k]

              if (!materialsInRoute.includes(material.title)) {
                materialsInRoute.push(material.title)
              }
            }
          }
        }
      }

      return materialsInRoute
    },
  },
}
</script>

<style lang="scss" scoped></style>

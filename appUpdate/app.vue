<template>
  <NuxtLayout> <NuxtPage></NuxtPage> </NuxtLayout>
</template>
<script setup>
import { onBeforeMount, ref, watch } from 'vue'

import { useAuthStore } from '@@/store/auth'

const authStore = useAuthStore()


const user = useCurrentUser()
const router = useRouter()
const route = useRoute()

watch(
  user,
  async (currentUser, previousUser) => {
    // eslint-disable-next-line
    console.log('Watch user')

    if (!currentUser && previousUser) {
      return router.push({ name: 'login' })
    }

    if (currentUser && !previousUser) {
      await authStore.getUser()

      return router.push(route.query.redirect || '/')
    }
  },
  { immediate: true }
)

const layout = ref('default')
onBeforeMount(() => {
  if (route.path !== '/login') {
    layout.value = 'dash'
  }
})
</script>

<style lang="scss">
@use '~/assets/scss/main.scss';
</style>

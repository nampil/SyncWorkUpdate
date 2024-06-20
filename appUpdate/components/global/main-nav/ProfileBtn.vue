<template>
  <v-menu min-width="200px" rounded>
    <template v-slot:activator="{ props }">
      <v-btn size="small" icon v-bind="props" :loading="!user">
        <v-avatar v-if="user" color="accent">
          <v-img
            v-if="user.photoURL"
            :alt="`${user.displayName} Profile Picture`"
            :src="user.photoURL"
          ></v-img>
          <span v-else class="text-h6">NM</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-card-text>
        <div v-if="user" class="mx-auto text-center">
          <v-avatar v-if="user" color="accent">
            <v-img
              v-if="user.photoURL"
              :alt="`${user.displayName} Profile Picture`"
              :src="user.photoURL"
            ></v-img>
            <span v-else class="text-h6">NM</span>
          </v-avatar>
          <h3>{{ user.displayName }}</h3>
          <p class="text-caption mt-1">
            {{ user.email }}
          </p>
          <v-divider class="my-3"></v-divider>
          <v-btn variant="text" rounded> Edit Account </v-btn>
          <v-divider class="my-3"></v-divider>
          <v-btn variant="text" rounded @click="logout"> Disconnect </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()

const user = ref(null)

const logout = async () => {
  await authStore.logout()
}

onMounted(async () => {
  user.value = await getCurrentUser()
})
</script>

<style lang="scss" scoped></style>

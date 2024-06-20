<template>
  <v-app>
    <main-nav />
    <v-main scrollable> <slot></slot> </v-main>
    <v-footer name="footer" app>
      <v-spacer />
      <span>&copy; 2024</span>
    </v-footer>
  </v-app>
</template>

<script setup></script>

<style lang="scss" scoped></style>

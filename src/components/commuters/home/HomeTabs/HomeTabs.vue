<template>
  <!-- Tabs -->
  <ul class="nav nav-tabs home-tabs">
    <li class="nav-item">
      <button
        class="nav-link"
        :class="{ active: activeTab === 'explore' }"
        @click="activeTab = 'explore'"
      >
        Explore
      </button>
    </li>

    <li class="nav-item">
      <button
        class="nav-link"
        :class="{ active: activeTab === 'favorites' }"
        @click="activeTab = 'favorites'"
      >
        Favorites
      </button>
    </li>

    <li class="nav-item">
      <button
        class="nav-link"
        :class="{ active: activeTab === 'home' }"
        @click="activeTab = 'home'"
      >
        Home
      </button>
    </li>
  </ul>

  <!-- Tab content -->
  <div class="tab-content">
    <ExploreTab v-if="activeTab === 'explore'" />
    <FavoritesTab v-if="activeTab === 'favorites'" />
    <HomeTab v-if="activeTab === 'home'" />
  </div>
</template>

<script setup>
import { ref } from "vue"
import ExploreTab from "./ExploreTab.vue"
import FavoritesTab from "./FavoritesTab.vue"
import HomeTab from "./HomeTabLocation.vue"

const activeTab = ref("explore")
</script>

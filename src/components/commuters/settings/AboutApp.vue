<template>
  <div class="page active">
    <SettingsHeader
      title="About"
      subtitle="App info and credits"
      back
    />

    <div class="page-content">
      <!-- App card -->
      <div class="about-hero">
        <div class="about-logo">
          <i class="fas fa-bus"></i>
        </div>

        <div class="about-meta">
          <p class="about-name">NATSGO</p>
          <p class="about-version">Version {{ version }}</p>

          <div class="about-tags">
            <span class="about-tag">
              <i class="fas fa-shield-halved"></i> Safe
            </span>
            <span class="about-tag">
              <i class="fas fa-bolt"></i> Fast
            </span>
            <span class="about-tag">
              <i class="fas fa-location-dot"></i> Smart Routes
            </span>
          </div>
        </div>
      </div>

      <!-- Info section -->
      <div class="settings-section">
        <p class="section-label">Overview</p>

        <div class="about-card">
          <p class="about-text">
            NATSGO helps commuters check routes, track buses, and manage alerts in one place.
            Built to be simple, reliable, and easy to use.
          </p>
        </div>
      </div>

      <!-- Quick links -->
      <div class="settings-section">
        <p class="section-label">More</p>

        <button class="settings-item" type="button" @click="go('/settings/privacy')">
          <div class="settings-text">
            <p class="item-title">Privacy Policy</p>
            <p class="item-description">How we protect your info</p>
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>

        <button class="settings-item" type="button" @click="go('/settings/terms')">
          <div class="settings-text">
            <p class="item-title">Terms of Service</p>
            <p class="item-description">Rules and guidelines</p>
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- footer -->
      <div class="about-footer">
        <div class="about-foot-row">
          <i class="fas fa-envelope"></i>
          <p>Support: <b>support@natsgo.app</b></p>
        </div>

        <div class="about-foot-row subtle">
          <i class="fas fa-copyright"></i>
          <p>{{ new Date().getFullYear() }} NATSGO • All rights reserved</p>
        </div>
      </div>

      <div class="bottom-space"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import SettingsHeader from "./SettingsHeader.vue"

const router = useRouter()
const version = ref("1.0.0")

function go(path) {
  router.push(path)
}
</script>

<style scoped>
/* Hero */
.about-hero{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 18px;
  padding: 16px;
  display:flex;
  gap: 12px;
  align-items:center;
  margin-bottom: 18px;
}

.about-logo{
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  background: rgba(0, 188, 212, 0.10);
  border: 1px solid rgba(0, 188, 212, 0.18);
  color: var(--accent-teal);
}

.about-logo i{ font-size: 22px; }

.about-meta{ flex: 1; }

.about-name{
  margin: 0;
  font-weight: 950;
  color: var(--text-dark);
  font-size: 16px;
  letter-spacing: 0.2px;
}

.about-version{
  margin: 6px 0 0 0;
  font-size: 12.5px;
  font-weight: 750;
  color: rgba(38,43,51,0.72);
}

/* Small soft tags */
.about-tags{
  margin-top: 10px;
  display:flex;
  flex-wrap:wrap;
  gap: 8px;
}

.about-tag{
  display:inline-flex;
  align-items:center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: rgba(38,43,51,0.74);
  background: rgba(245, 247, 250, 0.9);
  border: 1px solid rgba(209, 213, 219, 0.75);
}
.about-tag i{ color: var(--accent-teal); }

/* Overview card */
.about-card{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 14px;
  padding: 14px;
}

.about-text{
  margin: 0;
  color: rgba(38,43,51,0.78);
  font-size: 12.5px;
  font-weight: 650;
  line-height: 1.5;
}

/* Footer box */
.about-footer{
  margin-top: 16px;
  border-radius: 14px;
  padding: 14px;
  background: rgba(245, 247, 250, 0.7);
  border: 1px solid rgba(209, 213, 219, 0.8);
}

.about-foot-row{
  display:flex;
  align-items:flex-start;
  gap: 10px;
  color: rgba(38,43,51,0.78);
  font-size: 12px;
  font-weight: 750;
  line-height: 1.4;
}
.about-foot-row i{
  margin-top: 2px;
  color: var(--accent-teal);
}

.about-foot-row + .about-foot-row{
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(209, 213, 219, 0.7);
}

.about-foot-row.subtle i{ color: var(--primary-blue); }

.bottom-space{ height: 12px; }
</style>

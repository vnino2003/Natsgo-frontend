<template>
  <div class="page active">
    <SettingsHeader
      title="Settings"
      subtitle="Control your account, privacy, and app experience"
    />

    <div class="page-content">
      <!-- profile card -->
      <div class="settings-hero">
        <div class="hero-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="hero-text">
          <p class="hero-name">Commuter</p>
          <p class="hero-meta">Manage your account & preferences</p>
        </div>
        <button class="hero-chip" type="button">
          <i class="fas fa-shield-halved"></i>
          Safe
        </button>
      </div>

      <!-- ACCOUNT -->
      <div class="settings-section">
        <p class="section-label">Account</p>

        <SettingRow
          icon="fas fa-id-card"
          title="Account"
          desc="Profile, email, and basic info"
          to="/settings/account"
          @go="go"
        />

        <SettingRow
          icon="fas fa-lock"
          title="Security"
          desc="Password and safety controls"
          to="/settings/security"
          @go="go"
        />
      </div>

      <!-- PREFERENCES -->
      <div class="settings-section">
        <p class="section-label">Preferences</p>

        <SettingRow
          icon="fas fa-bell"
          title="Notifications"
          desc="Alerts and updates"
          to="/settings/notifications"
          @go="go"
        />

        <SettingRow
          icon="fas fa-language"
          title="Language"
          desc="Choose app language"
          to="/settings/language"
          @go="go"
        />

        <SettingRow
          icon="fas fa-palette"
          title="Theme"
          desc="Light/dark and accent feel"
          to="/settings/theme"
          @go="go"
        />
      </div>

      <!-- FEEDBACK -->
      <div class="settings-section">
        <p class="section-label">Feedback</p>

    

        <SettingRow
          icon="fas fa-paper-plane"
          title="Send feedback"
          desc="Report bugs or suggestions"
          to="/settings/feedback"
          @go="go"
        />
      </div>

      <!-- ABOUT -->
      <div class="settings-section">
        <p class="section-label">About</p>

        <SettingRow
          icon="fas fa-circle-info"
          title="About app"
          desc="Version and details"
          to="/settings/about"
          @go="go"
        />

        <SettingRow
          icon="fas fa-user-shield"
          title="Privacy policy"
          desc="How we handle your data"
          to="/settings/privacy"
          @go="go"
        />

        <SettingRow
          icon="fas fa-file-signature"
          title="Terms of service"
          desc="Rules and usage terms"
          to="/settings/terms"
          @go="go"
        />
      </div>

      <!-- small footer -->
      <div class="settings-foot">
        <small>Bus+ • Settings</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import SettingsHeader from "./SettingsHeader.vue"
import SettingRow from "./SettingRow.vue"

const router = useRouter()
function go(path) {
  router.push(path)
}
</script>

<style scoped>
/* hero */
.settings-hero{
  background: radial-gradient(circle at 20% 10%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%),
    linear-gradient(135deg, #0D47A1 0%, #1E88E5 35%, #00BCD4 100%);
  color:#fff;
  border-radius: 16px;
  padding: 16px;
  display:flex;
  align-items:center;
  gap: 12px;
  margin-bottom: 18px;
  box-shadow: 0 10px 24px rgba(30, 136, 229, 0.18);
}

.hero-avatar{
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255,255,255,0.18);
  display:flex;
  align-items:center;
  justify-content:center;
}
.hero-avatar i{ font-size: 20px; }

.hero-text{ flex:1; }
.hero-name{
  margin:0;
  font-weight: 900;
  letter-spacing: .2px;
}
.hero-meta{
  margin: 4px 0 0;
  font-size: 12px;
  opacity: .9;
}

.hero-chip{
  border: none;
  border-radius: 999px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.18);
  color:#fff;
  display:flex;
  align-items:center;
  gap: 8px;
  font-weight: 800;
  cursor:pointer;
}
.hero-chip:active{ transform: scale(.98); }

.settings-foot{
  text-align:center;
  color: rgba(38, 43, 51, 0.6);
  padding: 10px 0 4px;
}
</style>

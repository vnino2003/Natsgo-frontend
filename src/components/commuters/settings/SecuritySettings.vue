<template>
  <div class="page active">
    <SettingsHeader
      title="Security"
      subtitle="Protect your account"
      back
    />

    <div class="page-content">
      <!-- Security hero card -->
      <div class="security-card">
        <div class="security-icon">
          <i class="fas fa-shield-halved"></i>
        </div>
        <div class="security-text">
          <p class="security-title">Account Protection</p>
          <p class="security-desc">
            Manage your password and active sessions
          </p>
        </div>
      </div>

      <!-- Security actions -->
      <div class="settings-section">
        <p class="section-label">Security Actions</p>

        <div class="settings-item" @click="changePassword">
          <div class="settings-text">
            <p class="item-title">
              <i class="fas fa-key item-ico"></i>
              Change Password
            </p>
            <p class="item-description">
              Update your account password
            </p>
          </div>
          <i class="fas fa-chevron-right"></i>
        </div>

        <div class="settings-item danger" @click="logoutAll">
          <div class="settings-text">
            <p class="item-title">
              <i class="fas fa-right-from-bracket item-ico danger-ico"></i>
              Log out from all devices
            </p>
            <p class="item-description">
              End all active sessions
            </p>
          </div>
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>

      <!-- Tip -->
      <div class="security-tip">
        <i class="fas fa-circle-info"></i>
        <p>
          Tip: Change your password regularly to keep your account safe.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import SettingsHeader from "./SettingsHeader.vue"

function changePassword() {
  // later: router.push('/settings/security/change-password')
  console.log("Change password")
}

function logoutAll() {
  // later: show confirm modal
  console.log("Logout all devices")
}
</script>

<style scoped>
/* ===== Security Hero Card ===== */
.security-card{
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 18px;
  display:flex;
  gap: 14px;
  align-items:flex-start;
  background:
    radial-gradient(circle at 18% 12%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%),
    linear-gradient(135deg, #263238 0%, #37474F 40%, #00838F 100%);
  color: #fff;
  box-shadow: 0 14px 28px rgba(0,0,0,0.18);
}

.security-icon{
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.22);
  flex-shrink:0;
}
.security-icon i{ font-size: 22px; }

.security-title{
  margin:0;
  font-size: 16px;
  font-weight: 900;
}
.security-desc{
  margin: 6px 0 0 0;
  font-size: 12px;
  font-weight: 700;
  opacity: .9;
}

/* icons in list */
.item-ico{
  margin-right: 8px;
  color: var(--accent-teal);
  font-size: 14px;
}
.danger-ico{
  color: var(--error-red);
}

/* danger row emphasis */
.settings-item.danger{
  border-color: rgba(239, 68, 68, 0.25);
}
.settings-item.danger:hover{
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.45);
}

/* tip box */
.security-tip{
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  display:flex;
  gap: 10px;
  align-items:flex-start;
  background: #fff;
  border: 2px dashed rgba(0, 188, 212, 0.35);
  color: var(--text-gray);
}
.security-tip i{
  color: var(--accent-teal);
  margin-top: 2px;
}
.security-tip p{
  margin:0;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.35;
}
</style>
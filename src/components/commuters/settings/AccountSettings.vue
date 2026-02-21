<template>
  <div class="page active">
    <SettingsHeader
      title="Account"
      subtitle="Your profile information"
      back
    />

    <div class="page-content">
      <!-- Profile summary -->
      <div class="profile-card soft">
        <div class="profile-avatar soft">
          <i class="fas fa-user"></i>
        </div>

        <p class="profile-name">Juan Dela Cruz</p>
        <p class="profile-email">user@email.com</p>

        <button class="btn-edit-profile soft">
          <i class="fas fa-pen"></i>
          Edit Profile
        </button>
      </div>

      <!-- Details -->
      <div class="settings-section">
        <p class="section-label">Account Details</p>

        <div class="settings-item static">
          <div class="settings-text">
            <p class="item-title">Full Name</p>
            <p class="item-description">Juan Dela Cruz</p>
          </div>
        </div>

        <div class="settings-item static">
          <div class="settings-text">
            <p class="item-title">Email Address</p>
            <p class="item-description">user@email.com</p>
          </div>
        </div>

        <div class="settings-item static">
          <div class="settings-text">
            <p class="item-title">Account Type</p>
            <p class="item-description">Standard User</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import SettingsHeader from "./SettingsHeader.vue"
</script>

<style scoped>
/* ===== Profile Card (hero look) ===== */
/* ===== Profile Card (soft & calm) ===== */
.profile-card.soft{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 16px;
  padding: 18px 16px;
  margin-bottom: 18px;
  text-align: center;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.04);
}

/* Avatar */
.profile-avatar.soft{
  width: 64px;
  height: 64px;
  border-radius: 16px;
  margin: 0 auto 10px;
  display:flex;
  align-items:center;
  justify-content:center;

  background: rgba(0, 188, 212, 0.08);
  color: var(--accent-teal);
  border: 1px solid rgba(0, 188, 212, 0.25);
}

.profile-avatar.soft i{
  font-size: 26px;
}

/* Name & email */
.profile-name{
  margin: 6px 0 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
}

.profile-email{
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-gray);
}

/* Edit button (quiet CTA) */
.btn-edit-profile.soft{
  margin-top: 14px;
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  font-weight: 700;
  cursor: pointer;

  background: rgba(0, 188, 212, 0.08);
  color: var(--accent-teal);
  border: 1.5px solid rgba(0, 188, 212, 0.35);

  display:flex;
  align-items:center;
  justify-content:center;
  gap: 8px;

  transition: background .2s ease, transform .15s ease;
}

.btn-edit-profile.soft:hover{
  background: rgba(0, 188, 212, 0.12);
}

.btn-edit-profile.soft:active{
  transform: scale(0.98);
}

/* ===== Static items refinement ===== */
.settings-item.static{
  cursor: default;
}

.settings-item.static:hover{
  background: var(--bg-white);
  border-color: var(--border-light);
}

.settings-item.static:active{
  transform: none;
}

/* Make values clearer but calm */
.item-description{
  font-weight: 600;
  color: rgba(38, 43, 51, 0.85);
}

/* Mobile polish */


</style>


<template>
  <div class="page active">
    <SettingsHeader
      title="Privacy Policy"
      subtitle="How we handle your information"
      back
    />

    <div class="page-content">
      <!-- Soft intro -->
      <div class="privacy-hero">
        <div class="privacy-hero-icon">
          <i class="fas fa-shield-halved"></i>
        </div>

        <div class="privacy-hero-text">
          <p class="privacy-hero-title">Your privacy matters</p>
          <p class="privacy-hero-desc">
            This explains what we collect, how we use it, and how we protect it while you use NATSGO.
          </p>

          <span class="privacy-meta">
            <i class="fas fa-clock"></i>
            Last updated: Jan 2026
          </span>
        </div>
      </div>

      <!-- Sections -->
      <div class="settings-section">
        <p class="section-label">1. Data We Collect</p>

        <div class="privacy-card">
          <div class="privacy-card-head">
            <i class="fas fa-database"></i>
            <p class="privacy-card-title">Only what’s needed</p>
          </div>
          <p class="privacy-card-body">
            We collect only the information required for core features like route tracking,
            notifications, and saved preferences. We avoid collecting unnecessary data.
          </p>
        </div>
      </div>

      <div class="settings-section">
        <p class="section-label">2. How We Use Data</p>

        <div class="privacy-card">
          <div class="privacy-card-head">
            <i class="fas fa-chart-line"></i>
            <p class="privacy-card-title">To improve the experience</p>
          </div>
          <p class="privacy-card-body">
            Your data is used to keep the app working smoothly, improve reliability, and personalize settings.
            We do not sell personal information.
          </p>
        </div>
      </div>

      <div class="settings-section">
        <p class="section-label">3. Protection & Security</p>

        <div class="privacy-card">
          <div class="privacy-card-head">
            <i class="fas fa-lock"></i>
            <p class="privacy-card-title">Safety measures</p>
          </div>
          <p class="privacy-card-body">
            We apply reasonable security controls to reduce the risk of unauthorized access,
            alteration, or disclosure of your information.
          </p>
        </div>
      </div>

      <div class="settings-section">
        <p class="section-label">4. Your Choices</p>

        <div class="privacy-card">
          <div class="privacy-card-head">
            <i class="fas fa-sliders"></i>
            <p class="privacy-card-title">You’re in control</p>
          </div>
          <p class="privacy-card-body">
            You may manage permissions (like location and notifications) through your device settings.
            Some features may not work fully if permissions are turned off.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="privacy-footer">
        <div class="privacy-footer-row">
          <i class="fas fa-circle-info"></i>
          <p>
            Continuing to use the app means you accept the latest version of this policy.
          </p>
        </div>

        <div class="privacy-footer-row subtle">
          <i class="fas fa-envelope"></i>
          <p>
            Questions? Contact us: <b>privacy@natsgo.app</b>
          </p>
        </div>
      </div>

      <div class="bottom-space"></div>
    </div>
  </div>
</template>

<script setup>
import SettingsHeader from "./SettingsHeader.vue"
</script>

<style scoped>
/* Hero */
.privacy-hero{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 18px;
  padding: 16px;
  display:flex;
  gap: 12px;
  align-items:flex-start;
  margin-bottom: 18px;
}

.privacy-hero-icon{
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  background: rgba(30, 136, 229, 0.10);
  border: 1px solid rgba(30, 136, 229, 0.20);
  color: var(--primary-blue);
}

.privacy-hero-icon i{ font-size: 20px; }

.privacy-hero-text{ flex: 1; }

.privacy-hero-title{
  margin: 0;
  font-weight: 900;
  color: var(--text-dark);
  font-size: 14px;
}

.privacy-hero-desc{
  margin: 6px 0 10px;
  color: rgba(38,43,51,0.78);
  font-size: 12.5px;
  font-weight: 650;
  line-height: 1.45;
}

.privacy-meta{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 188, 212, 0.08);
  border: 1px solid rgba(0, 188, 212, 0.18);
  color: rgba(38,43,51,0.75);
  font-size: 11px;
  font-weight: 800;
}
.privacy-meta i{ color: var(--accent-teal); }

/* Cards */
.privacy-card{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 14px;
  padding: 14px 14px 12px;
}

.privacy-card-head{
  display:flex;
  align-items:center;
  gap: 10px;
  margin-bottom: 8px;
}

.privacy-card-head i{
  color: var(--accent-teal);
  font-size: 16px;
}

.privacy-card-title{
  margin: 0;
  font-weight: 900;
  color: var(--text-dark);
  font-size: 13px;
}

.privacy-card-body{
  margin: 0;
  color: rgba(38,43,51,0.78);
  font-size: 12.5px;
  font-weight: 650;
  line-height: 1.5;
}

/* Footer */
.privacy-footer{
  margin-top: 16px;
  border-radius: 14px;
  padding: 14px;
  background: rgba(245, 247, 250, 0.7);
  border: 1px solid rgba(209, 213, 219, 0.8);
}

.privacy-footer-row{
  display:flex;
  align-items:flex-start;
  gap: 10px;
  color: rgba(38,43,51,0.78);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.privacy-footer-row + .privacy-footer-row{
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(209, 213, 219, 0.7);
}

.privacy-footer-row i{
  margin-top: 2px;
  color: var(--accent-teal);
}

.privacy-footer-row.subtle i{
  color: var(--primary-blue);
}

.bottom-space{ height: 12px; }
</style>

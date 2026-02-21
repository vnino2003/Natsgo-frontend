<template>
  <div class="page active">
    <SettingsHeader
      title="Terms of Service"
      subtitle="Please read before using the app"
      back
    />

    <div class="page-content">
      <!-- Soft intro -->
      <div class="terms-hero">
        <div class="terms-hero-icon">
          <i class="fas fa-file-contract"></i>
        </div>

        <div class="terms-hero-text">
          <p class="terms-hero-title">Agreement</p>
          <p class="terms-hero-desc">
            By using NATSGO, you agree to these terms. They help keep the app safe,
            fair, and reliable for everyone.
          </p>

          <span class="terms-meta">
            <i class="fas fa-clock"></i>
            Last updated: Jan 2026
          </span>
        </div>
      </div>

      <!-- Sections -->
      <div class="settings-section">
        <p class="section-label">1. Allowed Use</p>

        <div class="terms-card">
          <div class="terms-card-head">
            <i class="fas fa-check-circle"></i>
            <p class="terms-card-title">Use the app responsibly</p>
          </div>
          <p class="terms-card-body">
            You may use the app only for lawful purposes and in accordance with local regulations.
            Misuse, abuse, or attempts to disrupt the service are prohibited.
          </p>
        </div>
      </div>

      <div class="settings-section">
        <p class="section-label">2. Your Responsibility</p>

        <div class="terms-card">
          <div class="terms-card-head">
            <i class="fas fa-user-shield"></i>
            <p class="terms-card-title">Account safety</p>
          </div>
          <p class="terms-card-body">
            You are responsible for keeping your account secure and for activities performed
            using your account. If you suspect unauthorized access, update your password immediately.
          </p>
        </div>
      </div>

      <div class="settings-section">
        <p class="section-label">3. Service Updates</p>

        <div class="terms-card">
          <div class="terms-card-head">
            <i class="fas fa-rotate"></i>
            <p class="terms-card-title">Changes may happen</p>
          </div>
          <p class="terms-card-body">
            We may improve, modify, suspend, or discontinue features at any time to maintain quality,
            security, or performance—sometimes without prior notice.
          </p>
        </div>
      </div>

      <!-- Footer / Contact -->
      <div class="terms-footer">
        <div class="terms-footer-row">
          <i class="fas fa-circle-info"></i>
          <p>
            Continuing to use the app means you accept the latest version of these terms.
          </p>
        </div>

        <div class="terms-footer-row subtle">
          <i class="fas fa-envelope"></i>
          <p>
            Questions? Contact us: <b>support@natsgo.app</b>
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
.terms-hero{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 18px;
  padding: 16px;
  display:flex;
  gap: 12px;
  align-items:flex-start;
  margin-bottom: 18px;
}

.terms-hero-icon{
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  background: rgba(0, 188, 212, 0.10);
  border: 1px solid rgba(0, 188, 212, 0.25);
  color: var(--accent-teal);
}

.terms-hero-icon i{ font-size: 20px; }

.terms-hero-text{ flex: 1; }
.terms-hero-title{
  margin: 0;
  font-weight: 900;
  color: var(--text-dark);
  font-size: 14px;
}
.terms-hero-desc{
  margin: 6px 0 10px;
  color: rgba(38,43,51,0.78);
  font-size: 12.5px;
  font-weight: 650;
  line-height: 1.45;
}

.terms-meta{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(30, 136, 229, 0.08);
  border: 1px solid rgba(30, 136, 229, 0.18);
  color: rgba(38,43,51,0.75);
  font-size: 11px;
  font-weight: 800;
}
.terms-meta i{ color: var(--primary-blue); }

/* Cards */
.terms-card{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 14px;
  padding: 14px 14px 12px;
}

.terms-card-head{
  display:flex;
  align-items:center;
  gap: 10px;
  margin-bottom: 8px;
}

.terms-card-head i{
  color: var(--accent-teal);
  font-size: 16px;
}

.terms-card-title{
  margin: 0;
  font-weight: 900;
  color: var(--text-dark);
  font-size: 13px;
}

.terms-card-body{
  margin: 0;
  color: rgba(38,43,51,0.78);
  font-size: 12.5px;
  font-weight: 650;
  line-height: 1.5;
}

/* Footer */
.terms-footer{
  margin-top: 16px;
  border-radius: 14px;
  padding: 14px;
  background: rgba(245, 247, 250, 0.7);
  border: 1px solid rgba(209, 213, 219, 0.8);
}

.terms-footer-row{
  display:flex;
  align-items:flex-start;
  gap: 10px;
  color: rgba(38,43,51,0.78);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.terms-footer-row + .terms-footer-row{
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(209, 213, 219, 0.7);
}

.terms-footer-row i{
  margin-top: 2px;
  color: var(--accent-teal);
}

.terms-footer-row.subtle i{
  color: var(--primary-blue);
}

.bottom-space{ height: 12px; }
</style>

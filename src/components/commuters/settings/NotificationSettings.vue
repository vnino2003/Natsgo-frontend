<template>
  <div class="page active">
    <SettingsHeader
      title="Notifications"
      subtitle="Control what alerts you receive"
      back
    />

    <div class="page-content">
      <!-- Hero card -->
      <div class="notif-hero">
        <div class="notif-hero-icon">
          <i class="fas fa-bell"></i>
        </div>
        <div class="notif-hero-text">
          <p class="notif-hero-title">Stay Updated</p>
          <p class="notif-hero-desc">
            Choose which notifications are important to you
          </p>
        </div>
      </div>

      <!-- Notification toggles -->
      <div class="settings-section">
        <p class="section-label">Notification Preferences</p>

        <div class="settings-item">
          <div class="settings-text">
            <p class="item-title">
              <i class="fas fa-bus item-ico"></i>
              Bus Arrival Alerts
            </p>
            <p class="item-description">
              Get notified when your bus is near
            </p>
          </div>

          <div class="toggle-switch">
            <input type="checkbox" class="toggle-checkbox" id="bus" checked>
            <label for="bus" class="toggle-label"></label>
          </div>
        </div>

        <div class="settings-item">
          <div class="settings-text">
            <p class="item-title">
              <i class="fas fa-route item-ico"></i>
              Route Changes
            </p>
            <p class="item-description">
              Alerts for detours or route updates
            </p>
          </div>

          <div class="toggle-switch">
            <input type="checkbox" class="toggle-checkbox" id="route">
            <label for="route" class="toggle-label"></label>
          </div>
        </div>

        <div class="settings-item">
          <div class="settings-text">
            <p class="item-title">
              <i class="fas fa-triangle-exclamation item-ico"></i>
              Service Alerts
            </p>
            <p class="item-description">
              Important service disruptions
            </p>
          </div>

          <div class="toggle-switch">
            <input type="checkbox" class="toggle-checkbox" id="alert" checked>
            <label for="alert" class="toggle-label"></label>
          </div>
        </div>
      </div>

      <!-- Tip card -->
      <div class="notif-tip">
        <i class="fas fa-circle-info"></i>
        <p>
          Tip: Turning off notifications may cause you to miss important updates.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import SettingsHeader from "./SettingsHeader.vue"
</script>

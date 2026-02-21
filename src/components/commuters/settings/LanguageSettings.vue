<template>
  <div class="page active">
    <!-- ✅ Use existing SettingsHeader -->
    <SettingsHeader
      title="Language"
      subtitle="Pick what you’re comfortable with"
      back
    />

    <div class="page-content">
      <!-- HERO CARD -->
      <div class="lang-hero">
        <div class="lang-hero-icon">
          <i class="fas fa-language"></i>
        </div>

        <div class="lang-hero-text">
          <p class="lang-hero-title">App Language</p>
          <p class="lang-hero-desc">
            Changing this updates labels, buttons, and menu text.
          </p>

          <div class="lang-preview">
            <span class="preview-pill">
              <i class="fas fa-eye"></i>
              Preview: <b>{{ labelPreview }}</b>
            </span>
          </div>
        </div>
      </div>

      <!-- OPTIONS -->
      <div class="settings-section">
        <p class="section-label">Available Languages</p>

        <button
          class="settings-item lang-item"
          :class="{ active: selected === 'en' }"
          type="button"
          @click="select('en')"
        >
          <div class="settings-text">
            <p class="item-title">English</p>
            <p class="item-description">Recommended • Default</p>
          </div>

          <div class="lang-right">
            <span class="lang-chip">EN</span>
            <i v-if="selected === 'en'" class="fas fa-circle-check lang-check"></i>
            <i v-else class="far fa-circle lang-circle"></i>
          </div>
        </button>

        <button
          class="settings-item lang-item"
          :class="{ active: selected === 'fil' }"
          type="button"
          @click="select('fil')"
        >
          <div class="settings-text">
            <p class="item-title">Filipino</p>
            <p class="item-description">Tagalog • Mas comfy</p>
          </div>

          <div class="lang-right">
            <span class="lang-chip">FIL</span>
            <i v-if="selected === 'fil'" class="fas fa-circle-check lang-check"></i>
            <i v-else class="far fa-circle lang-circle"></i>
          </div>
        </button>
      </div>

      <!-- TIP -->
      <div class="lang-tip">
        <i class="fas fa-circle-info"></i>
        <p>Tip: You can change this anytime. No data will be lost.</p>
      </div>

      <div class="bottom-space"></div>
    </div>

    <!-- STICKY SAVE -->
    <div class="lang-savebar">
      <button class="lang-save-btn" type="button" @click="save">
        <i class="fas fa-check"></i>
        Save Language
      </button>
    </div>
  </div>
</template>


<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import SettingsHeader from "./SettingsHeader.vue"

const router = useRouter()
const selected = ref("en")

const labelPreview = computed(() =>
  selected.value === "en" ? "Find Bus Routes" : "Maghanap ng Ruta"
)

function select(v) {
  selected.value = v
}

function save() {
  localStorage.setItem("app_language", selected.value)
  router.back()
}
</script>


  <style scoped>
  /* ====== Mini header (new, not copy ng old) ====== */
  
  /* ====== Hero card ====== */
  .lang-hero{
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 16px;
    color: #fff;
    display:flex;
    gap: 14px;
    align-items:flex-start;
    background:
      radial-gradient(circle at 18% 12%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%),
      linear-gradient(135deg, var(--primary-blue) 0%, #1678D6 35%, var(--accent-teal) 100%);
    box-shadow: 0 14px 30px rgba(0, 188, 212, 0.18);
  }

  .lang-hero-icon{
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.25);
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
  }
  .lang-hero-icon i{ font-size: 22px; }

  .lang-hero-text{ flex: 1; }
  .lang-hero-title{
    margin:0;
    font-size: 16px;
    font-weight: 900;
    letter-spacing: .2px;
  }
  .lang-hero-desc{
    margin: 6px 0 0 0;
    font-size: 12px;
    font-weight: 700;
    opacity: .92;
    line-height: 1.35;
  }

  .lang-preview{ margin-top: 10px; }
  .preview-pill{
    display:inline-flex;
    align-items:center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.16);
    border: 1px solid rgba(255,255,255,0.22);
    font-size: 12px;
    font-weight: 800;
  }

  /* ====== Enhanced settings item ====== */
  .lang-item{
    width: 100%;
    text-align:left;
  }

  .lang-right{
    display:flex;
    align-items:center;
    gap: 10px;
    flex-shrink:0;
  }

  .lang-chip{
    padding: 6px 10px;
    border-radius: 999px;
    border: 2px solid var(--border-light);
    font-weight: 900;
    font-size: 12px;
    color: var(--text-dark);
    background: #fff;
  }

  .lang-circle{
    font-size: 18px;
    color: rgba(209, 213, 219, 1);
  }

  .lang-check{
    font-size: 20px;
    color: var(--accent-teal);
  }

  /* active highlight (keeps your style) */
  .settings-item.active{
    border-color: rgba(0, 188, 212, 0.5);
    background: rgba(0, 188, 212, 0.08);
  }

  /* ====== Tip card ====== */
  .lang-tip{
    margin-top: 10px;
    border-radius: 14px;
    padding: 12px 14px;
    background: #fff;
    border: 2px dashed rgba(0, 188, 212, 0.35);
    color: var(--text-gray);
    display:flex;
    gap: 10px;
    align-items:flex-start;
  }
  .lang-tip i{
    margin-top: 2px;
    color: var(--accent-teal);
  }
  .lang-tip p{
    margin:0;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.35;
  }

  /* ====== Sticky Save ====== */
  .lang-savebar{
    position: fixed;
    left: 0;
    right: 0;
    bottom: var(--nav-height);
    padding: 12px 16px;
    background: rgba(245, 247, 250, 0.92);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(209, 213, 219, 0.7);
    z-index: 90;
  }

  .lang-save-btn{
    width: 100%;
    border: none;
    border-radius: 14px;
    padding: 14px 16px;
    font-weight: 900;
    cursor:pointer;
    color: white;
    display:flex;
    align-items:center;
    justify-content:center;
    gap: 10px;
    background:
      radial-gradient(circle at 18% 12%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%),
      linear-gradient(135deg, var(--primary-blue) 0%, #1678D6 35%, var(--accent-teal) 100%);
    box-shadow: 0 12px 26px rgba(0, 188, 212, 0.20);
    transition: transform .15s ease, filter .2s ease;
  }
  .lang-save-btn:active{ transform: scale(.98); }
  .lang-save-btn:hover{ filter: brightness(1.03); }

  /* extra space so content not hidden by sticky save */
  .bottom-space{ height: 110px; }
  </style>

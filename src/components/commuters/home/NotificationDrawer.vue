<template>
  <div class="nd-overlay" :class="{ active: modelValue }" @click="$emit('update:modelValue', false)"></div>

  <aside class="nd" :class="{ active: modelValue }" @click.stop>
    <header class="nd__head">


      <div class="nd__headR">
        <button class="nd__btn nd__btn--soft" type="button" @click="$emit('mark-all-read')" :disabled="items.length === 0">
          <i class="fas fa-check-double"></i><span>Read</span>
        </button>
        <button class="nd__btn nd__btn--danger" type="button" @click="$emit('clear')" :disabled="items.length === 0">
          <i class="fas fa-trash"></i><span>Clear</span>
        </button>
        <button class="nd__close" type="button" @click="$emit('update:modelValue', false)" aria-label="Close">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
    </header>

    <div class="nd__content">
      <div v-if="items.length === 0" class="nd__state">
        <div class="nd__stateIcon"><i class="fas fa-bell-slash"></i></div>
        <div class="nd__stateTitle">No notifications yet</div>
        <div class="nd__stateSub">We’ll notify you when a bus is nearby.</div>
      </div>

      <div v-else class="nd__list">
        <button
          v-for="n in items"
          :key="n.id"
          class="nd__item"
          :class="{ 'is-unread': !n.read }"
          type="button"
          @click="$emit('open', n)"
        >
          <div class="nd__badge"><i class="fas fa-bus"></i></div>

          <div class="nd__meta">
            <div class="nd__row">
              <div class="nd__t1">{{ n.title }}</div>
              <div class="nd__time">{{ n.time }}</div>
            </div>
            <div class="nd__t2">{{ n.message }}</div>
          </div>

          <span class="nd__dismiss" @click.stop="$emit('dismiss', n.id)" title="Dismiss">
            <i class="fas fa-xmark"></i>
          </span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
});
defineEmits(["update:modelValue", "open", "dismiss", "mark-all-read", "clear"]);
</script>

<style scoped>
.nd-overlay{
  position: fixed;
  inset: 0;
  background: rgba(17,24,39,0.36);
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s ease;
  z-index: 60;
}
.nd-overlay.active{
  opacity: 1;
  pointer-events: auto;
}

.nd{
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(300px, 92vw);
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  border-left: 2px solid var(--border-light);
  transform: translateX(105%);
  transition: transform .22s ease;
  z-index: 61;
  display: flex;
  flex-direction: column;
}
.nd.active{ transform: translateX(0); }

.nd__head{
  padding: 14px;
  border-bottom: 2px solid var(--border-light);
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 10px;
}

.nd__headL{
  display:flex;
  gap: 10px;
  align-items:flex-start;
}
.nd__icon{
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
  box-shadow: 0 12px 24px rgba(0,188,212,0.18);
}
.nd__title{ font-weight: 900; color: var(--text-dark); }
.nd__sub{
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-gray);
  opacity: .9;
}

.nd__headR{ display:flex; align-items:center; gap: 8px; }
.nd__btn{
  border: 2px solid var(--border-light);
  background: rgba(255,255,255,0.75);
  border-radius: 12px;
  padding: 8px 10px;
  font-weight: 900;
  font-size: 12px;
  display:inline-flex;
  align-items:center;
  gap: 8px;
  cursor: pointer;
}
.nd__btn:disabled{ opacity: .55; cursor: not-allowed; }
.nd__btn--danger{ border-color: rgba(239,68,68,0.25); }
.nd__btn--danger:hover{ border-color: rgba(239,68,68,0.45); }
.nd__close{
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  background: rgba(255,255,255,0.75);
  cursor: pointer;
}

.nd__content{
  padding: 14px;
  overflow: auto;
  flex: 1;
}

.nd__state{
  border: 2px dashed rgba(0,188,212,0.22);
  border-radius: 16px;
  padding: 18px;
  text-align: center;
  background: rgba(0,188,212,0.06);
}
.nd__stateIcon{
  width: 54px;
  height: 54px;
  border-radius: 16px;
  margin: 0 auto 10px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(0,188,212,0.12);
  color: var(--accent-teal);
  border: 2px solid rgba(0,188,212,0.18);
}
.nd__stateTitle{ font-weight: 900; }
.nd__stateSub{
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-gray);
}

.nd__list{ display:flex; flex-direction:column; gap: 10px; }

.nd__item{
  width: 100%;
  text-align: left;
  border: 2px solid var(--border-light);
  border-radius: 16px;
  padding: 12px;
  background: rgba(255,255,255,0.75);
  display:flex;
  gap: 12px;
  align-items:flex-start;
  position: relative;
  box-shadow: 0 10px 22px rgba(31,41,55,0.06);
  cursor: pointer;
}
.nd__item.is-unread{
  border-color: rgba(0,188,212,0.28);
  box-shadow: 0 14px 30px rgba(0,188,212,0.12);
}

.nd__badge{
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
}

.nd__meta{ flex: 1; min-width: 0; }
.nd__row{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 10px;
}
.nd__t1{ font-weight: 900; color: var(--text-dark); }
.nd__time{
  font-size: 11px;
  font-weight: 900;
  color: var(--text-gray);
  opacity: .9;
  white-space: nowrap;
}
.nd__t2{
  margin-top: 4px;
  font-size: 12px;
  font-weight: 800;
  color: var(--text-gray);
}

.nd__dismiss{
  position:absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display:flex;
  align-items:center;
  justify-content:center;
  color: var(--text-gray);
  background: rgba(17,24,39,0.06);
}
.nd__dismiss:hover{ background: rgba(239,68,68,0.10); color: #b91c1c; }
</style>
<template>
  <div class="admin-page">
    <!-- HERO -->


    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-top">
          <p class="kpi-label">Active Buses</p>
          <span class="kpi-badge ok"><i class="fas fa-wifi"></i> Live</span>
        </div>
        <p class="kpi-value">{{ kpis.activeBuses }}</p>
        <p class="kpi-sub">
          <i class="fas fa-arrow-trend-up"></i>
          +{{ kpis.busesDelta }} today
        </p>
        <div class="kpi-icon"><i class="fas fa-bus"></i></div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <p class="kpi-label">Active Commuters</p>
          <span class="kpi-badge info"><i class="fas fa-users"></i> Online</span>
        </div>
        <p class="kpi-value">{{ kpis.activeCommuters }}</p>
        <p class="kpi-sub">
          <i class="fas fa-signal"></i>
          Peak today: {{ kpis.peakCommuters }}
        </p>
        <div class="kpi-icon"><i class="fas fa-user-group"></i></div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <p class="kpi-label">Terminals</p>
          <span class="kpi-badge soft"><i class="fas fa-location-dot"></i> Listed</span>
        </div>
        <p class="kpi-value">{{ kpis.terminals }}</p>
        <p class="kpi-sub">
          <i class="fas fa-clock"></i>
          {{ kpis.terminalsUpdated }} updated this week
        </p>
        <div class="kpi-icon"><i class="fas fa-building"></i></div>
      </div>

      <div class="kpi-card warn">
        <div class="kpi-top">
          <p class="kpi-label">Alerts Today</p>
          <span class="kpi-badge warn"><i class="fas fa-triangle-exclamation"></i> Attention</span>
        </div>
        <p class="kpi-value">{{ kpis.alerts }}</p>
        <p class="kpi-sub">
          <i class="fas fa-eye"></i>
          {{ kpis.pendingAlerts }} pending review
        </p>
        <div class="kpi-icon"><i class="fas fa-bell"></i></div>
      </div>
    </div>

    <!-- MAIN DASH LAYOUT -->
    <div class="main-grid">
      <!-- LEFT -->
      <div class="left-col">
        <!-- QUICK ACTIONS (compact) -->
        <div class="panel">
          <div class="panel-head row">
            <div>
              <p class="panel-title">Quick Actions</p>
              <p class="panel-sub">Fast admin controls</p>
            </div>
            <span class="chip"><i class="fas fa-bolt"></i> Admin</span>
          </div>

          <div class="action-row">
            <button class="quick" type="button" @click="go('/admin/buses')">
              <i class="fas fa-bus"></i>
              <span>Buses</span>
            </button>
            <button class="quick" type="button" @click="go('/admin/terminals')">
              <i class="fas fa-building"></i>
              <span>Terminals</span>
            </button>
            <button class="quick" type="button" @click="go('/admin/alerts')">
              <i class="fas fa-bell"></i>
              <span>Alerts</span>
            </button>
            <button class="quick" type="button" @click="go('/admin/settings')">
              <i class="fas fa-gear"></i>
              <span>Settings</span>
            </button>
          </div>
        </div>

        <!-- OCCUPANCY OVER TIME (keep) -->
        <div class="panel chart-panel">
          <div class="panel-head row">
            <div>
              <p class="panel-title">Occupancy Over Time</p>
              <p class="panel-sub">Hourly passenger load trend (demo)</p>
            </div>
            <span class="chip"><i class="fas fa-calendar-day"></i> Today</span>
          </div>

          <div class="chart-wrap">
            <svg class="chart" viewBox="0 0 800 220" preserveAspectRatio="none">
              <g class="grid">
                <line v-for="y in 5" :key="'gy'+y" :x1="40" :x2="780" :y1="y*36" :y2="y*36" />
              </g>

              <line class="axis" x1="40" y1="180" x2="780" y2="180" />
              <line class="axis" x1="40" y1="24" x2="40" y2="180" />

              <path class="line" :d="linePath" />

              <g>
                <circle
                  v-for="(p, idx) in linePoints"
                  :key="'pt'+idx"
                  class="pt"
                  :cx="p.x"
                  :cy="p.y"
                  r="5"
                />
              </g>

              <g class="labels">
                <text v-for="(t, i) in lineLabels" :key="'xl'+i" :x="t.x" y="205">
                  {{ t.label }}
                </text>
              </g>
            </svg>
          </div>
        </div>

        <!-- LIVE FLEET STATUS (replaces removed cards) -->
     
      </div>

      <!-- RIGHT -->
      <div class="right-col">
        <!-- SYSTEM HEALTH (replaces Occupancy Distribution / Recent Activity) -->
 

        <!-- ACTIVE ALERTS (keep) -->
        <div class="panel">
          <div class="panel-head row">
            <div>
              <p class="panel-title">Active Alerts</p>
              <p class="panel-sub">Items needing attention</p>
            </div>
            <button class="link-btn" type="button" @click="go('/admin/alerts')">
              Manage
            </button>
          </div>

          <div class="alerts-mini">
            <div v-for="a in activeAlerts" :key="a.id" class="alert-row">
              <div class="alert-left">
                <span class="alert-dot" :class="a.level"></span>
                <div>
                  <p class="alert-title">{{ a.title }}</p>
                  <p class="alert-desc">{{ a.desc }}</p>
                  <small class="alert-time">{{ a.time }}</small>
                </div>
              </div>

              <span class="badge" :class="a.level">
                {{ a.level === 'warn' ? 'Urgent' : a.level === 'info' ? 'Info' : 'OK' }}
              </span>
            </div>

            <div v-if="activeAlerts.length === 0" class="empty">
              <i class="fas fa-check-circle"></i>
              <p>No active alerts</p>
              <small>All good right now.</small>
            </div>
          </div>
        </div>

        <!-- OPTIONAL: Small Admin Note (nice for “isang tingin”) -->
        <div class="panel note">
          <div class="note-row">
            <div class="note-ico"><i class="fas fa-lightbulb"></i></div>
            <div>
              <p class="note-title">Admin Tip</p>
              <p class="note-sub">
                Prioritize <b>Urgent</b> alerts, then check buses with <b>High load</b> or stale updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-space"></div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
function go(path) { router.push(path) }

const now = ref(new Date())
const lastUpdated = computed(() => now.value.toLocaleString())

const kpis = ref({
  activeBuses: 12,
  busesDelta: 2,
  activeCommuters: 86,
  peakCommuters: 140,
  terminals: 4,
  terminalsUpdated: 2,
  alerts: 3,
  pendingAlerts: 1,
})

const ops = ref({
  onlineNow: 86,
  trackingBuses: 12,
  reports: 5,
})

/* Occupancy Over Time (demo) */
const occupancyHourly = ref([
  { h: "06:00", v: 12 },
  { h: "08:00", v: 40 },
  { h: "10:00", v: 62 },
  { h: "12:00", v: 70 },
  { h: "14:00", v: 74 },
  { h: "16:00", v: 66 },
  { h: "18:00", v: 52 },
  { h: "20:00", v: 22 },
])

/* Fleet list (demo) */
const fleet = ref([
  { id: "01", route: "Main Route", status: "Active", load: 48, lastStop: "Stop 5 - City Hall", updated: "2 mins ago" },
  { id: "03", route: "Main Route", status: "Needs Check", load: 72, lastStop: "Terminal B", updated: "6 mins ago" },
  { id: "06", route: "Main Route", status: "Active", load: 33, lastStop: "Stop 9 - Market", updated: "1 min ago" },
  { id: "08", route: "Main Route", status: "Inactive", load: 0, lastStop: "Depot", updated: "1 hr ago" },
])

/* Alerts (demo) */
const activeAlerts = ref([
  { id: 1, level: "warn", title: "Bus #03", desc: "GPS unstable / low signal", time: "5 mins ago" },
  { id: 2, level: "info", title: "Terminal B", desc: "Crowd higher than usual", time: "25 mins ago" },
  { id: 3, level: "ok", title: "Main Route", desc: "Normal travel time", time: "1 hr ago" },
])

/* Simple SVG Line Chart */
const linePoints = computed(() => {
  const left = 40
  const top = 24
  const bottom = 180
  const right = 780
  const w = right - left
  const h = bottom - top

  const maxV = Math.max(...occupancyHourly.value.map(x => x.v), 1)
  const n = occupancyHourly.value.length

  return occupancyHourly.value.map((d, i) => {
    const x = left + (w * i) / (n - 1)
    const y = bottom - (h * d.v) / maxV
    return { x, y }
  })
})

const linePath = computed(() => {
  const pts = linePoints.value
  if (!pts.length) return ""
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
})

const lineLabels = computed(() => {
  const pts = linePoints.value
  return occupancyHourly.value.map((d, i) => ({ label: d.h, x: pts[i]?.x || 40 }))
})

function refresh() {
  now.value = new Date()
  // later: fetch actual data from API here
}

function pillClass(status) {
  if (status === "Active") return "pill-green"
  if (status === "Inactive") return "pill-red"
  return "pill-yellow"
}
</script>

<style scoped>
.admin-page{ padding: 16px; }

/* ===== HERO ===== */
.dash-hero{
  border-radius: 18px;
  padding: 16px;
  background:
    radial-gradient(circle at 18% 12%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%),
    linear-gradient(135deg, rgba(30,136,229,0.92), rgba(0,188,212,0.72));
  color:#fff;
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap: 12px;
  box-shadow: 0 14px 28px rgba(0,188,212,0.14);
  border: 1px solid rgba(255,255,255,0.18);
  margin-bottom: 16px;
}
.dash-hero-left{ display:flex; gap: 12px; align-items:flex-start; }
.dash-hero-icon{
  width: 48px; height: 48px; border-radius: 14px;
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.22);
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.dash-hero-title{ margin:0; font-weight: 900; font-size: 16px; }
.dash-hero-sub{ margin:6px 0 0; font-weight: 700; font-size: 12px; opacity:.92; line-height: 1.35; }
.dash-hero-meta{
  margin-top: 10px;
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
}
.meta-pill{
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
.meta-pill.soft{ background: rgba(255,255,255,0.12); }
.dot{ width: 10px; height: 10px; border-radius: 999px; background: rgba(209,213,219,1); }
.dot.ok{ background: rgba(16,185,129,1); }

.hero-btn{
  border:none;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 900;
  cursor:pointer;
  color: rgba(38,43,51,0.92);
  background: rgba(255,255,255,0.88);
  display:flex; align-items:center; gap: 8px;
  flex-shrink:0;
}
.hero-btn:active{ transform: scale(.98); }

/* ===== KPI ===== */
.kpi-grid{
  display:grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.kpi-card{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 16px;
  padding: 14px;
  position: relative;
  overflow:hidden;
  box-shadow: 0 10px 22px rgba(0,0,0,0.04);
}
.kpi-card.warn{
  border-color: rgba(255,152,0,0.25);
  background: linear-gradient(0deg, rgba(255,152,0,0.06), rgba(255,152,0,0.02));
}
.kpi-top{ display:flex; justify-content:space-between; align-items:center; gap: 10px; }
.kpi-label{
  margin:0;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .4px;
  text-transform: uppercase;
  color: rgba(38,43,51,0.62);
}
.kpi-badge{
  display:inline-flex;
  align-items:center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid transparent;
  background: rgba(209,213,219,0.22);
  color: rgba(38,43,51,0.8);
}
.kpi-badge.ok{ background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.25); color: var(--success-green); }
.kpi-badge.info{ background: rgba(30,136,229,0.12); border-color: rgba(30,136,229,0.25); color: var(--primary-blue); }
.kpi-badge.warn{ background: rgba(255,152,0,0.12); border-color: rgba(255,152,0,0.25); color: var(--warning-orange); }
.kpi-badge.soft{ background: rgba(0,188,212,0.10); border-color: rgba(0,188,212,0.20); color: var(--accent-teal); }

.kpi-value{ margin: 12px 0 0; font-size: 30px; font-weight: 900; color: var(--text-dark); }
.kpi-sub{
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 800;
  color: rgba(38,43,51,0.72);
  display:flex;
  align-items:center;
  gap: 8px;
}
.kpi-icon{
  position:absolute;
  right: 12px;
  bottom: 10px;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  color: rgba(38,43,51,0.12);
  font-size: 26px;
}

/* ===== Main layout ===== */
.main-grid{
  margin-top: 12px;
  display:grid;
  grid-template-columns: 1.45fr 0.75fr;
  gap: 12px;
}
.left-col, .right-col{
  display:flex;
  flex-direction:column;
  gap: 12px;
}

.panel{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 10px 22px rgba(0,0,0,0.04);
}
.panel.note{
  border-style: dashed;
  border-color: rgba(0,188,212,0.35);
  background: rgba(0,188,212,0.04);
}

.panel-head{ margin-bottom: 12px; }
.panel-head.row{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 10px;
}
.panel-title{ margin:0; font-weight: 900; color: var(--text-dark); font-size: 14px; }
.panel-sub{ margin:6px 0 0; font-weight: 700; color: rgba(38,43,51,0.68); font-size: 12px; }

.link-btn{
  border: 2px solid var(--border-light);
  background: #fff;
  border-radius: 12px;
  padding: 8px 10px;
  font-weight: 900;
  cursor:pointer;
  color: rgba(38,43,51,0.82);
}
.link-btn:hover{ border-color: rgba(0,188,212,0.35); background: rgba(0,188,212,0.06); }
.link-btn:active{ transform: scale(.98); }

.chip{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid rgba(0,188,212,0.25);
  background: rgba(0,188,212,0.08);
  color: var(--accent-teal);
}

/* Quick actions (compact row) */
.action-row{
  display:grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 10px;
}
.quick{
  border: 2px solid var(--border-light);
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 900;
  color: rgba(38,43,51,0.85);
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
  cursor:pointer;
}
.quick i{ color: var(--accent-teal); }
.quick:hover{ border-color: rgba(0,188,212,0.35); background: rgba(0,188,212,0.05); }
.quick:active{ transform: scale(.99); }

/* Chart */
.chart-panel .panel-head{ margin-bottom: 8px; }
.chart-wrap{
  border: 2px solid var(--border-light);
  border-radius: 16px;
  background: rgba(245,247,250,0.55);
  padding: 10px;
  overflow:hidden;
}
.chart{ width: 100%; height: 220px; }
.grid line{ stroke: rgba(209,213,219,0.55); stroke-width: 1; }
.axis{ stroke: rgba(209,213,219,0.85); stroke-width: 2; }
.line{
  fill: none;
  stroke: rgba(0,188,212,0.95);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 6px 10px rgba(0,188,212,0.18));
}
.pt{ fill: #fff; stroke: rgba(30,136,229,0.95); stroke-width: 3; }
.labels text{
  font-size: 12px;
  font-weight: 800;
  fill: rgba(38,43,51,0.70);
  text-anchor: middle;
}

/* Fleet list */
.fleet{ display:flex; flex-direction:column; gap: 10px; }
.fleet-row{
  border: 2px solid var(--border-light);
  background:#fff;
  border-radius: 16px;
  padding: 12px;
  display:flex;
  justify-content:space-between;
  gap: 12px;
}
.fleet-left{ display:flex; gap: 12px; align-items:flex-start; }
.fleet-badge{
  width: 44px; height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}
.fleet-title{ margin:0; font-weight: 900; font-size: 13px; color: var(--text-dark); }
.tiny{ font-weight: 800; color: rgba(38,43,51,0.62); }
.fleet-sub{
  margin: 6px 0 0;
  font-weight: 700;
  font-size: 12px;
  color: rgba(38,43,51,0.72);
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items:center;
}
.sep{ color: rgba(38,43,51,0.35); }

.fleet-right{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap: 6px;
  min-width: 120px;
}
.cap{
  font-weight: 800;
  color: rgba(38,43,51,0.62);
}

/* Pill reuse from your system */
.pill{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:6px 10px;
  border-radius:999px;
  font-size:12px;
  font-weight:800;
  letter-spacing:0.4px;
  border: 1px solid transparent;
}
.pill-green{ background: rgba(16, 185, 129, 0.12); color: var(--success-green); border-color: rgba(16, 185, 129, 0.25); }
.pill-yellow{ background: rgba(255, 152, 0, 0.12); color: var(--warning-orange); border-color: rgba(255, 152, 0, 0.25); }
.pill-red{ background: rgba(239, 68, 68, 0.12); color: var(--error-red); border-color: rgba(239, 68, 68, 0.25); }

/* Health */
.health{ display:flex; flex-direction:column; gap: 10px; }
.health-row{
  border: 2px solid var(--border-light);
  border-radius: 16px;
  padding: 12px;
  background:#fff;
  display:flex;
  justify-content:space-between;
  gap: 10px;
}
.health-left{ display:flex; gap: 10px; align-items:flex-start; }
.health-dot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-top: 6px;
  background: rgba(209,213,219,1);
}
.health-dot.ok{ background: rgba(16,185,129,1); }
.health-dot.info{ background: rgba(30,136,229,1); }
.health-dot.warn{ background: rgba(239,68,68,1); }
.health-title{ margin:0; font-weight: 900; font-size: 13px; color: var(--text-dark); }
.health-sub{ margin:4px 0 0; font-weight: 700; font-size: 12px; color: rgba(38,43,51,0.72); }

.health-mini{
  display:grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 10px;
}
.mini-box{
  border: 2px solid var(--border-light);
  border-radius: 14px;
  padding: 10px;
  background: rgba(245,247,250,0.6);
}
.mini-label{
  margin:0;
  font-weight: 900;
  font-size: 11px;
  letter-spacing: .4px;
  text-transform: uppercase;
  color: rgba(38,43,51,0.62);
}
.mini-value{
  margin: 8px 0 0;
  font-weight: 900;
  font-size: 18px;
  color: var(--text-dark);
}

/* Alerts list */
.alerts-mini{ display:flex; flex-direction:column; gap: 10px; }
.alert-row{
  border: 2px solid var(--border-light);
  border-radius: 16px;
  padding: 12px;
  background:#fff;
  display:flex;
  justify-content:space-between;
  gap: 10px;
}
.alert-left{ display:flex; gap: 10px; align-items:flex-start; }
.alert-dot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-top: 6px;
  background: rgba(209,213,219,1);
}
.alert-dot.ok{ background: rgba(16,185,129,1); }
.alert-dot.warn{ background: rgba(239,68,68,1); }
.alert-dot.info{ background: rgba(30,136,229,1); }
.alert-title{ margin:0; font-weight: 900; font-size: 13px; color: var(--text-dark); }
.alert-desc{ margin:4px 0 0; font-weight: 700; font-size: 12px; color: rgba(38,43,51,0.72); }
.alert-time{ display:block; margin-top: 6px; font-weight: 800; color: rgba(38,43,51,0.55); }

.badge{
  align-self:flex-start;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 11px;
  border: 1px solid transparent;
}
.badge.ok{ background: rgba(16,185,129,0.12); color: var(--success-green); border-color: rgba(16,185,129,0.25); }
.badge.info{ background: rgba(30,136,229,0.12); color: var(--primary-blue); border-color: rgba(30,136,229,0.25); }
.badge.warn{ background: rgba(239,68,68,0.12); color: var(--error-red); border-color: rgba(239,68,68,0.25); }

/* Note */
.note-row{ display:flex; gap: 12px; align-items:flex-start; }
.note-ico{
  width: 44px; height: 44px;
  border-radius: 14px;
  background: rgba(0,188,212,0.12);
  border: 1px solid rgba(0,188,212,0.25);
  color: var(--accent-teal);
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}
.note-title{ margin:0; font-weight: 900; color: var(--text-dark); font-size: 13px; }
.note-sub{ margin:6px 0 0; font-weight: 800; color: rgba(38,43,51,0.72); font-size: 12px; line-height: 1.4; }

/* Empty */
.empty{ text-align:center; padding: 18px 10px; color: rgba(38,43,51,0.68); }
.empty i{ font-size: 34px; color: var(--border-medium); display:block; margin-bottom: 8px; }
.empty p{ margin:0; font-weight: 900; }
.empty small{ font-weight: 700; }

/* Responsive */
@media (max-width: 1100px){
  .kpi-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
  .main-grid{ grid-template-columns: 1fr; }
  .action-row{ grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media (max-width: 520px){
  .action-row{ grid-template-columns: 1fr; }
}

.bottom-space{ height: 14px; }
</style>

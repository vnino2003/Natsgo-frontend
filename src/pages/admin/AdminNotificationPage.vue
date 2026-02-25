<template>
  <div class="al-page">
    <!-- Top -->
    <div class="al-top">
      <div>
        <h1 class="al-title">Alerts & Notifications</h1>
        <p class="al-sub">System events, IoT health, authentication logs, and bus updates.</p>
      </div>

      <div class="al-actions">
        <div class="al-search">
          <i class="fas fa-search"></i>
          <input
            v-model="q"
            placeholder="Search title, message, type, dedupe..."
            @keyup.enter="refresh"
          />
        </div>

        <!-- ✅ Clear controls -->
        <button class="btn ghost" type="button" @click="onClearResolved" :disabled="loading">
          <i class="fas fa-broom"></i>
          <span>Clear Resolved</span>
        </button>

        <button class="btn danger" type="button" @click="onClearAll" :disabled="loading">
          <i class="fas fa-trash"></i>
          <span>Clear All</span>
        </button>

        <button class="btn primary" type="button" @click="refresh" :disabled="loading">
          <i class="fas fa-rotate"></i>
          <span>{{ loading ? "Refreshing..." : "Refresh" }}</span>
        </button>
      </div>
    </div>

    <!-- Filters + Pager -->
    <div class="al-filters">
      <button
        v-for="f in filters"
        :key="f.key"
        class="chip"
        :class="{ on: activeFilter === f.key }"
        @click="activeFilter = f.key"
      >
        <span>{{ f.label }}</span>
        <span class="chip-count">{{ filterCount(f.key) }}</span>
      </button>

      <div class="spacer"></div>

      <div class="pager">
        <button class="btn ghost" :disabled="offset === 0 || loading" @click="prevPage">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="page-info">
          {{ offset + 1 }}–{{ Math.min(offset + limit, total) }} of {{ total }}
        </div>
        <button class="btn ghost" :disabled="offset + limit >= total || loading" @click="nextPage">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="hasError" class="al-error">
      <i class="fas fa-triangle-exclamation"></i>
      <span>{{ error }}</span>
    </div>

    <!-- List -->
    <div class="al-list">
      <div v-if="!loading && filtered.length === 0" class="empty">
        No notifications found.
      </div>

      <div
        v-for="n in filtered"
        :key="n.id"
        class="card"
        :class="[
          severityClass(n.severity),
          {
            unread: n.unread,
            resolved: !n.active,
            attention: n.unread || n.active,
            'ring-unread': n.unread,
            'ring-active': !n.unread && n.active
          }
        ]"
      >
        <div class="icon">
          <i :class="iconFor(n)"></i>
        </div>

        <div class="content">
          <div class="row1">
            <div class="title">
              {{ n.title }}
              <span v-if="n.unread" class="dot" title="Unread"></span>
            </div>

            <div class="badges">
              <span class="badge">{{ categoryLabel(n.category) }}</span>
              <span class="badge sev">{{ severityLabel(n.severity) }}</span>
              <span v-if="n.active" class="badge status active">Active</span>
              <span v-else class="badge status resolved">Resolved</span>
            </div>
          </div>

          <div class="msg">
            {{ n.message }}
          </div>

          <div class="row3">
            <div class="time">
              <i class="fas fa-clock"></i>
              {{ prettyTime(n.updated_at || n.created_at) }}
              <span v-if="n.type" class="muted">• {{ n.type }}</span>
              <span v-if="n.dedupe_key" class="muted">• {{ n.dedupe_key }}</span>
            </div>

            <div class="actions">
              <button
                v-if="n.unread"
                class="btn small"
                @click="markRead(n.id)"
                title="Mark as read"
              >
                <i class="fas fa-envelope-open"></i>
              </button>

              <button
                v-else
                class="btn small ghost"
                @click="markUnread(n.id)"
                title="Mark as unread"
              >
                <i class="fas fa-envelope"></i>
              </button>

              <button
                v-if="n.active"
                class="btn small danger"
                @click="resolve(n.id)"
                title="Resolve"
              >
                <i class="fas fa-check"></i>
              </button>

              <!-- ✅ Delete single -->
              <button
                class="btn small danger"
                @click="onDeleteOne(n)"
                title="Delete"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useNotifications } from "@/composables/useNotifications";

const q = ref("");
const activeFilter = ref("all");

const filters = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "unread", label: "Unread" },
  { key: "critical", label: "Critical" },
  { key: "warning", label: "Warnings" },
  { key: "info", label: "Info" },
  { key: "resolved", label: "Resolved" },
];

const {
  rows,
  total,
  limit,
  offset,
  loading,
  error,
  hasError,
  refreshAll,
  setPage,
  markRead,
  markUnread,
  resolve,
  remove, // ✅ new (delete single)
  clear,  // ✅ new (bulk clear)
  severityLabel,
  severityClass,
  categoryLabel,
} = useNotifications();

onMounted(() => refresh());

function refresh() {
  setPage(0);
  refreshAll({ q: q.value });
}

function nextPage() {
  setPage(offset.value + limit.value);
  refreshAll({ q: q.value });
}

function prevPage() {
  setPage(Math.max(offset.value - limit.value, 0));
  refreshAll({ q: q.value });
}

function prettyTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

function iconFor(n) {
  if (n.severity === 3) return "fas fa-circle-exclamation";
  if (n.severity === 2) return "fas fa-triangle-exclamation";
  return "fas fa-circle-info";
}

function sortTs(n) {
  const t = new Date(n?.updated_at || n?.created_at || 0).getTime();
  return Number.isFinite(t) ? t : 0;
}

const sorted = computed(() => {
  const list = Array.isArray(rows.value) ? [...rows.value] : [];
  list.sort((a, b) => sortTs(b) - sortTs(a));
  return list;
});

const filtered = computed(() => {
  const list = [...sorted.value];
  const f = activeFilter.value;

  if (f === "all") return list;
  if (f === "active") return list.filter((x) => x.active);
  if (f === "resolved") return list.filter((x) => !x.active);
  if (f === "unread") return list.filter((x) => x.unread);
  if (f === "critical") return list.filter((x) => x.severity === 3);
  if (f === "warning") return list.filter((x) => x.severity === 2);
  if (f === "info") return list.filter((x) => x.severity === 1);

  return list;
});

/* ✅ counts for each filter (based on current rows, not paginated view) */
function filterCount(key) {
  const list = sorted.value;
  if (key === "all") return list.length;
  if (key === "active") return list.filter((x) => x.active).length;
  if (key === "resolved") return list.filter((x) => !x.active).length;
  if (key === "unread") return list.filter((x) => x.unread).length;
  if (key === "critical") return list.filter((x) => x.severity === 3).length;
  if (key === "warning") return list.filter((x) => x.severity === 2).length;
  if (key === "info") return list.filter((x) => x.severity === 1).length;
  return 0;
}

/* ===========================
   ✅ Delete / Clear actions
=========================== */

async function onDeleteOne(n) {
  const ok = confirm(`Delete this notification?\n\n${n.title}`);
  if (!ok) return;

  await remove(n.id);
}

async function onClearResolved() {
  const ok = confirm("Clear all RESOLVED notifications? (safe)");
  if (!ok) return;

  // default safe
  await clear({ mode: "resolved" });
}

async function onClearAll() {
  const ok = confirm("⚠️ Clear ALL notifications? This cannot be undone.");
  if (!ok) return;

  await clear({ mode: "all" });
}
</script>

<style scoped>
.al-page { padding: 24px; background: #f8fafc; min-height: 100vh; }

/* Top */
.al-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 14px;
}
.al-title { margin: 0; font-size: 22px; font-weight: 900; }
.al-sub { margin: 6px 0 0; font-size: 13px; color: #64748b; }

.al-actions { display: flex; align-items: center; gap: 10px; }
.al-search {
  display: flex; align-items: center; gap: 10px;
  background: white; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 10px 12px; min-width: 320px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
}
.al-search i { color: #94a3b8; }
.al-search input { border: none; outline: none; width: 100%; font-size: 13px; }

/* Buttons */
.btn {
  border: 1px solid transparent; background: white; color: #0f172a;
  padding: 10px 14px; border-radius: 14px; font-weight: 800;
  cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn.primary { background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; }
.btn.ghost { background: transparent; border-color: #e2e8f0; box-shadow: none; }
.btn.small { padding: 8px 10px; border-radius: 12px; box-shadow: none; border-color: #e2e8f0; }
.btn.small.ghost { background: transparent; }

/* ✅ danger styles (for big + small) */
.btn.danger {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}
.btn.danger:hover { filter: brightness(0.98); }

/* Filters + Pager */
.al-filters {
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  margin-bottom: 14px;
}
.chip {
  border: 1px solid #e2e8f0;
  background: white;
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.chip.on { background: #0ea5e9; color: white; border-color: #0ea5e9; }

/* small count bubble */
.chip-count {
  font-size: 11px;
  font-weight: 950;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #0f172a;
}
.chip.on .chip-count {
  background: rgba(255, 255, 255, 0.22);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.spacer { flex: 1; }
.pager { display: flex; align-items: center; gap: 10px; }
.page-info { font-size: 12px; color: #64748b; font-weight: 700; }

/* Error */
.al-error {
  background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412;
  padding: 12px 14px; border-radius: 14px;
  display: flex; align-items: center; gap: 10px;
  font-weight: 800; margin-bottom: 14px;
}

/* List */
.al-list { display: flex; flex-direction: column; gap: 12px; }
.empty {
  background: white; border: 1px dashed #e2e8f0; border-radius: 16px;
  padding: 18px; color: #64748b; font-weight: 800;
}

/* Card */
.card {
  background: white;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  gap: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.04);
  border-left: 4px solid #e2e8f0;
  position: relative;
}

/* Dim only secondary text when Resolved + Read */
.card.resolved:not(.unread) .msg,
.card.resolved:not(.unread) .time,
.card.resolved:not(.unread) .muted { opacity: 0.65; }

/* severity left border */
.card.critical { border-left-color: #ef4444; }
.card.warning  { border-left-color: #f59e0b; }
.card.info     { border-left-color: #3b82f6; }

/* attention shadow only */
.card.attention { box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08); }

/* one clean ring only */
.card.ring-unread {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.22), 0 14px 34px rgba(15, 23, 42, 0.08);
}
.card.ring-active {
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.22), 0 14px 34px rgba(15, 23, 42, 0.08);
}

.icon {
  width: 44px; height: 44px; border-radius: 14px;
  display: grid; place-items: center;
  background: #f1f5f9; color: #0f172a;
}
.content { flex: 1; min-width: 0; }

.row1 { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.title { font-weight: 950; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 999px; background: #3b82f6; display: inline-block; }

.badges { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.badge {
  font-size: 10px; padding: 4px 8px; border-radius: 999px;
  font-weight: 900; border: 1px solid transparent;
  transition: all 0.25s ease;
}

/* ACTIVE -> bright pills */
.card:not(.resolved) .badge {
  background: #e0f2fe; color: #0369a1; border-color: #bae6fd;
}
.card:not(.resolved) .badge.sev {
  background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe;
}
.card:not(.resolved) .badge.status.active {
  background: #fef3c7; color: #92400e; border-color: #fde68a;
}

/* RESOLVED + READ -> muted pills */
.card.resolved:not(.unread) .badge {
  background: #f1f5f9; color: #94a3b8; border-color: #e2e8f0;
}
.card.resolved:not(.unread) .badge.status.resolved {
  background: #f1f5f9; color: #94a3b8; border-color: #e2e8f0;
}

/* resolved but UNREAD -> keep visible */
.card.resolved.unread .badge {
  background: #e0f2fe; color: #0369a1; border-color: #bae6fd;
}

.msg {
  margin: 6px 0 10px;
  font-size: 13px;
  color: #475569;
  line-height: 1.35;
  word-break: break-word;
}

.row3 { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.time { font-size: 12px; color: #64748b; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.muted { color: #94a3b8; font-weight: 700; }
.actions { display: flex; gap: 8px; }
</style>
<template>
  <!-- overlay -->
  <div
    class="modal-overlay"
    :class="{ active: modelValue }"
    @click="close"
  ></div>

  <!-- bottom sheet -->
  <div class="auth-modal" :class="{ active: modelValue }" @click.stop>
    <!-- back (only for login/signup) -->
    <button v-if="view !== 'chooser'" class="modal-back" @click="view = 'chooser'">
      <i class="fas fa-arrow-left"></i>
    </button>

    <!-- close -->
    <button class="modal-close" @click="close">
      <i class="fas fa-times"></i>
    </button>

    <div class="modal-content">
      <!-- ======= HEADER TITLE ======= -->
      <div v-if="view === 'chooser'">
<div class="modal-logo logo-natsgo" aria-label="NATSGO">
  <span class="logo-text">NATSG</span>
  <span class="logo-wheel" aria-hidden="true"></span>
</div>
        <p class="modal-subtitle">Become a member to backup your data for Free!</p>

        <!-- chooser buttons (your existing design) -->
        <div class="auth-buttons">
          <button class="btn-auth btn-facebook" type="button" @click="$emit('facebook')">
            <i class="fab fa-facebook-f"></i>
            <span>Log In with Facebook</span>
          </button>

          <button class="btn-auth btn-google" type="button" @click="$emit('google')">
            <i class="fab fa-google"></i>
            <span>Continue with Google</span>
          </button>

          <button class="btn-auth btn-apple" type="button" @click="$emit('apple')">
            <i class="fab fa-apple"></i>
            <span>Continue with Apple</span>
          </button>

          <button class="btn-auth btn-email" type="button" @click="view = 'signup'">
            <i class="fas fa-envelope"></i>
            <span>Sign Up with Email</span>
          </button>
        </div>

        <p class="modal-terms">
          By signing up, you agree to our
          <a href="#" class="link-terms">Terms of Service</a>
          and
          <a href="#" class="link-terms">Privacy Policy</a>
        </p>

        <button class="btn-login-existing" type="button" @click="view = 'login'">
          Have an Account? Log In Now
        </button>
      </div>

      <!-- ======= LOGIN VIEW ======= -->
      <form v-else-if="view === 'login'" class="auth-form" @submit.prevent="submitLogin">
        <h2 class="auth-title">Log In</h2>

        <div class="auth-field">
          <label>Email</label>
          <input v-model.trim="login.email" type="email" autocomplete="email" required />
          <div class="auth-line"></div>
        </div>

        <div class="auth-field">
          <label>Password</label>
          <input v-model="login.password" type="password" autocomplete="current-password" required />
          <div class="auth-line"></div>
        </div>

        <div class="auth-row">
          <button class="auth-link" type="button" @click="$emit('forgot-password', login.email)">
            Forgot Password?
          </button>
        </div>

        <button class="auth-primary" type="submit">Continue</button>

        <div class="auth-divider">
          <span>or</span>
        </div>

        <button class="btn-auth btn-google" type="button" @click="$emit('google')">
          <i class="fab fa-google"></i>
          <span>Continue with Google</span>
        </button>

        <button class="auth-switch" type="button" @click="view = 'signup'">
          Don’t have an account? <b>Sign up</b>
        </button>
      </form>

      <!-- ======= SIGNUP VIEW ======= -->
      <form v-else class="auth-form" @submit.prevent="submitSignup">
        <h2 class="auth-title">Sign Up with Email</h2>

        <div class="auth-field">
          <label>Email</label>
          <input v-model.trim="signup.email" type="email" autocomplete="email" required />
          <div class="auth-line"></div>
        </div>

        <div class="auth-field">
          <label>Password <small>(6–50 characters)</small></label>
          <input
            v-model="signup.password"
            type="password"
            minlength="6"
            maxlength="50"
            autocomplete="new-password"
            required
          />
          <div class="auth-line"></div>
        </div>

        <div class="auth-field">
          <label>Confirm password <small>(6–50 characters)</small></label>
          <input
            v-model="signup.confirm"
            type="password"
            minlength="6"
            maxlength="50"
            autocomplete="new-password"
            required
          />
          <div class="auth-line"></div>
        </div>

        <p class="auth-error" v-if="signupError">{{ signupError }}</p>

        <button class="auth-primary" type="submit">Sign up</button>

        <div class="auth-divider">
          <span>or</span>
        </div>

        <button class="btn-auth btn-google" type="button" @click="$emit('google')">
          <i class="fab fa-google"></i>
          <span>Continue with Google</span>
        </button>

        <button class="auth-switch" type="button" @click="view = 'login'">
          Already have an account? <b>Log in</b>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  startView: { type: String, default: "chooser" }, // chooser | login | signup
})

const emit = defineEmits([
  "update:modelValue",
  "login",
  "signup",
  "google",
  "facebook",
  "apple",
  "forgot-password",
])

const view = ref(props.startView)

watch(
  () => props.modelValue,
  (open) => {
    if (open) view.value = props.startView || "chooser"
  }
)

const login = ref({ email: "", password: "" })
const signup = ref({ email: "", password: "", confirm: "" })
const signupError = ref("")

function close() {
  emit("update:modelValue", false)
  signupError.value = ""
}

function submitLogin() {
  emit("login", { ...login.value })
}

function submitSignup() {
  signupError.value = ""
  if (signup.value.password !== signup.value.confirm) {
    signupError.value = "Passwords do not match."
    return
  }
  emit("signup", { email: signup.value.email, password: signup.value.password })
}
</script>

<style scoped>
/* small add-ons only (your big CSS stays the same) */

.modal-back{
  position: absolute;
  top: 20px;
  right: 68px;
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  width: 40px;
  height: 40px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
}

.auth-form{
  text-align: left;
  margin-top: 10px;
  padding-top: 8px;
}

.auth-title{
  color: #fff;
  font-size: 44px;
  font-weight: 500;
  margin: 4px 0 18px;
  letter-spacing: .2px;
}

.auth-field{
  margin: 16px 0 22px;
}

.auth-field label{
  display:block;
  color: rgba(255,255,255,.78);
  font-size: 18px;
  margin-bottom: 10px;
}

.auth-field small{
  opacity: .9;
  font-size: 14px;
  font-weight: 500;
}

.auth-field input{
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #fff;
  font-size: 18px;
  padding: 8px 0;
}

.auth-line{
  height: 2px;
  background: rgba(255,255,255,.35);
  margin-top: 8px;
}

.auth-row{
  display:flex;
  justify-content:flex-end;
  margin-top: -10px;
  margin-bottom: 14px;
}

.auth-link{
  border:none;
  background: transparent;
  color: rgba(255,255,255,.9);
  text-decoration: underline;
  font-weight: 600;
  cursor:pointer;
}

.auth-primary{
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 999px;
  background: rgba(255,255,255,.8);
  color: #0b6f7a;
  font-size: 18px;
  font-weight: 700;
  cursor:pointer;
  margin-top: 4px;
}

.auth-primary:active{ transform: scale(.98); }

.auth-divider{
  display:flex;
  align-items:center;
  gap: 12px;
  margin: 18px 0 14px;
  color: rgba(255,255,255,.85);
}

.auth-divider::before,
.auth-divider::after{
  content:"";
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,.28);
}

.auth-switch{
  width: 100%;
  margin-top: 12px;
  border:none;
  background: transparent;
  color: rgba(255,255,255,.95);
  font-size: 15px;
  cursor:pointer;
  text-align:center;
}

.auth-error{
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(239,68,68,.18);
  border: 1px solid rgba(239,68,68,.35);
  color: #ffecec;
  font-weight: 700;
}

/* NATSGO wordmark (text + wheel O) */
.logo-natsgo{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: 6px; /* same feel as your old logo */
  text-shadow: 0 2px 8px rgba(0,0,0,0.10);
}

/* keep your font sizing responsive */
.logo-natsgo .logo-text{
  font-size: 64px;
  font-weight: 300;
  color: #fff;
  line-height: 1;
}

/* the “O” wheel */
.logo-natsgo .logo-wheel{
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transform: translateY(2px);

  /* outer tire + inner rim */
  background:
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0 9px, rgba(255,255,255,0) 10px),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22) 0 19px, rgba(255,255,255,0) 20px),
    radial-gradient(circle at 50% 50%, rgba(0,0,0,0.28) 0 100%);

  /* rim ring */
  box-shadow:
    inset 0 0 0 6px rgba(255,255,255,0.92),
    inset 0 0 0 12px rgba(0, 188, 212, 0.35),  /* teal ring */
    0 6px 14px rgba(0,0,0,0.18);
}

/* spokes using pseudo elements */
.logo-natsgo .logo-wheel::before,
.logo-natsgo .logo-wheel::after{
  content:"";
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background:
    linear-gradient(transparent 46%, rgba(255,255,255,0.92) 46% 54%, transparent 54%),
    linear-gradient(90deg, transparent 46%, rgba(255,255,255,0.92) 46% 54%, transparent 54%),
    linear-gradient(45deg, transparent 47%, rgba(255,255,255,0.75) 47% 53%, transparent 53%),
    linear-gradient(-45deg, transparent 47%, rgba(255,255,255,0.75) 47% 53%, transparent 53%);
  opacity: 0.95;
}

/* center hub highlight */
.logo-natsgo .logo-wheel::after{
  inset: 22px;
  background: radial-gradient(circle, rgba(0,188,212,0.9) 0%, rgba(30,136,229,0.7) 55%, rgba(255,255,255,0.0) 70%);
  opacity: 0.9;
}

/* slight motion on open (optional) */
.auth-modal.active .logo-natsgo .logo-wheel{
  animation: wheelPop 520ms cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes wheelPop{
  0% { transform: translateY(2px) scale(0.92) rotate(-18deg); opacity: 0.9; }
  100% { transform: translateY(2px) scale(1) rotate(0deg); opacity: 1; }
}

/* Responsive sizing (match your existing breakpoints) */
@media (max-width: 480px){
  .logo-natsgo { letter-spacing: 5px; }
  .logo-natsgo .logo-text{ font-size: 54px; }
  .logo-natsgo .logo-wheel{ width: 46px; height: 46px; }
}
@media (min-width: 768px){
  .logo-natsgo .logo-text{ font-size: 74px; }
  .logo-natsgo .logo-wheel{ width: 60px; height: 60px; }
}

</style>

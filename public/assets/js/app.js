/**
 * Bus+ App - Main JavaScript File
 * Handles navigation, UI interactions, and state management
 */

// State Management
const appState = {
    currentPage: 'home',
    drawerOpen: false,
    backgroundShift: true,
};

// DOM Elements
const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('.nav-item');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const openDrawerBtn = document.getElementById('openDrawer');
const closeDrawerBtn = document.getElementById('closeDrawer');
const bgToggle = document.getElementById('bgToggle');
const surveyBtns = document.querySelectorAll('.survey-btn');
const routeItems = document.querySelectorAll('.route-item');
const terminalItems = document.querySelectorAll('.terminal-item');
const settingsItems = document.querySelectorAll('.settings-item');
const serviceCards = document.querySelectorAll('.service-card');
const closeCloseSurveyBtn = document.querySelector('.btn-close-survey');
const authModal = document.getElementById('authModal');
const authModalOverlay = document.getElementById('authModalOverlay');
const closeAuthModalBtn = document.getElementById('closeAuthModal');
const authButtons = document.querySelectorAll('.btn-auth');
const btnLoginExisting = document.querySelector('.btn-login-existing');
const drawerProfileBtn = document.getElementById('drawerProfileBtn');

/**
 * Navigate to a specific page
 */
function navigateTo(pageName) {
    // Hide all pages
    pages.forEach((page) => {
        page.classList.remove('active');
    });

    // Show selected page
    const selectedPage = document.getElementById(pageName);
    if (selectedPage) {
        selectedPage.classList.add('active');
        appState.currentPage = pageName;

        // Scroll to top
        selectedPage.scrollTop = 0;
    }

    // Update navigation items
    navItems.forEach((item) => {
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Close drawer
    closeDrawer();

    // Log navigation
    console.log('[v0] Navigated to page:', pageName);
}

/**
 * Open Drawer Menu
 */
function openDrawerMenu() {
    drawer.classList.add('active');
    drawerOverlay.classList.add('active');
    appState.drawerOpen = true;
    document.body.style.overflow = 'hidden';
    console.log('[v0] Drawer opened');
}

/**
 * Close Drawer Menu
 */
function closeDrawer() {
    drawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    appState.drawerOpen = false;
    document.body.style.overflow = 'auto';
    console.log('[v0] Drawer closed');
}

/**
 * Toggle Background Shift
 */
function toggleBackgroundShift() {
    appState.backgroundShift = bgToggle.checked;
    console.log('[v0] Background shift toggled:', appState.backgroundShift);

    // Visual feedback
    if (appState.backgroundShift) {
        document.body.style.background = 'linear-gradient(135deg, #E8F4F8 0%, #F5F7FA 100%)';
    } else {
        document.body.style.background = 'var(--light-bg)';
    }
}

/**
 * Handle Route Item Click
 */
function handleRouteClick(event) {
    const item = event.currentTarget;

    // Remove previous active state if any
    routeItems.forEach((route) => route.style.backgroundColor = '');

    // Add visual feedback
    item.style.backgroundColor = 'rgba(30, 136, 229, 0.05)';
    item.style.transition = 'all 0.2s ease-in-out';

    const routeName = item.querySelector('.route-name').textContent;
    console.log('[v0] Route selected:', routeName);

    // Reset after animation
    setTimeout(() => {
        item.style.backgroundColor = '';
    }, 200);
}

/**
 * Handle Terminal Item Click
 */
function handleTerminalClick(event) {
    const item = event.currentTarget;

    // Remove previous active state if any
    terminalItems.forEach((terminal) => terminal.style.backgroundColor = '');

    // Add visual feedback
    item.style.backgroundColor = 'rgba(0, 188, 212, 0.05)';
    item.style.transition = 'all 0.2s ease-in-out';

    const terminalName = item.querySelector('.terminal-name').textContent;
    console.log('[v0] Terminal selected:', terminalName);

    // Reset after animation
    setTimeout(() => {
        item.style.backgroundColor = '';
    }, 200);
}

/**
 * Handle Settings Item Click
 */
function handleSettingsClick(event) {
    const item = event.currentTarget;

    // Skip if it's the toggle switch
    if (event.target.closest('.toggle-switch')) {
        return;
    }

    // Add visual feedback
    item.style.backgroundColor = 'rgba(0, 188, 212, 0.05)';
    item.style.transition = 'all 0.2s ease-in-out';

    const settingName = item.querySelector('.item-title')?.textContent || 'Unknown';
    console.log('[v0] Settings item clicked:', settingName);

    // Reset after animation
    setTimeout(() => {
        item.style.backgroundColor = '';
    }, 200);
}

/**
 * Handle Service Card Click
 */
function handleServiceCardClick(event) {
    const card = event.currentTarget;
    const serviceName = card.querySelector('p').textContent;

    // Add ripple effect
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
        card.style.transform = 'scale(1)';
    }, 100);

    console.log('[v0] Service selected:', serviceName);
}

/**
 * Handle Survey Button Click
 */
function handleSurveyBtnClick(event) {
    const btn = event.currentTarget;
    const isYes = btn.textContent === 'YAS';

    // Update button states
    surveyBtns.forEach((b) => {
        if (b === btn) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    console.log('[v0] Survey response:', isYes ? 'Yes' : 'Maybe');
}

/**
 * Close Survey
 */
function closeSurvey() {
    const survey = document.querySelector('.settings-survey');
    if (survey) {
        survey.style.opacity = '0';
        survey.style.transform = 'translateY(-10px)';
        survey.style.transition = 'all 0.3s ease-in-out';

        setTimeout(() => {
            survey.style.display = 'none';
        }, 300);

        console.log('[v0] Survey closed');
    }
}

/**
 * Open Auth Modal
 */
function openAuthModal() {
    authModal.classList.add('active');
    authModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('[v0] Auth modal opened');
}

/**
 * Close Auth Modal
 */
function closeAuthModal() {
    authModal.classList.remove('active');
    authModalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    console.log('[v0] Auth modal closed');
}

/**
 * Handle Auth Button Click
 */
function handleAuthButtonClick(event) {
    const button = event.currentTarget;
    const buttonType = button.className.split(' ')[1];
    console.log('[v0] Auth button clicked:', buttonType);
}

/**
 * Handle Location Button Click
 */
function handleLocationClick(event) {
    const btn = event.currentTarget;
    btn.disabled = true;
    btn.style.opacity = '0.6';

    console.log('[v0] Location services requested');

    // Simulate location request
    setTimeout(() => {
        btn.textContent = 'Getting location...';

        setTimeout(() => {
            btn.textContent =
                btn.innerHTML.includes('Bus')
                    ? ' Turn on Location Services'
                    : ' Turn on Location Services';
            btn.disabled = false;
            btn.style.opacity = '1';
            console.log('[v0] Location request completed');
        }, 1500);
    }, 300);
}

/**
 * Initialize Event Listeners
 */
function initializeEventListeners() {
    // Navigation
    navItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const pageName = item.getAttribute('data-page');
            navigateTo(pageName);
        });
    });

    // Drawer
    openDrawerBtn.addEventListener('click', openDrawerMenu);
    closeDrawerBtn.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    // Auth Modal
    closeAuthModalBtn?.addEventListener('click', closeAuthModal);
    authModalOverlay?.addEventListener('click', closeAuthModal);
    authButtons.forEach((btn) => {
        btn.addEventListener('click', handleAuthButtonClick);
    });
    btnLoginExisting?.addEventListener('click', openAuthModal);
    drawerProfileBtn?.addEventListener('click', () => {
        closeDrawer();
        setTimeout(openAuthModal, 300);
    });

    // Settings
    bgToggle?.addEventListener('change', toggleBackgroundShift);

    // Survey
    surveyBtns.forEach((btn) => {
        btn.addEventListener('click', handleSurveyBtnClick);
    });

    closeCloseSurveyBtn?.addEventListener('click', closeSurvey);

    // Routes
    routeItems.forEach((item) => {
        item.addEventListener('click', handleRouteClick);
    });

    // Terminals
    terminalItems.forEach((item) => {
        item.addEventListener('click', handleTerminalClick);
    });

    // Settings Items
    settingsItems.forEach((item) => {
        item.addEventListener('click', handleSettingsClick);
    });

    // Service Cards
    serviceCards.forEach((card) => {
        card.addEventListener('click', handleServiceCardClick);
    });

    // Location buttons
    const locationBtns = document.querySelectorAll('.btn-location');
    locationBtns.forEach((btn) => {
        btn.addEventListener('click', handleLocationClick);
    });

    // Retry button
    const retryBtn = document.querySelector('.btn-retry');
    retryBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        console.log('[v0] Retry clicked');
        retryBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            retryBtn.style.transform = 'rotate(0deg)';
        }, 600);
    });

    // Close drawer when clicking on drawer menu items
    const drawerMenuItems = document.querySelectorAll('.drawer-menu-item');
    drawerMenuItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            closeDrawer();
            console.log('[v0] Drawer menu item clicked');
        });
    });

    console.log('[v0] Event listeners initialized');
}

/**
 * Handle Keyboard Navigation
 */
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        // ESC to close drawer or modal
        if (event.key === 'Escape') {
            if (authModal?.classList.contains('active')) {
                closeAuthModal();
            } else if (appState.drawerOpen) {
                closeDrawer();
            }
        }

        // Number keys for quick navigation (1-5)
        const key = event.key;
        if (key >= '1' && key <= '5') {
            const pages = ['home', 'nearby', 'routes', 'terminal', 'settings'];
            navigateTo(pages[parseInt(key) - 1]);
        }
    });

    console.log('[v0] Keyboard navigation initialized');
}

/**
 * Handle Touch Events for Better Mobile Experience
 */
function initializeTouchEvents() {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (event) => {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        // Swiped right (open drawer)
        if (diff < -swipeThreshold && !appState.drawerOpen) {
            openDrawerMenu();
            console.log('[v0] Swipe detected - drawer opened');
        }

        // Swiped left (close drawer)
        if (diff > swipeThreshold && appState.drawerOpen) {
            closeDrawer();
            console.log('[v0] Swipe detected - drawer closed');
        }
    }

    console.log('[v0] Touch events initialized');
}

/**
 * Add Smooth Transitions
 */
function initializeSmoothTransitions() {
    pages.forEach((page) => {
        page.style.transition = 'opacity 0.3s ease-in-out';
    });

    console.log('[v0] Smooth transitions initialized');
}

/**
 * Initialize App
 */
function initializeApp() {
    console.log('[v0] Initializing Bus+ App');

    // Set initial state
    navigateTo('home');

    // Initialize all features
    initializeEventListeners();
    initializeKeyboardNavigation();
    initializeTouchEvents();
    initializeSmoothTransitions();

    // Set initial background
    if (appState.backgroundShift) {
        document.body.style.background = 'linear-gradient(135deg, #E8F4F8 0%, #F5F7FA 100%)';
    }

    // Add observer for viewport changes
    if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (event) => {
            if (!event.matches) {
                console.log('[v0] System switched to light mode');
            }
        });
    }

    console.log('[v0] App initialization complete');
    console.log('[v0] Current page:', appState.currentPage);
    console.log('[v0] Tip: Use number keys 1-5 for quick navigation');
}

/**
 * Wait for DOM to be ready and initialize the app
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

/**
 * Handle Visibility Changes (app goes to background/foreground)
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('[v0] App went to background');
    } else {
        console.log('[v0] App came to foreground');
    }
});

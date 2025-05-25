import '../styles/style.css';

// Import Components
import LoginPage from './components/login-page.js';
import HomePage from './components/home-page.js';
import ProductsPage from './components/products-page.js';
import AddProductPage from './components/add-product-page.js';
import FavoriteProductsPage from './components/favorite-products-page.js';
import NotFoundPage from './components/not-found-page.js';

// Import Data
import ApiService from './data/api-service.js';

// VAPID Public Key
const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

// Konversi base64 ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Request notification permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Browser tidak mendukung notifikasi');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

// Subscribe ke Push Notification
async function subscribeUserToPush() {
  try {
    // Request permission terlebih dahulu
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Permission notifikasi ditolak');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    const token = localStorage.getItem('token');
    if (!token) return;

    const body = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
      }
    };

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    
    if (result.error === false) {
      console.log('Successfully subscribed to push notifications:', result);
      
      // Test notification (opsional)
      showTestNotification();
    } else {
      console.error('Failed to subscribe:', result);
    }

  } catch (error) {
    console.error('Gagal subscribe push:', error);
  }
}

// Show test notification untuk testing
function showTestNotification() {
  if (Notification.permission === 'granted') {
    new Notification('Push Notification Aktif!', {
      body: 'Anda akan menerima notifikasi untuk story baru',
      icon: '/icon-192x192.png'
    });
  }
}

// Register Service Worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./sw.bundle.js'); // pastikan path benar
      console.log('Service Worker terdaftar!', registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker ready!');
      
      return registration;
    } catch (error) {
      console.error('SW gagal:', error);
      return null;
    }
  } else {
    console.log('Service Worker tidak didukung browser');
    return null;
  }
}

// Routes
const routes = {
  '/': HomePage,
  '/products': ProductsPage,
  '/add': AddProductPage,
  '/favorite': FavoriteProductsPage,
  '/login': LoginPage,
};

// API Service Instance
const apiService = new ApiService();

// Update layout berdasarkan token
const updateLayout = (isAuthenticated) => {
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  header.style.display = isAuthenticated ? 'block' : 'none';
  footer.style.display = isAuthenticated ? 'block' : 'none';
};

// Render halaman berdasarkan hash
const router = async () => {
  const token = localStorage.getItem('token');
  const hash = window.location.hash.slice(1) || '/';
  const isLoginPage = hash === '/login';

  updateLayout(!!token);

  if (!token && !isLoginPage) {
    window.location.hash = '#/login';
    return;
  }

  if (token && isLoginPage) {
    window.location.hash = '#/';
    return;
  }

  const page = routes[hash] || NotFoundPage;
  const mainContent = document.getElementById('mainContent');

  try {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        mainContent.innerHTML = '';
        const pageElement = new page();
        mainContent.appendChild(pageElement.render());
        pageElement.afterRender();
      });
    } else {
      mainContent.innerHTML = '';
      const pageElement = new page();
      mainContent.appendChild(pageElement.render());
      pageElement.afterRender();
    }

    if (token) {
      updateActiveLink(hash);
    }

  } catch (error) {
    console.error('Error rendering page:', error);
    mainContent.innerHTML = `<div class="error-message">Terjadi kesalahan saat memuat halaman: ${error.message}</div>`;
  }
};

// Highlight menu aktif
const updateActiveLink = (hash) => {
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  const links = {
    '/': 'homeLink',
    '/products': 'productsLink',
    '/add': 'addLink',
    '/favorite': 'favoriteLink'
  };

  const currentLink = document.getElementById(links[hash]);
  if (currentLink) {
    currentLink.classList.add('active');
  }
};

// Logout setup
const setupLogoutHandler = () => {
  const nav = document.querySelector('nav ul');
  if (nav && !document.getElementById('logoutLink')) {
    const logoutItem = document.createElement('li');
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.id = 'logoutLink';
    logoutLink.className = 'nav-link';
    logoutLink.textContent = 'Logout';
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.hash = '#/login';
    });
    logoutItem.appendChild(logoutLink);
    nav.appendChild(logoutItem);
  }
};

// Hamburger menu toggle
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navigationMenu = document.querySelector('nav');

if (hamburgerMenu && navigationMenu) {
  hamburgerMenu.addEventListener('click', () => {
    navigationMenu.classList.toggle('active');
  });

  // Close menu jika klik di luar
  document.addEventListener('click', (event) => {
    if (!navigationMenu.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      navigationMenu.classList.remove('active');
    }
  });
}

// Skip to Content Support
document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.querySelector('#mainContent');
  const skipLink = document.querySelector('.skip-link');
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    });
  }
});

// Init router dan event
window.addEventListener('load', async () => {
  await registerServiceWorker();
  await router();

  const token = localStorage.getItem('token');
  if (token) {
    setupLogoutHandler();
    // Delay sedikit untuk memastikan service worker ready
    setTimeout(async () => {
      await subscribeUserToPush();
    }, 1000);
  }
});

window.addEventListener('hashchange', router);

// Deteksi perubahan token
window.addEventListener('storage', (event) => {
  if (event.key === 'token') {
    updateLayout(!!event.newValue);
    if (event.newValue) {
      setupLogoutHandler();
      setTimeout(async () => {
        await subscribeUserToPush();
      }, 1000);
    }
  }
});

export { router };
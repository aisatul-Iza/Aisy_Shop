class ApiService {
    constructor() {
      this.baseUrl = 'https://story-api.dicoding.dev/v1';
      this.token = localStorage.getItem('token') || null;
    }
  
    // ===== Helper Methods =====
  
    setToken(token) {
      this.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  
    getToken() {
      return this.token;
    }
  
    // ===== Manajemen Pengguna =====
  
    async register(name, email, password) {
      try {
        const response = await fetch(`${this.baseUrl}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });
  
        const responseJson = await response.json();
  
        if (responseJson.error) {
          throw new Error(responseJson.message);
        }
  
        return responseJson;
      } catch (error) {
        console.error('Error pendaftaran:', error);
        throw new Error('Gagal mendaftar. Silakan coba lagi nanti.');
      }
    }
  
    async login(email, password) {
      try {
        const response = await fetch(`${this.baseUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
  
        const responseJson = await response.json();
  
        if (responseJson.error) {
          throw new Error(responseJson.message);
        }
  
        // Simpan token untuk permintaan selanjutnya
        if (responseJson.loginResult?.token) {
          this.setToken(responseJson.loginResult.token);
          
          // Simpan juga user data jika diperlukan
          localStorage.setItem('userId', responseJson.loginResult.userId);
          localStorage.setItem('userName', responseJson.loginResult.name);
        }
  
        return responseJson;
      } catch (error) {
        console.error('Error login:', error);
        throw new Error('Gagal login. Silakan coba lagi nanti.');
      }
    }
  
    logout() {
      this.setToken(null);
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
    }
  
    // ===== Manajemen Cerita =====
  
    async getAllStories(page = 1, size = 10, location = 0) {
      try {
        let url = `${this.baseUrl}/stories?page=${page}&size=${size}&location=${location}`;
        
        let headers = {};
        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }
  
        const response = await fetch(url, { headers });
        const responseJson = await response.json();
  
        if (responseJson.error) {
          throw new Error(responseJson.message);
        }
  
        return responseJson.listStory || [];
      } catch (error) {
        console.error('Error mengambil cerita:', error);
        throw new Error('Gagal memuat cerita. Silakan coba lagi nanti.');
      }
    }
  
    async getAllStories(page = 1, size = 30, location = 1) {
      const token = localStorage.getItem('token'); // pastikan token ada
      const url = `https://story-api.dicoding.dev/v1/stories?page=${page}&size=${size}&location=${location}`;

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const json = await response.json();

        // ✅ Simpan manual ke cache agar bisa diakses offline
        if ('caches' in window) {
          const cache = await caches.open('dicoding-stories-cache');
          await cache.put(url, response.clone());
        }

        return json.listStory;
      } catch (error) {
        console.warn('Gagal fetch dari network, coba ambil dari cache');

        // 🔁 Ambil dari cache jika offline
        if ('caches' in window) {
          const cache = await caches.open('dicoding-stories-cache');
          const cachedResponse = await cache.match(url);
          if (cachedResponse) {
            const cachedJson = await cachedResponse.json();
            return cachedJson.listStory;
          }
        }

        throw new Error('Tidak bisa memuat data produk. Coba lagi nanti.');
      }
    }

  
    async addStory(description, photo, lat = null, lon = null) {
      try {
        if (!this.token) {
          throw new Error('Autentikasi diperlukan untuk menambahkan cerita');
        }
  
        // Buat FormData untuk permintaan multipart/form-data
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photo);
        
        // Tambahkan koordinat jika tersedia
        if (lat !== null) formData.append('lat', lat);
        if (lon !== null) formData.append('lon', lon);
  
        const response = await fetch(`${this.baseUrl}/stories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formData
        });
  
        const responseJson = await response.json();
  
        if (responseJson.error) {
          throw new Error(responseJson.message);
        }
  
        return responseJson;
      } catch (error) {
        console.error('Error menambahkan cerita:', error);
        throw new Error('Gagal menambahkan cerita. Silakan coba lagi nanti.');
      }
    }
  
    async addStoryAsGuest(description, photo, lat = null, lon = null) {
      try {
        // Buat FormData untuk permintaan multipart/form-data
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photo);
        
        // Tambahkan koordinat jika tersedia
        if (lat !== null) formData.append('lat', lat);
        if (lon !== null) formData.append('lon', lon);
  
        const response = await fetch(`${this.baseUrl}/stories/guest`, {
          method: 'POST',
          body: formData
        });
  
        const responseJson = await response.json();
  
        if (responseJson.error) {
          throw new Error(responseJson.message);
        }
  
        return responseJson;
      } catch (error) {
        console.error('Error menambahkan cerita sebagai tamu:', error);
        throw new Error('Gagal menambahkan cerita. Silakan coba lagi nanti.');
      }
    }
  
    // ===== Push Notification Methods =====
  
    // Mendaftarkan Service Worker
    async registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Pendaftaran ServiceWorker berhasil:', registration);
          return registration;
        } catch (error) {
          console.error('Pendaftaran ServiceWorker gagal:', error);
          throw error;
        }
      } else {
        throw new Error('Service worker tidak didukung oleh browser ini');
      }
    }
  
    // Konversi Base64 ke Uint8Array untuk VAPID key
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  
    // Berlangganan notifikasi push
    async subscribeToPushNotifications() {
      try {
        if (!this.token) {
          throw new Error('Autentikasi diperlukan untuk berlangganan notifikasi');
        }
        
        const registration = await navigator.serviceWorker.ready;
        
        // VAPID public key dari dokumentasi
        const publicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(publicKey),
        });
        
        // Kirim detail langganan ke server
        const response = await fetch(`${this.baseUrl}/notifications/subscribe`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });
        
        const responseJson = await response.json();
        
        if (responseJson.error) {
          throw new Error(responseJson.message);
        }
        
        return responseJson;
      } catch (error) {
        console.error('Error berlangganan notifikasi push:', error);
        throw new Error('Gagal berlangganan notifikasi. Silakan coba lagi nanti.');
      }
    }
  
    // Berhenti berlangganan notifikasi push
    async unsubscribeFromPushNotifications() {
      try {
        if (!this.token) {
          throw new Error('Autentikasi diperlukan untuk berhenti berlangganan notifikasi');
        }
        
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          console.log('Tidak ada langganan untuk dibatalkan');
          return { error: false, message: 'Tidak ada langganan aktif' };
        }
        
        // Berhenti berlangganan secara lokal
        await subscription.unsubscribe();
        
        // Beri tahu server
        const response = await fetch(`${this.baseUrl}/notifications/subscribe`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
        
        const responseJson = await response.json();
        
        if (responseJson.error) {
          throw new Error(responseJson.message);
        }
        
        return responseJson;
      } catch (error) {
        console.error('Error berhenti berlangganan notifikasi push:', error);
        throw new Error('Gagal berhenti berlangganan notifikasi. Silakan coba lagi nanti.');
      }
    }
  }
  
  export default ApiService;
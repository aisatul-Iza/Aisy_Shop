// File: Script/components/favorite-products-page.js
import Database from '../data/database.js';

export default class FavoriteProductsPage {
  constructor() {
    this.element = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.classList.add('page-transition');
    this.element.innerHTML = `
      <section role="region" aria-labelledby="favorites-title">
        <h2 id="favorites-title" class="section-title">Produk Favorit Saya</h2>
        <div id="loading" class="loading"><div class="loading-spinner"></div></div>
        <div id="error-container"></div>
        <div id="favorite-products-container" class="products-container"></div>
      </section>
    `;
    return this.element;
  }

  async afterRender() {
    try {
      this.showLoading();
      const container = document.getElementById('favorite-products-container');
      const errorContainer = document.getElementById('error-container');
      errorContainer.innerHTML = '';
      
      // Pastikan database sudah terinisialisasi
      if (!Database) {
        throw new Error('Database tidak tersedia');
      }
      
      const favoriteProducts = await Database.getAllProducts();
      this.hideLoading();

      if (!favoriteProducts || favoriteProducts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-heart-broken fa-3x"></i>
            <h2>Belum ada produk favorit</h2>
            <p>Simpan produk terlebih dahulu untuk muncul di sini.</p>
            <a href="#/products" class="btn">Lihat Produk</a>
          </div>
        `;
        return;
      }

      container.innerHTML = ''; // Bersihkan container sebelum menambahkan konten baru
      
      favoriteProducts.forEach(product => {
        const formattedDate = new Date(product.createdAt).toLocaleDateString('id-ID');
        const card = document.createElement('div');
        card.classList.add('product-card');

        card.innerHTML = `
          <img src="${product.photoUrl}" class="product-image" alt="${product.description}" loading="lazy">
          <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-location">
              <i class="fas fa-map-marker-alt"></i> ${product.lat ?? '-'}, ${product.lon ?? '-'}
            </p>
            <p><small>Diposting: ${formattedDate}</small></p>
            <div class="product-actions">
              <button class="btn-remove" data-id="${product.id}">❌ Hapus dari Favorit</button>
            </div>
          </div>
        `;

        container.appendChild(card);
      });

      // Tambahkan event listeners setelah semua elemen ditambahkan ke DOM
      this.addEventListeners();
      
    } catch (error) {
      this.hideLoading();
      const errorContainer = document.getElementById('error-container');
      errorContainer.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Terjadi kesalahan saat memuat produk favorit: ${error.message}</p>
          <button id="retry-button" class="btn">Coba Lagi</button>
        </div>
      `;
      
      // Tambahkan event listener untuk tombol coba lagi
      document.getElementById('retry-button').addEventListener('click', () => {
        this.afterRender();
      });
      
      console.error('Error loading favorite products:', error);
    }
  }
  
  addEventListeners() {
    document.querySelectorAll('.btn-remove').forEach(button => {
      button.addEventListener('click', async (e) => {
        try {
          const id = e.target.dataset.id;
          if (!id) {
            throw new Error('ID produk tidak valid');
          }
          
          // Konfirmasi sebelum menghapus
          if (confirm('Apakah Anda yakin ingin menghapus produk ini dari favorit?')) {
            // Tampilkan animasi loading pada tombol
            e.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus...';
            e.target.disabled = true;
            
            await Database.removeProduct(id);
            
            // Animasi fade out pada card produk
            const card = e.target.closest('.product-card');
            card.style.transition = 'opacity 0.5s';
            card.style.opacity = '0';
            
            setTimeout(() => {
              card.remove();
              
              // Periksa apakah masih ada produk tersisa
              const container = document.getElementById('favorite-products-container');
              if (!container.children.length) {
                container.innerHTML = `
                  <div class="empty-state">
                    <i class="fas fa-heart-broken fa-3x"></i>
                    <h2>Belum ada produk favorit</h2>
                    <p>Simpan produk terlebih dahulu untuk muncul di sini.</p>
                    <a href="#/products" class="btn">Lihat Produk</a>
                  </div>
                `;
              }
              
              // Notifikasi sukses
              this.showNotification('Produk berhasil dihapus dari favorit');
            }, 500);
          }
        } catch (error) {
          console.error('Error removing product:', error);
          this.showNotification('Gagal menghapus produk: ' + error.message, 'error');
        }
      });
    });
  }
  
  showNotification(message, type = 'success') {
    // Cek apakah sudah ada notifikasi
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
      existingNotif.remove();
    }
    
    // Buat notifikasi baru
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <p>${message}</p>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animasi masuk
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Hapus notifikasi setelah 3 detik
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'flex';
    }
  }

  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }
}
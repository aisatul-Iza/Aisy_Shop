import ApiService from '../data/api-service.js';
import ProductPresenter from '../presenter/product-presenter.js';
import Database from '../data/database.js'; // 🔥 Tambahkan ini untuk IndexedDB

class ProductsPage {
  constructor() {
    this.element = null;
    this.apiService = new ApiService();
    this.presenter = new ProductPresenter({ view: this, apiService: this.apiService });
    this.map = null;
    this.markers = [];
  }

  render() {
    this.element = document.createElement('div');
    this.element.classList.add('page-transition');
    this.element.innerHTML = `
      <section role="region" aria-labelledby="products-title">
        <h2 id="products-title">Produk</h2>
        <div id="loading" class="loading"><div class="loading-spinner"></div></div>
        <div id="error-container"></div>
        <div id="products-container" class="products-container"></div>
        <div class="map-container"><h2>Lokasi Produk</h2><div id="map"></div></div>
      </section>
    `;
    return this.element;
  }

  afterRender() {
    this.initMap();
    this.presenter.getAllProducts();
  }

  initMap() {
    this.map = L.map('map').setView([-2.5, 118], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  showLoading() {
    document.getElementById('loading').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  showError(message) {
    const container = document.getElementById('error-container');
    container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
  }

  async showProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    this.clearMarkers();

    for (const product of products) {
      const card = document.createElement('div');
      card.classList.add('product-card');
      const formattedDate = new Date(product.createdAt).toLocaleDateString('id-ID');

      const isFavorited = await Database.getProductById(product.id);

      card.innerHTML = `
        <img src="${product.photoUrl}" class="product-image" alt="${product.description}">
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <p class="product-location">
            <i class="fas fa-map-marker-alt"></i> ${product.lat ?? '-'}, ${product.lon ?? '-'}
          </p>
          <p><small>Diposting: ${formattedDate}</small></p>
          <div class="product-actions">
            <button class="btn-save" id="save-btn-${product.id}">
              ${isFavorited ? '💖 Hapus dari Favorit' : '🤍 Simpan ke Favorit'}
            </button>
          </div>
        </div>
      `;

      container.appendChild(card);

      document.getElementById(`save-btn-${product.id}`).addEventListener('click', async () => {
        const isSaved = await Database.getProductById(product.id);
        if (isSaved) {
          await Database.removeProduct(product.id);
          alert('Produk dihapus dari favorit.');
        } else {
          await Database.putProduct(product);
          alert('Produk disimpan ke favorit!');
        }
        this.presenter.getAllProducts(); // Refresh tampilan
      });

      if (product.lat && product.lon) this.addMarker(product);
    }

    if (this.markers.length) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }

  showProductsEmpty() {
    const container = document.getElementById('products-container');
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-box-open fa-3x"></i>
        <h2>Tidak ada produk</h2>
        <p>Belum ada produk tersedia saat ini.</p>
        <a href="#/add" class="btn">Tambah Produk</a>
      </div>
    `;
  }

  addMarker(product) {
    const marker = L.marker([product.lat, product.lon]);
    marker.bindPopup(`
      <div class="popup-content">
        <img src="${product.photoUrl}" alt="${product.description}" style="width:100%;max-height:150px;object-fit:cover;">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
      </div>
    `);
    marker.addTo(this.map);
    this.markers.push(marker);
  }

  clearMarkers() {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
  }
}

export default ProductsPage;

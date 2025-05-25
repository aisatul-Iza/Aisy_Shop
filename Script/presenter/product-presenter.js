class ProductPresenter {
  constructor({ view, apiService }) {
    this._view = view;
    this._apiService = apiService;
  }

  // Mengambil semua produk
  async getAllProducts() {
    try {
      this._view.showLoading();
      const stories = await this._apiService.getAllStories(1, 30, 1); // halaman 1, 30 data, include lokasi

      if (!stories || stories.length === 0) {
        this._view.showProductsEmpty();
      } else {
        this._view.showProducts(stories);
      }
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.hideLoading();
    }
  }

  // Mengambil detail satu produk
  async getProductDetail(id) {
    try {
      this._view.showLoading();
      const story = await this._apiService.getStoryDetail(id);

      if (story) {
        this._view.showProductDetail(story);
      } else {
        this._view.showError('Cerita tidak ditemukan');
      }
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.hideLoading();
    }
  }

  // Tambah produk ke server
  async addProduct(productData) {
    try {
      this._view.showLoading();

      const { description, photo, lat, lon } = productData;
      const response = await this._apiService.addStory(description, photo, lat, lon);

      this._view.showSuccess('Produk berhasil ditambahkan!');
      return response;
    } catch (error) {
      this._view.showError(error.message);
      throw error;
    } finally {
      this._view.hideLoading();
    }
  }

  // Mengelola logika submit form dari AddProductPage
  submitAddProductForm({ form, description, photo, lat, lon }) {
    if (!description || !photo || !lat || !lon) {
      this._view.showError('Harap lengkapi semua field yang diperlukan.');
      return;
    }

    const productData = { description, photo, lat, lon };

    this.addProduct(productData)
      .then(() => {
        form.reset();
        this._view.resetFormUI(); // reset tampilan form (map, kamera, dll.)
        setTimeout(() => {
          window.location.hash = '#/products';
        }, 1500);
      })
      .catch((error) => {
        console.error('Gagal menambahkan produk:', error);
      });
  }
}

export default ProductPresenter;
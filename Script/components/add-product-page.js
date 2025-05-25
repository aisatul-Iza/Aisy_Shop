import ApiService from '../data/api-service.js';
import ProductPresenter from '../presenter/product-presenter.js';

class AddProductPage {
  constructor() {
    this.element = null;
    this.apiService = new ApiService();
    this.presenter = new ProductPresenter({
      view: this,
      apiService: this.apiService
    });
    this.map = null;
    this.marker = null;
    this.latitude = null;
    this.longitude = null;
    this.photoBlob = null;
    this.mediaStream = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.classList.add('page-transition');
    this.element.innerHTML = `
      <section role="region" aria-labelledby="add-product-title">
        <h2 id="add-product-title">Tambah Produk Baru</h2>
        
        <div id="loading" class="loading" style="display: none;">
          <div class="loading-spinner"></div>
        </div>
        
        <div id="message-container"></div>
        
        <div class="form-container">
          <form id="addProductForm">
            <div class="form-group">
              <label for="nama">Nama Produk </label>
              <input type="text" id="nama" name="nama" rows="4" required></input>
            </div>

            <div class="form-group">
              <label for="description">Deskripsi Produk </label>
              <textarea id="description" name="description" rows="4" required></textarea>
            </div>
            
            <div class="form-group">
              <label>Foto Produk </label>
              <div class="camera-container">
                <video id="videoElement" autoplay></video>
                <img id="capturedImage" alt="Foto produk yang diambil">
                <div class="camera-buttons">
                  <button type="button" id="startCameraBtn" class="btn">
                    <i class="fas fa-camera"></i> Buka Kamera
                  </button>
                  <button type="button" id="captureBtn" class="btn" disabled>
                    <i class="fas fa-camera-retro"></i> Ambil Foto
                  </button>
                  <button type="button" id="retakeBtn" class="btn" style="display: none;">
                    <i class="fas fa-redo"></i> Ambil Ulang
                  </button>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Lokasi Produk </label>
              <p>Klik pada peta untuk menentukan lokasi produk</p>
              <div class="location-map-container">
                <div id="locationMap"></div>
              </div>
              <div id="coordinates-display" class="coordinates-display">
                Belum ada lokasi yang dipilih
              </div>
            </div>
            
            <button type="submit" id="submitBtn" class="btn" disabled>
              <i class="fas fa-plus-circle"></i> Tambah Produk
            </button>
          </form>
        </div>
      </section>
    `;
    return this.element;
  }

  afterRender() {
    this.initMap();
    this.initCameraButtons();
    this.initFormSubmission();

    window.addEventListener('hashchange', () => this.stopCameraStream());
    window.addEventListener('beforeunload', () => this.stopCameraStream());
  }

  initMap() {
    this.map = L.map('locationMap').setView([-6.2088, 106.8456], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e) => {
      this.setLocation(e.latlng.lat, e.latlng.lng);
    });
  }

  setLocation(lat, lng) {
    this.latitude = lat;
    this.longitude = lng;

    document.getElementById('coordinates-display').innerHTML = `
      Lokasi dipilih: ${lat.toFixed(6)}, ${lng.toFixed(6)}
    `;

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.checkFormValidity();
  }

  initCameraButtons() {
    const startCameraBtn = document.getElementById('startCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const videoElement = document.getElementById('videoElement');
    const capturedImage = document.getElementById('capturedImage');

    startCameraBtn.addEventListener('click', async () => {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = this.mediaStream;
        videoElement.style.display = 'block';
        captureBtn.disabled = false;
        startCameraBtn.disabled = true;
      } catch (error) {
        console.error('Error accessing camera:', error);
        this.showError('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin dan kamera tersedia.');
      }
    });

    captureBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        this.photoBlob = blob;
        capturedImage.src = URL.createObjectURL(blob);
        capturedImage.style.display = 'block';
        this.stopCameraStream();
        videoElement.style.display = 'none';
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'inline-block';
        this.checkFormValidity();
      }, 'image/jpeg', 0.8);
    });

    retakeBtn.addEventListener('click', () => {
      capturedImage.style.display = 'none';
      capturedImage.src = '';
      this.photoBlob = null;
      startCameraBtn.disabled = false;
      captureBtn.style.display = 'inline-block';
      retakeBtn.style.display = 'none';
      this.checkFormValidity();
    });
  }

  stopCameraStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  initFormSubmission() {
    const form = document.getElementById('addProductForm');
    const descriptionInput = document.getElementById('description');

    descriptionInput.addEventListener('input', () => {
      this.checkFormValidity();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.presenter.submitAddProductForm({
        form,
        description: descriptionInput.value,
        photo: this.photoBlob,
        lat: this.latitude,
        lon: this.longitude
      });
    });
  }

  isFormValid() {
    const description = document.getElementById('description').value;
    return description && this.photoBlob && this.latitude && this.longitude;
  }

  checkFormValidity() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = !this.isFormValid();
  }

  showLoading() {
    document.getElementById('loading').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  showError(message) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
      </div>
    `;
    setTimeout(() => {
      messageContainer.innerHTML = '';
    }, 5000);
  }

  showSuccess(message) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `
      <div class="success-message">
        <p>${message}</p>
      </div>
    `;
    setTimeout(() => {
      messageContainer.innerHTML = '';
    }, 5000);
  }

  resetFormUI() {
    document.getElementById('capturedImage').style.display = 'none';
    document.getElementById('capturedImage').src = '';
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('startCameraBtn').disabled = false;
    document.getElementById('captureBtn').style.display = 'inline-block';
    this.photoBlob = null;

    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }

    this.latitude = null;
    this.longitude = null;
    document.getElementById('coordinates-display').innerHTML = 'Belum ada lokasi yang dipilih';
  }
}

export default AddProductPage;
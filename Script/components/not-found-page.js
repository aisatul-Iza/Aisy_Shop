class NotFoundPage {
    constructor() {
      this.element = null;
    }
    
    render() {
      this.element = document.createElement('div');
      this.element.classList.add('page-transition');
      this.element.innerHTML = `
        <section class="not-found-container" role="alert">
          <div class="not-found-content">
            <i class="fas fa-exclamation-triangle fa-4x"></i>
            <h1>Halaman Tidak Ditemukan</h1>
            <p>Maaf, halaman yang Anda cari tidak tersedia.</p>
            <a href="#/" class="btn">Kembali ke Beranda</a>
          </div>
        </section>
      `;
      
      // Add CSS for this page
      const style = document.createElement('style');
      style.textContent = `
        .not-found-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }
        
        .not-found-content {
          text-align: center;
          padding: 3rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        }
        
        .not-found-content i {
          color: var(--warning-color);
          margin-bottom: 1rem;
        }
        
        .not-found-content h1 {
          margin-bottom: 1rem;
          color: var(--dark-color);
        }
        
        .not-found-content p {
          margin-bottom: 1.5rem;
          color: #666;
        }
      `;
      
      document.head.appendChild(style);
      
      return this.element;
    }
    
    afterRender() {
      // No additional actions needed for the not found page
    }
  }
  
  export default NotFoundPage;
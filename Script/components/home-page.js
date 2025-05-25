class HomePage {
    constructor() {
      this.element = null;
    }
    
    render() {
      this.element = document.createElement('div');
      this.element.classList.add('page-transition');
      this.element.innerHTML = `
        <section class="hero" role="region" aria-labelledby="home-title">
          <h1 id="home-title">Selamat Datang di AisyShop</h1>
          <p>Belanja online jadi lebih menyenangkan dengan AisyShop! Dapatkan produk berkualitas premium dari ribuan partner terpercaya kami dengan harga yang bersaing. Nikmati promo spesial setiap hari, pengiriman super cepat ke seluruh Indonesia, dan jaminan uang kembali 100%. AisyShop hadir sebagai solusi kebutuhan gaya hidup modern Anda - dari fashion, elektronik, hingga kebutuhan rumah tangga, semua ada dalam satu platform!.</p>
          <a href="#/products" class="btn">Mulai Belanja Sekarang</a>
        </section>
        
        <section class="featured-section" role="region" aria-labelledby="featured-title">
          <h2 id="featured-title">Mengapa Memilih Kami</h2>
          <div class="featured-content">
            <p>AisyShop memberikan pengalaman berbelanja online terbaik dengan berbagai keunggulan, antara lain:</p>
            <div class="features">
              <div class="feature">
                <i class="fas fa-truck fa-2x"></i>
                <h3>Pengiriman Cepat</h3>
                <p>Produk dikirim langsung ke alamat Anda dengan cepat dan aman.</p>
              </div>
              
              <div class="feature">
                <i class="fas fa-shield-alt fa-2x"></i>
                <h3>Pembayaran Aman</h3>
                <p>Transaksi Anda dijamin aman dengan sistem pembayaran terpercaya.</p>
              </div>
              
              <div class="feature">
                <i class="fas fa-headset fa-2x"></i>
                <h3>Layanan Pelanggan 24/7</h3>
                <p>Tim kami siap membantu Anda kapan saja.</p>
              </div>
            </div>
          </div>
        </section>
      `;
      
      // Add CSS for this page
      const style = document.createElement('style');
      style.textContent = `

        .featured-section h2 {
          text-align: center;
        }

        .featured-content {
          margin-top: 2rem;
          text-align: center;
        }
        
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .feature {
          background-color: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .feature i {
          color: var(--primary-color);
          margin-bottom: 1rem;
        }
        
        .feature h3 {
          margin-bottom: 1rem;
          color: var(--secondary-color);
        }

        @media (max-width: 768px) {
          .features {
            grid-template-columns: 1fr;
          }
        }
      `;
      
      document.head.appendChild(style);
      
      return this.element;
    }
    
    afterRender() {
      // No additional actions needed for the home page
    }
  }
  
  export default HomePage;
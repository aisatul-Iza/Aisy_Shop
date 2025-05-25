import ApiService from '../data/api-service.js';
import AuthPresenter from '../presenter/auth-presenter.js';

class LoginPage {
  constructor() {
    this.apiService = new ApiService();
    this.presenter = new AuthPresenter({ view: this, apiService: this.apiService });
  }

  render() {
    const container = document.createElement('div');
    container.className = 'login-container';
    container.innerHTML = `
      <div class="login-wrapper">
        <div class="login-header">
          <i class="fas fa-store"></i>
          <h1>AisyShop</h1>
        </div>
        <section class="form-container">
          <form id="loginForm">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required>
            </div>
            <button type="submit" class="btnlogin btn-primary">Login</button>
          </form>
        </section>
      </div>
    `;
    return container;
  }

  afterRender() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      this.presenter.login(email, password);
    });
  }

  showLoading() {
    const btn = document.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = 'Loading...';
  }

  hideLoading() {
    const btn = document.querySelector('button[type="submit"]');
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || 'Login';
  }

  showError(message) {
    alert(message);
  }

  onLoginSuccess() {
    alert('Login berhasil');
    window.location.hash = '#/';
  }
}

export default LoginPage;
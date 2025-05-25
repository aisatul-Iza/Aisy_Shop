class AuthPresenter {
    constructor({ view, apiService }) {
      this._view = view;
      this._apiService = apiService;
    }
  
    async login(email, password) {
      try {
        this._view.showLoading();
        await this._apiService.login(email, password);
        this._view.onLoginSuccess();
      } catch (error) {
        this._view.showError(error.message);
      } finally {
        this._view.hideLoading();
      }
    }
  }
  
  export default AuthPresenter;  
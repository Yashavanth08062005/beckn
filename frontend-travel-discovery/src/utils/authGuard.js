// src/utils/authGuard.js
export const ensureLoggedInOrRedirect = (navigate, options = {}) => {
    const {
      message = 'Please login to access booking.',
    } = options;
  
    // user present => allow and reset any old alert-flag
    const userStr = localStorage.getItem('user');
    if (userStr) {
      sessionStorage.removeItem('authAlertShown');
      return true; // allowed
    }
  
    // show alert only once per redirect flow
    const hasShown = sessionStorage.getItem('authAlertShown');
    if (!hasShown) {
      alert(message);
      sessionStorage.setItem('authAlertShown', '1');
    }
  
    navigate('/login');
    return false; // not allowed
  };
  
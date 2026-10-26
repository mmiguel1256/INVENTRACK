class LoginView {
    constructor(container) {
        this.container = container;
        this.presenter = null;
    }

    setPresenter(presenter) {
        this.presenter = presenter;
    }

    render() {
        this.container.innerHTML = `
            <div class="glass-panel login-wrapper">
                <div class="login-header">
                    <h1 class="title-gradient">INVENTRACK</h1>
                    <p>Bienvenido al futuro del inventario</p>
                </div>
                
                <div id="login-error" class="error-msg"></div>

                <form id="login-form">
                    <div class="input-group">
                        <label class="input-label" for="email">Correo Electrónico</label>
                        <input type="email" id="email" class="input-field" placeholder="ejemplo@inventrack.com" required autocomplete="email">
                    </div>
                    
                    <div class="input-group">
                        <label class="input-label" for="password">Contraseña</label>
                        <input type="password" id="password" class="input-field" placeholder="••••••••" required autocomplete="current-password">
                    </div>

                    <button type="submit" class="btn btn-primary" id="btn-login">
                        Ingresar al Dashboard
                    </button>
                </form>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            this.setLoading(true);
            this.presenter.handleLogin(email, password);
        });
    }

    showError(message) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        this.setLoading(false);
    }

    setLoading(isLoading) {
        const btn = document.getElementById('btn-login');
        if (isLoading) {
            btn.innerHTML = 'Validando...';
            btn.style.opacity = '0.7';
            btn.disabled = true;
        } else {
            btn.innerHTML = 'Ingresar al Dashboard';
            btn.style.opacity = '1';
            btn.disabled = false;
        }
    }
}

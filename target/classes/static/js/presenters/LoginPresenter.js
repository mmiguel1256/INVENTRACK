class LoginPresenter {
    constructor(view, model) {
        this.view = view;
        this.model = model;
        this.view.setPresenter(this);
    }

    init() {
        if (this.model.isAuthenticated()) {
            // Ya está logueado, redirigir o cargar Dashboard
            app.loadDashboard();
        } else {
            this.view.render();
        }
    }

    async handleLogin(email, password) {
        const result = await this.model.login(email, password);
        
        if (result.success) {
            // Cargar Dashboard (se implementará después)
            app.loadDashboard();
        } else {
            this.view.showError(result.message);
        }
    }
}

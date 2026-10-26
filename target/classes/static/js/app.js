class App {
    constructor() {
        this.container = document.getElementById('app-container');
        this.authModel = new AuthModel();
        this.inventoryModel = new InventoryModel();
        this.activePresenter = null;
    }

    start() {
        if (this.authModel.isAuthenticated()) {
            this.loadDashboard();
        } else {
            this.loadLogin();
        }
    }

    loadLogin() {
        if (this.activePresenter && this.activePresenter.destroy) {
            this.activePresenter.destroy();
        }
        const loginView = new LoginView(this.container);
        this.activePresenter = new LoginPresenter(loginView, this.authModel, () => {
            this.loadDashboard();
        });
        this.activePresenter.init();
    }

    loadDashboard() {
        if (this.activePresenter && this.activePresenter.destroy) {
            this.activePresenter.destroy();
        }
        const dashboardView = new DashboardView(this.container);
        this.activePresenter = new DashboardPresenter(
            dashboardView, 
            this.inventoryModel, 
            this.authModel, 
            () => this.logout()
        );
        this.activePresenter.init();
    }

    logout() {
        this.authModel.logout();
        this.loadLogin();
    }
}

// Instantiate app globally
const app = new App();

document.addEventListener('DOMContentLoaded', () => {
    app.start();
});

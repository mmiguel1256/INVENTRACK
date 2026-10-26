class AuthModel {
    constructor() {
        this.token = localStorage.getItem('jwt_token') || null;
        this.user = JSON.parse(localStorage.getItem('user_data')) || null;
    }

    async login(email, password) {
        try {
            const data = await ApiService.post('/auth/login', { email, password });
            this.setSession(data.token, { id: data.id, email: data.email, roles: data.roles });
            return { success: true };
        } catch (error) {
            return { success: false, message: 'Credenciales incorrectas' };
        }
    }

    setSession(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
    }

    isAuthenticated() {
        return this.token !== null;
    }
}

class ApiService {
    static BASE_URL = '/api';

    static async post(endpoint, data) {
        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(errorBody || `Error ${response.status}`);
        }

        return await response.json();
    }

    static async getWithAuth(endpoint, token) {
        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) throw new Error('UNAUTHORIZED');
            throw new Error(`Error ${response.status}`);
        }
        return await response.json();
    }

    static async postWithAuth(endpoint, data, token) {
        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('UNAUTHORIZED');
            const errorBody = await response.text();
            throw new Error(errorBody || `Error ${response.status}`);
        }

        return await response.json();
    }

    static async putWithAuth(endpoint, data, token) {
        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('UNAUTHORIZED');
            throw new Error(`Error ${response.status}`);
        }

        return await response.json();
    }

    static async deleteWithAuth(endpoint, token) {
        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('UNAUTHORIZED');
            throw new Error(`Error ${response.status}`);
        }

        return true;
    }
}

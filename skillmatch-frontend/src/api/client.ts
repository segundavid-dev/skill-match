const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = {
    async get(endpoint: string) {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        return response.json();
    },
    async post(endpoint: string, data: any) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        return response.json();
    }
};

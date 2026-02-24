// Centralized API helper with multi-tenant token support

export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token') || '';
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export function getStoreId(): string | null {
    return localStorage.getItem('store_id');
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
        }
    });
}

import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/api', // Relative path since Vite handles proxy or same domain
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Inject Token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Global Errors (like 401)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // For now, just clear token and redirect or let the page handle it.
            // A more advanced implementation would try to refresh the token here.

            // If it's a login failure itself, don't loop
            if (originalRequest.url.includes('/auth/login')) {
                return Promise.reject(error);
            }

            // Session Expired logic
            localStorage.removeItem('admin_access_token');
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

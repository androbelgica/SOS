import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Set up CSRF token for axios requests
const updateCsrfToken = () => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
    } else {
        console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
    }
};

// Initial token setup
updateCsrfToken();

// Add request interceptor to ensure token is fresh
window.axios.interceptors.request.use(
    config => {
        // Update token before each request
        updateCsrfToken();
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add response interceptor for handling CSRF token errors
window.axios.interceptors.response.use(
    response => {
        // Check if there's a new token in the response headers
        const newToken = response.headers['x-csrf-token'];
        if (newToken) {
            // Update the meta tag with the new token
            const metaToken = document.head.querySelector('meta[name="csrf-token"]');
            if (metaToken) {
                metaToken.content = newToken;
                updateCsrfToken();
            }
        }
        return response;
    },
    error => {
        if (error.response && error.response.status === 419) {
            // Handle CSRF token mismatch without page reload
            return axios.get('/csrf-token')
                .then(response => {
                    // Update the token
                    const metaToken = document.head.querySelector('meta[name="csrf-token"]');
                    if (metaToken && response.data.token) {
                        metaToken.content = response.data.token;
                        updateCsrfToken();
                        
                        // Retry the original request
                        const config = error.config;
                        config.headers['X-CSRF-TOKEN'] = response.data.token;
                        return axios.request(config);
                    }
                    return Promise.reject(error);
                })
                .catch(retryError => {
                    console.error('Failed to refresh CSRF token:', retryError);
                    return Promise.reject(error);
                });
        }
        return Promise.reject(error);
    }
);

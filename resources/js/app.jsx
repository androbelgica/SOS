import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { DarkModeProvider } from './Contexts/DarkModeContext';
import { Toaster } from 'react-hot-toast';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <DarkModeProvider>
                <App {...props} />
                <Toaster position="top-right" toastOptions={{
                    duration: 3000,
                    style: {
                        background: props.darkMode ? '#374151' : '#fff',
                        color: props.darkMode ? '#fff' : '#374151',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: 'white',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: 'white',
                        },
                    }
                }} />
            </DarkModeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

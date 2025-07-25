import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
    // Uncomment below if using self-hosted websockets:
    // wsHost: window.location.hostname,
    // wsPort: 6001,
    // wssPort: 6001,
    // disableStats: true,
    // enabledTransports: ['ws', 'wss'],
});

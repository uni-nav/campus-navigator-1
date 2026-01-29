import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry error monitoring (before React renders)
import { initSentry } from "./lib/sentry";
initSentry();

// Initialize Web Vitals performance monitoring
import { initWebVitals, logPerformanceSummary } from "./lib/performance";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Start performance monitoring after initial render
initWebVitals();

// Log performance summary after page load (development only)
if (import.meta.env.DEV) {
    window.addEventListener("load", () => {
        setTimeout(logPerformanceSummary, 3000);
    });
}

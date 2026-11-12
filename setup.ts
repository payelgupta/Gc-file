import "@testing-library/jest-dom";

// Ensure tests are independently runnable with valid test environment variables
if (typeof process !== "undefined" && process.env) {
  process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://test-project.supabase.co";
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "test-publishable-key-abcdef";
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});


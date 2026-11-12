import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "site_settings_cache";
const SETTINGS_EVENT = "site_settings_updated";

export const DEFAULT_LOGOS = {
  header: "/assets/logo-crest-trimmed.png",
  footer: "/assets/logo-crest-trimmed.png",
  wings: "/assets/aistudio/IMG_20261107_065844-removebg-preview_ad216196.png",
};

// Global in-memory cache to synchronize instantly across all components without flash
let memoryCache: Record<string, string> = (() => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
})();

export const broadcastSettingsUpdate = (newSettings: Record<string, string>) => {
  memoryCache = { ...memoryCache, ...newSettings };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch {
    /* ignore storage full */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(SETTINGS_EVENT, { detail: memoryCache })
    );
  }
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>(() => memoryCache);
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (!error && data) {
        const map: Record<string, string> = {};
        data.forEach((row) => {
          if (row.key && row.value !== null && row.value !== undefined) {
            map[row.key] = row.value;
          }
        });

        // Merge with existing cache
        const merged = { ...memoryCache, ...map };
        memoryCache = merged;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
        } catch {
          /* ignore */
        }
        setSettings(merged);
      }
    } catch {
      // Fallback to cache if network fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchSettings();

    // Listen to local dispatch events (e.g. from AdminSettings save)
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Record<string, string>>;
      if (customEvent.detail) {
        setSettings({ ...customEvent.detail });
      } else {
        fetchSettings();
      }
    };

    // Listen to cross-tab storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          memoryCache = parsed;
          setSettings(parsed);
        } catch {
          /* ignore */
        }
      }
    };

    window.addEventListener(SETTINGS_EVENT, handleUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(SETTINGS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchSettings]);

  const getSetting = useCallback(
    (key: string, defaultValue: string = ""): string => {
      return settings[key] || memoryCache[key] || defaultValue;
    },
    [settings]
  );

  const headerLogo = settings.header_logo || memoryCache.header_logo || DEFAULT_LOGOS.header;
  const footerLogo = settings.footer_logo || memoryCache.footer_logo || settings.header_logo || memoryCache.header_logo || DEFAULT_LOGOS.footer;

  return {
    settings,
    loading,
    getSetting,
    headerLogo,
    footerLogo,
    refetch: fetchSettings,
  };
};

export default useSiteSettings;

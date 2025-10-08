import posthog from 'posthog-js';

// Initialize PostHog
export const initPostHog = () => {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          console.log('PostHog loaded');
        }
      },
    });
  } else if (import.meta.env.DEV) {
    console.warn('PostHog key not found. Analytics will not be tracked.');
  }
};

export { posthog };

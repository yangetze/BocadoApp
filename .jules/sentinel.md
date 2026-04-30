## 2024-05-24 - [Rate Limiting external API Endpoint]
**Vulnerability:** Missing rate limiting on external API synchronization endpoint (`/api/exchange-rates/sync-api`).
**Learning:** Endpoints that trigger outbound requests to external services (like `fetchAndStoreApiRate`) are prime targets for abuse. Without limits, an attacker (even an authenticated one, or through a compromised admin account) can rapidly call the endpoint, causing the application to exceed external API rate limits or incur high costs.
**Prevention:** Apply a dedicated rate limiter (e.g., `apiSyncLimiter`) specifically designed for endpoints interacting with third-party APIs.

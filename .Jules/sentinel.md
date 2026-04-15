## 2024-05-18 - Global Rate Limiter Added
**Vulnerability:** The application had rate limiting on authentication routes (/login, /register) but lacked a global rate limiter for all other API endpoints, leaving it susceptible to general DoS attacks or aggressive scraping.
**Learning:** While endpoint-specific rate limiting is crucial for sensitive routes (auth), a baseline global rate limiter is necessary as a defense-in-depth measure to protect server resources.
**Prevention:** Added a globalLimiter middleware using express-rate-limit and applied it to all routes under /api in index.js. Always configure a baseline rate limiter for all public-facing APIs.

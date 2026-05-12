## 2024-05-02 - Token Validation Missing DB Check
**Vulnerability:** JWT authentication only validated the token signature without verifying against the database (`verifyToken` in `authMiddleware.js`), allowing deleted or deactivated users to exploit unexpired tokens to maintain sessions.
**Learning:** Security context for `apps/backend/src/middleware/authMiddleware.js`: verifying a JWT signature is not enough for session control. Deactivated users must be immediately prevented from authenticating regardless of token expiration.
**Prevention:** Ensure auth middleware always queries the database (e.g., `prisma.user.findUnique`) to verify user existence and `active` status before granting access.

## 2024-05-09 - Missing Timeout on External API Calls
**Vulnerability:** External API requests using `fetch` (e.g., to `ve.dolarapi.com` in `exchangeRateController.js`) lacked timeout configurations, potentially allowing the external server's slow responses or hanging connections to exhaust application resources (Denial of Service).
**Learning:** Default behavior for `fetch` in Node.js does not enforce request timeouts, creating an availability risk when integrating with third-party APIs.
**Prevention:** Always implement a timeout mechanism, such as `AbortController` coupled with `setTimeout`, when making outbound HTTP requests to untrusted or external services.

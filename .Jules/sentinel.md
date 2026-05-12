## 2026-05-05 - Prevent Authentication Bypass for Deactivated Users
**Vulnerability:** The `verifyToken` middleware only checked the JWT signature and claims (like `decoded.active`). If a user was deleted or deactivated after the token was issued, the token remained valid until expiration, allowing continued unauthorized access.
**Learning:** Validating a JWT's signature is insufficient for session management when user state can change. You must additionally query the database to ensure the user still exists and is active.
**Prevention:** In the `verifyToken` middleware, after successfully verifying the token, always query the database (e.g., `prisma.user.findUnique`) to check if the user exists and their `active` status is true, preventing deactivated users from exploiting unexpired tokens.
## 2024-05-02 - Token Validation Missing DB Check
**Vulnerability:** JWT authentication only validated the token signature without verifying against the database (`verifyToken` in `authMiddleware.js`), allowing deleted or deactivated users to exploit unexpired tokens to maintain sessions.
**Learning:** Security context for `apps/backend/src/middleware/authMiddleware.js`: verifying a JWT signature is not enough for session control. Deactivated users must be immediately prevented from authenticating regardless of token expiration.
**Prevention:** Ensure auth middleware always queries the database (e.g., `prisma.user.findUnique`) to verify user existence and `active` status before granting access.

## 2024-05-09 - Missing Timeout on External API Calls
**Vulnerability:** External API requests using `fetch` (e.g., to `ve.dolarapi.com` in `exchangeRateController.js`) lacked timeout configurations, potentially allowing the external server's slow responses or hanging connections to exhaust application resources (Denial of Service).
**Learning:** Default behavior for `fetch` in Node.js does not enforce request timeouts, creating an availability risk when integrating with third-party APIs.
**Prevention:** Always implement a timeout mechanism, such as `AbortController` coupled with `setTimeout`, when making outbound HTTP requests to untrusted or external services.
## 2024-05-10 - JWT Privilege Escalation (Stale Role Claims)
**Vulnerability:** The authentication middleware (`verifyToken` in `authMiddleware.js`) was correctly checking if a user existed and was active in the database, but it assigned `req.user = decoded`, allowing outdated role claims to persist. This meant if an `ADMIN` was demoted to `USER`, their existing token would still grant them admin privileges for up to 24 hours until expiration.
**Learning:** Security context for `apps/backend/src/middleware/authMiddleware.js`: verifying a JWT signature and confirming a user is active is not enough for authorization control if privileges can change dynamically. Stale claims in the token must be overridden by fresh attributes from the database before attaching to `req.user`.
**Prevention:** Ensure auth middleware always injects the most current user data (especially the `role`) from the database into `req.user` rather than passing down the static contents of the decoded JWT.

## 2024-05-24 - Missing Database Check in JWT Session Management
**Vulnerability:** The `verifyToken` middleware successfully validated a JWT's signature and expiration, but did not query the database to verify if the user still existed or remained active.
**Learning:** This architectural flaw allowed deactivated or deleted users to continue accessing protected resources until their unexpired tokens naturally timed out, creating a significant authorization bypass window.
**Prevention:** In stateless JWT authentication schemes, verifying the token's cryptographic integrity must always be coupled with a database lookup (e.g., `prisma.user.findUnique`) in the core middleware to enforce real-time session invalidation (account deletion or deactivation).
## 2024-05-12 - Missing Password Rotation Capability
**Vulnerability:** The application creates default passwords using `identificationNumber` (which may be public or easily guessable), but provides no endpoint for users to change their passwords.
**Learning:** Hardcoding or relying on weak default passwords during registration becomes a critical vulnerability if users are permanently locked into using them.
**Prevention:** Always ensure a robust password management lifecycle is implemented, including endpoints for changing and resetting passwords, especially when default credentials are predetermined or weak.

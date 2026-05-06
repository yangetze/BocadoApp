
## 2024-05-24 - Missing Database Check in JWT Session Management
**Vulnerability:** The `verifyToken` middleware successfully validated a JWT's signature and expiration, but did not query the database to verify if the user still existed or remained active.
**Learning:** This architectural flaw allowed deactivated or deleted users to continue accessing protected resources until their unexpired tokens naturally timed out, creating a significant authorization bypass window.
**Prevention:** In stateless JWT authentication schemes, verifying the token's cryptographic integrity must always be coupled with a database lookup (e.g., `prisma.user.findUnique`) in the core middleware to enforce real-time session invalidation (account deletion or deactivation).

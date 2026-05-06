## 2024-05-02 - Token Validation Missing DB Check
**Vulnerability:** JWT authentication only validated the token signature without verifying against the database (`verifyToken` in `authMiddleware.js`), allowing deleted or deactivated users to exploit unexpired tokens to maintain sessions.
**Learning:** Security context for `apps/backend/src/middleware/authMiddleware.js`: verifying a JWT signature is not enough for session control. Deactivated users must be immediately prevented from authenticating regardless of token expiration.
**Prevention:** Ensure auth middleware always queries the database (e.g., `prisma.user.findUnique`) to verify user existence and `active` status before granting access.

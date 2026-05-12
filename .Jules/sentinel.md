## 2024-05-02 - Token Validation Missing DB Check
**Vulnerability:** JWT authentication only validated the token signature without verifying against the database (`verifyToken` in `authMiddleware.js`), allowing deleted or deactivated users to exploit unexpired tokens to maintain sessions.
**Learning:** Security context for `apps/backend/src/middleware/authMiddleware.js`: verifying a JWT signature is not enough for session control. Deactivated users must be immediately prevented from authenticating regardless of token expiration.
**Prevention:** Ensure auth middleware always queries the database (e.g., `prisma.user.findUnique`) to verify user existence and `active` status before granting access.

## 2024-05-07 - Prevent Sensitive Info Leak in Error Logs
**Vulnerability:** Passing the full `error` object directly to `logger.error` in catch blocks can inadvertently log sensitive backend data, such as database query structures, internal paths, or full stack traces.
**Learning:** Depending on the logger configuration (like Winston), serializing the full `error` object exposes internal implementation details that could be accessed if log files are exposed.
**Prevention:** Always log specific properties like `error.message` or safely structured data objects (e.g., `{ message: error.message, code: error.code }`) instead of the raw `error` instance.

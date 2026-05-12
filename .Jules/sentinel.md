## 2024-05-02 - Token Validation Missing DB Check
**Vulnerability:** JWT authentication only validated the token signature without verifying against the database (`verifyToken` in `authMiddleware.js`), allowing deleted or deactivated users to exploit unexpired tokens to maintain sessions.
**Learning:** Security context for `apps/backend/src/middleware/authMiddleware.js`: verifying a JWT signature is not enough for session control. Deactivated users must be immediately prevented from authenticating regardless of token expiration.
**Prevention:** Ensure auth middleware always queries the database (e.g., `prisma.user.findUnique`) to verify user existence and `active` status before granting access.

## 2024-05-10 - JWT Privilege Escalation (Stale Role Claims)
**Vulnerability:** The authentication middleware (`verifyToken` in `authMiddleware.js`) was correctly checking if a user existed and was active in the database, but it assigned `req.user = decoded`, allowing outdated role claims to persist. This meant if an `ADMIN` was demoted to `USER`, their existing token would still grant them admin privileges for up to 24 hours until expiration.
**Learning:** Security context for `apps/backend/src/middleware/authMiddleware.js`: verifying a JWT signature and confirming a user is active is not enough for authorization control if privileges can change dynamically. Stale claims in the token must be overridden by fresh attributes from the database before attaching to `req.user`.
**Prevention:** Ensure auth middleware always injects the most current user data (especially the `role`) from the database into `req.user` rather than passing down the static contents of the decoded JWT.

## 2024-05-12 - Missing Password Rotation Capability
**Vulnerability:** The application creates default passwords using `identificationNumber` (which may be public or easily guessable), but provides no endpoint for users to change their passwords.
**Learning:** Hardcoding or relying on weak default passwords during registration becomes a critical vulnerability if users are permanently locked into using them.
**Prevention:** Always ensure a robust password management lifecycle is implemented, including endpoints for changing and resetting passwords, especially when default credentials are predetermined or weak.

## 2024-03-22 - Password Hashing via Identification Number
**Vulnerability:** The application currently defaults to using the user's `identificationNumber` as a plaintext password during registration/creation, and hashes it using bcrypt.
**Learning:** This is a documented weak authentication pattern (mentioned in memory) but addressing it involves significant logic changes across endpoints (e.g. `register`, `createUser`) and might break expected current behavior for users. It requires a larger refactor beyond a 50-line security fix to implement proper password generation or user-provided passwords.
**Prevention:** Always require secure, user-provided passwords or send secure password reset links instead of using predictable default passwords derived from public/semi-public user attributes.

## 2024-03-22 - Password Comparison Time-Constant Leak
**Vulnerability:** The login endpoint checks if a user exists before attempting to verify the password. If the user doesn't exist, it returns early. This can lead to a timing attack where an attacker can determine if a username exists by measuring the response time (bcrypt hash comparison is slow).
**Learning:** Returning early or comparing passwords only when the user exists can leak user existence.
**Prevention:** Always compare a dummy password if the user is not found to ensure consistent response times.

# Requirements Document

## Introduction

This specification addresses critical security vulnerabilities and code quality issues in the VitaForge/ZenFit fitness application. The application consists of a FastAPI Python backend, a Telegram bot, and a Next.js web frontend, integrated with Supabase for database/auth and Groq for AI features. The issues range from hardcoded secrets and predictable password generation to missing input validation, insufficient authorization checks, and poor error handling. Resolving these issues will harden the application against common attack vectors and improve long-term maintainability.

## Glossary

- **API_Service**: The FastAPI Python backend at `apps/api/`
- **Bot_Service**: The Telegram bot application at `apps/bot/`
- **Web_Service**: The Next.js web application at `apps/web/`
- **Auth_Module**: The collective authentication logic across all services handling Telegram login, OIDC, and Supabase Auth
- **Secrets_Manager**: The environment variable system and configuration mechanism used to inject sensitive credentials at runtime
- **Input_Validator**: The component responsible for sanitizing and validating user-supplied data before processing
- **Webhook_Handler**: The endpoint that receives incoming Telegram webhook events
- **Authorization_Guard**: The middleware or check that verifies a user has permission to access a resource
- **Error_Handler**: The component responsible for catching, logging, and responding to application errors
- **Rate_Limiter**: The mechanism that limits the number of requests a client can make within a time window

## Requirements

### Requirement 1: Remove Hardcoded Secrets from Source Code

**User Story:** As a security engineer, I want all sensitive credentials stored exclusively in environment variables, so that secrets are not exposed in version control or client bundles.

#### Acceptance Criteria

1. THE Auth_Module SHALL load CLIENT_ID, CLIENT_SECRET, TELEGRAM_BOT_TOKEN, GROQ_API_KEY, and SUPABASE_SERVICE_KEY exclusively from environment variables with no hardcoded fallback values in source code
2. IF a required secret environment variable (CLIENT_ID, CLIENT_SECRET, TELEGRAM_BOT_TOKEN, GROQ_API_KEY, SUPABASE_SERVICE_KEY, NEXT_PUBLIC_SUPABASE_URL) is missing or set to an empty string at startup, THEN THE Web_Service SHALL refuse to start and log an error message that includes the name of the missing or empty variable
3. THE Web_Service SHALL NOT expose any server-side API keys (Groq, Supabase Service Key, CLIENT_SECRET, TELEGRAM_BOT_TOKEN) to client-side JavaScript bundles
4. WHEN the NEXT_PUBLIC_GROQ_API_KEY variable is referenced, THE Web_Service SHALL replace it with a server-side-only variable name that is not prefixed with NEXT_PUBLIC_
5. THE Web_Service SHALL NOT include hardcoded secret values (CLIENT_ID, CLIENT_SECRET) in any client-side component or file marked with "use client"

### Requirement 2: Generate Cryptographically Secure User Passwords

**User Story:** As a security engineer, I want user passwords to be generated using cryptographically secure random values, so that passwords cannot be reconstructed by an attacker who knows the user's Telegram ID.

#### Acceptance Criteria

1. WHEN a new Telegram user account is created, THE Auth_Module SHALL generate a password using a cryptographically secure random generator with a length of at least 32 characters drawn from uppercase letters, lowercase letters, digits, and symbols
2. THE Auth_Module SHALL NOT derive passwords from any combination of user-visible identifiers (Telegram ID, bot token fragments, or usernames)
3. THE Auth_Module SHALL NOT use password-based sign-in for Telegram users, and SHALL use the Supabase Admin API (admin.createUser or admin.generateLink) to create accounts and issue session tokens directly
4. WHEN Telegram authentication is performed, THE Auth_Module SHALL use Supabase Admin API to issue tokens directly rather than relying on password-based login
5. IF the Supabase Admin API call fails during Telegram authentication, THEN THE Auth_Module SHALL return an error response indicating the authentication service is temporarily unavailable and SHALL NOT fall back to password-based sign-in

### Requirement 3: Verify JWT Tokens Before Processing Claims

**User Story:** As a security engineer, I want all JWT tokens to be cryptographically verified before their claims are trusted, so that forged tokens are rejected.

#### Acceptance Criteria

1. WHEN an OIDC id_token is received, THE Auth_Module SHALL verify the token signature against Telegram's published JWKS endpoint before extracting claims, using a JWKS key cache with a maximum lifetime of 24 hours
2. WHEN JWT verification fails due to an invalid signature, THE Auth_Module SHALL return an HTTP 401 response with a generic error message that does not reveal signature details
3. WHEN JWT verification fails due to an expired token, THE Auth_Module SHALL return an HTTP 401 response indicating token expiration, applying a maximum clock skew tolerance of 30 seconds when evaluating the `exp` claim
4. WHEN an OIDC id_token is received, THE Auth_Module SHALL validate the `iss` claim equals the Telegram OIDC issuer URL and the `aud` claim equals the configured application CLIENT_ID before accepting the token
5. IF the JWKS endpoint is unreachable or returns an error, THEN THE Auth_Module SHALL reject the token with an HTTP 503 response indicating the authentication service is temporarily unavailable
6. IF the id_token is missing any required claim (`iss`, `aud`, `sub`, `exp`), THEN THE Auth_Module SHALL return an HTTP 401 response with a generic error message

### Requirement 4: Validate and Sanitize All User Input

**User Story:** As a developer, I want all user input validated and sanitized at API boundaries, so that injection attacks and malformed data are prevented.

#### Acceptance Criteria

1. WHEN a search query parameter is received, THE API_Service SHALL parameterize the query using the Supabase client library's built-in escaping rather than string interpolation
2. WHEN a search query parameter is received, THE API_Service SHALL reject queries exceeding 200 characters with an HTTP 422 response
3. WHEN a registration request is received, THE API_Service SHALL validate the email field conforms to RFC 5322 format and does not exceed 254 characters before processing
4. WHEN a registration request is received, THE API_Service SHALL validate the `role` field against an allowed set of values (member, gym_owner, trainer) and reject requests with any other value with an HTTP 422 response
5. WHEN the `/v1/food/parse` endpoint receives a request body, THE API_Service SHALL validate the body against a Pydantic model that defines a required `text` field of type string with a maximum length of 1000 characters
6. WHEN any API endpoint receives a string input exceeding 1000 characters (or the field-specific limit if one is defined), THE API_Service SHALL return an HTTP 422 response with a validation error indicating which field exceeded its limit
7. IF user input contains HTML tags or script injection patterns, THEN THE Input_Validator SHALL reject the input with an HTTP 422 response before it reaches the database layer

### Requirement 5: Restrict CORS Configuration

**User Story:** As a security engineer, I want CORS policies to allow only the minimum necessary HTTP methods and headers, so that the attack surface for cross-origin requests is minimized.

#### Acceptance Criteria

1. THE API_Service SHALL restrict `allow_methods` to only the HTTP methods actively used by the application (GET, POST, PATCH, DELETE)
2. THE API_Service SHALL restrict `allow_headers` to only the headers required by the application (Authorization, Content-Type)
3. THE API_Service SHALL restrict `allow_origins` to only the specific production and development domain URLs

### Requirement 6: Verify Webhook Request Origins

**User Story:** As a security engineer, I want all webhook endpoints to verify that incoming requests originate from Telegram, so that spoofed webhook requests are rejected.

#### Acceptance Criteria

1. WHEN a POST request arrives at the Bot_Service webhook endpoint, THE Webhook_Handler SHALL verify that the request includes the `X-Telegram-Bot-Api-Secret-Token` header and that its value matches the configured webhook secret using a constant-time comparison
2. IF the `X-Telegram-Bot-Api-Secret-Token` header is missing or does not match the configured secret, THEN THE Webhook_Handler SHALL return an HTTP 403 response without processing the request body and SHALL log the unauthorized attempt including the source IP address and timestamp
3. WHEN a POST request arrives at the Web_Service telegram webhook endpoint, THE Webhook_Handler SHALL verify that the request includes the `X-Telegram-Bot-Api-Secret-Token` header and that its value matches the configured webhook secret using a constant-time comparison
4. THE Webhook_Handler SHALL configure a unique secret_token of at least 32 characters and no more than 256 characters when registering the webhook URL with the Telegram API via the setWebhook method
5. WHEN the webhook secret is not configured in the environment, THE Webhook_Handler SHALL refuse to start and SHALL output an error message indicating the missing secret configuration

### Requirement 7: Protect Webhook Configuration Endpoints

**User Story:** As a security engineer, I want webhook setup endpoints to require authentication, so that unauthorized parties cannot reconfigure bot webhook URLs.

#### Acceptance Criteria

1. WHEN a request is made to the `/setup-webhook` endpoint, THE Bot_Service SHALL validate that the request includes an authorization header whose value matches a server-side admin secret stored in an environment variable before processing the webhook configuration
2. WHEN a request is made to the GET `/api/telegram` endpoint, THE Web_Service SHALL validate that the request includes an authorization header whose value matches a server-side admin secret stored in an environment variable before processing the webhook configuration
3. IF a request to the `/setup-webhook` endpoint is missing the authorization header or provides a value that does not match the configured admin secret, THEN THE Bot_Service SHALL return an HTTP 401 response and SHALL NOT invoke the Telegram setWebhook API
4. IF a request to the GET `/api/telegram` endpoint is missing the authorization header or provides a value that does not match the configured admin secret, THEN THE Web_Service SHALL return an HTTP 401 response and SHALL NOT invoke the Telegram setWebhook API

### Requirement 8: Enforce Authorization Checks on Protected Resources

**User Story:** As a developer, I want all resource-access endpoints to verify the requesting user has appropriate permissions, so that unauthorized data access is prevented.

#### Acceptance Criteria

1. WHEN the `/v1/gym/members` endpoint is called, THE API_Service SHALL verify the requesting user has the `gym_owner` role and return only members whose `gym_id` matches the requesting user's `gym_id`
2. WHEN the `/v1/leaderboard` endpoint is called, THE API_Service SHALL return only entries whose associated user's `gym_id` matches the requesting user's `gym_id`, limited to a maximum of 50 results
3. IF a user without the `gym_owner` role requests the `/v1/gym/members` or `/v1/gym/analytics/retention` endpoint, THEN THE API_Service SHALL return an HTTP 403 response with an error message indicating insufficient permissions
4. IF a user with no assigned `gym_id` requests the `/v1/leaderboard` endpoint, THEN THE API_Service SHALL return an HTTP 403 response with an error message indicating the user is not associated with a gym

### Requirement 9: Implement Rate Limiting on API Endpoints

**User Story:** As a security engineer, I want all public-facing API endpoints to enforce rate limits, so that abuse and denial-of-service attacks are mitigated.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL restrict authentication endpoints (`/v1/auth/register`, `/v1/auth/login`, `/v1/auth/logout`) to a maximum of 10 requests per fixed 60-second window per IP address
2. THE Rate_Limiter SHALL restrict AI chat and food parse endpoints (`/v1/ai/chat`, `/v1/food/parse`, `/v1/plans/generate`) to a maximum of 30 requests per fixed 60-second window per authenticated user
3. WHEN a client exceeds any rate limit, THE Rate_Limiter SHALL return an HTTP 429 response with a `Retry-After` header containing the number of seconds remaining until the current rate limit window resets, and a response body containing an error message indicating which rate limit was exceeded
4. THE Rate_Limiter SHALL apply a global rate limit of 100 requests per fixed 60-second window per IP address across all endpoints
5. IF a request triggers both an endpoint-specific rate limit and the global rate limit simultaneously, THEN THE Rate_Limiter SHALL reject the request with the shortest `Retry-After` value among the violated limits
6. THE Rate_Limiter SHALL determine client IP address from the `X-Forwarded-For` header to correctly identify clients behind Railway's reverse proxy

### Requirement 10: Implement Structured Error Handling and Logging

**User Story:** As a developer, I want all errors to be caught, logged with context, and returned as structured responses, so that debugging is efficient and no errors are silently swallowed.

#### Acceptance Criteria

1. THE Error_Handler SHALL replace all bare `except:` and `except: pass` clauses with specific exception handlers that log the exception type, exception message, the function name where the error occurred, and the relevant request correlation ID
2. WHEN an external API call (Groq, Telegram) fails with a non-2xx HTTP status or a connection/timeout error, THE Error_Handler SHALL log the HTTP status code (or timeout indication), the endpoint URL with any API key path segments redacted, and the response body truncated to 500 characters with credential values removed
3. WHEN an unhandled exception occurs, THE Error_Handler SHALL return a JSON error response containing the fields "error" (a human-readable description without internal details), "correlation_id" (a UUID v4 string), and "status" (integer 500), with HTTP 500 status code
4. THE Error_Handler SHALL use a structured logging format (JSON) with fields for timestamp (ISO 8601), severity (one of DEBUG, INFO, WARNING, ERROR, CRITICAL), correlation_id (UUID v4), service_name, and message across all services
5. THE Error_Handler SHALL NOT expose internal stack traces, file paths, environment variable values, API keys, database connection strings, or user credentials in error responses returned to clients
6. IF an external API call (Groq, Telegram) does not respond within 30 seconds, THEN THE Error_Handler SHALL abort the request, log the timeout event with the endpoint URL, and return a JSON error response indicating a downstream service timeout with the correlation ID and HTTP 502 status code
7. WHEN an external API call (Groq, Telegram) fails, THE Error_Handler SHALL return a JSON error response to the client containing the fields "error" (indicating downstream service failure without exposing the external service's raw error), "correlation_id", and "status" (integer 502), with HTTP 502 status code

### Requirement 11: Eliminate Code Duplication in Authentication Logic

**User Story:** As a developer, I want Telegram authentication logic consolidated into a single shared module, so that security fixes and changes are applied consistently.

#### Acceptance Criteria

1. THE Auth_Module SHALL implement Telegram user creation and login as a single reusable function shared across all authentication routes
2. WHEN a change is made to the authentication flow, THE Auth_Module SHALL require modification in only one location
3. THE Auth_Module SHALL expose a unified interface that accepts Telegram user data and returns a Supabase access token and user object

### Requirement 12: Enforce Type Safety Across Services

**User Story:** As a developer, I want all API request and response bodies to use strongly-typed models, so that type errors are caught at development time rather than runtime.

#### Acceptance Criteria

1. THE API_Service SHALL define a Pydantic model with field-level type annotations and at least one validation constraint per field (such as minimum length, maximum length, numeric range, regex pattern, or allowed values) for every endpoint that accepts a request body
2. THE Web_Service SHALL NOT use `as any` type assertions in any API route handler file under the `app/api/` directory, and SHALL instead define TypeScript interfaces or type aliases for all parsed request and response data
3. THE API_Service SHALL define a Pydantic response model specifying the shape of the returned JSON (field names and types) for every endpoint, and SHALL use that model as the FastAPI `response_model` parameter
4. WHEN a request body fails Pydantic type validation, THE API_Service SHALL return an HTTP 422 response containing a JSON body with an array of error objects, where each error object includes the field name that failed validation, the type of validation rule violated, and a human-readable error message describing the violation
5. IF the API_Service receives a request body with an untyped parameter (such as `dict` or `Any`), THEN THE API_Service SHALL reject the request at development time via static type checking, ensuring no endpoint handler accepts an untyped request body

### Requirement 13: Add Timeouts and Resilience to External API Calls

**User Story:** As a developer, I want all external API calls to have timeouts and retry logic, so that the application remains responsive when third-party services are slow or unavailable.

#### Acceptance Criteria

1. WHEN the API_Service or Bot_Service makes a request to the Groq API, THE requesting service SHALL enforce a maximum timeout of 30 seconds for the complete request-response cycle
2. WHEN the Bot_Service makes a request to the Telegram API, THE Bot_Service SHALL enforce a maximum timeout of 10 seconds for the complete request-response cycle
3. WHEN an external API call times out, THE Error_Handler SHALL return a structured JSON error response with HTTP 503 status indicating the service is temporarily unavailable, without exposing internal endpoint URLs or stack traces
4. WHEN an external API call fails with a transient error (HTTP 429, 502, 503), THE API_Service or Bot_Service SHALL retry the request up to 2 additional times with exponential backoff starting at a base delay of 1 second (1s, 2s)
5. IF an external API call fails after exhausting all retry attempts, THEN THE Error_Handler SHALL return a structured JSON error response with HTTP 503 status indicating the service is temporarily unavailable
6. WHEN an external API call receives an HTTP 429 response that includes a Retry-After header, THE requesting service SHALL wait at least the duration specified in the Retry-After header before retrying

### Requirement 14: Validate File Upload Content Type

**User Story:** As a security engineer, I want uploaded files to be validated by content type and magic bytes, so that malicious files disguised as images are rejected.

#### Acceptance Criteria

1. WHEN a file is uploaded to the `/v1/photos/upload` endpoint, THE API_Service SHALL verify that the file's declared MIME type (from the multipart Content-Type header) is one of the allowed image formats: `image/jpeg`, `image/png`, or `image/webp`
2. WHEN a file passes MIME type validation, THE API_Service SHALL read the first 12 bytes of the file content and verify that the magic bytes match the expected signature for the declared MIME type (JPEG: `FF D8 FF`, PNG: `89 50 4E 47 0D 0A 1A 0A`, WebP: `52 49 46 46` at offset 0 and `57 45 42 50` at offset 8)
3. IF a file's declared MIME type is not one of the allowed image formats, THEN THE API_Service SHALL reject the upload without further processing and return an HTTP 415 response with an error message indicating the content type is not allowed
4. IF a file's magic bytes do not match the expected signature for its declared MIME type, THEN THE API_Service SHALL reject the upload without further processing and return an HTTP 415 response with an error message indicating the file content does not match the declared type
5. WHEN a file is uploaded without a declared MIME type in the multipart Content-Type header, THE API_Service SHALL reject the upload and return an HTTP 415 response with an error message indicating a content type must be provided
6. WHEN a file is uploaded, THE API_Service SHALL perform content type and magic byte validation before any image processing or storage operations

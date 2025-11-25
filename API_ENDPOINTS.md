# AESP Backend - Complete API Endpoints Documentation

**Base URL:** `http://localhost:8080/api`

---

## 1. Health & Status

### Health Check
- **GET** `/health`
  - Description: Check if backend is running
  - Parameters: None
  - Request Body: None
  - Response: `{ status: "UP", message: "AESP Backend is running", timestamp: number }`

### Root Info
- **GET** `/`
  - Description: Welcome message with API info
  - Parameters: None
  - Request Body: None
  - Response: `{ message: "Welcome to AESP Backend", version: "1.0.0", login: "...", register: "..." }`

---

## 2. Authentication

**Base Path:** `/auth`

### Login
- **POST** `/auth/login`
  - Description: Authenticate user and receive JWT token
  - Parameters: None
  - Request Body: `LoginRequest`
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - Response: `JwtResponse`
    ```json
    {
      "token": "string",
      "type": "Bearer",
      "id": "number",
      "email": "string",
      "role": "string"
    }
    ```

### Register
- **POST** `/auth/register`
  - Description: Create new user account
  - Parameters: None
  - Request Body: `RegisterRequest`
    ```json
    {
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "password": "string",
      "role": "LEARNER|MENTOR|ADMIN"
    }
    ```
  - Response: `MessageResponse`
    ```json
    {
      "success": "boolean",
      "message": "string"
    }
    ```
  - Status: 201 Created (if success), 400 Bad Request (if error)

---

## 3. User Management

**Base Path:** `/users`

### Get All Users (Admin Only)
- **GET** `/users`
  - Description: Retrieve all users in the system
  - Authentication: Required (Admin role)
  - Parameters: None
  - Response: `List<UserResponse>`
    ```json
    [
      {
        "id": "number",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "role": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ]
    ```

### Get User By ID
- **GET** `/users/{id}`
  - Description: Get specific user details
  - Authentication: Required
  - Parameters: `id` (path) - User ID
  - Response: `UserResponse` (same structure as above)

### Delete User (Admin Only)
- **DELETE** `/users/{id}`
  - Description: Delete a user from the system
  - Authentication: Required (Admin role)
  - Parameters: `id` (path) - User ID
  - Response: `MessageResponse`
    ```json
    {
      "success": "boolean",
      "message": "Xóa user thành công"
    }
    ```

---

## 4. Mentor Management

**Base Path:** `/mentors`

### Create Mentor
- **POST** `/mentors`
  - Description: Create new mentor profile
  - Request Body: `MentorRequest`
    ```json
    {
      "userId": "number",
      "bio": "string",
      "experience": "number",
      "skills": ["string"],
      "specialization": "string",
      "hourlyRate": "decimal",
      "englishLevel": "BEGINNER|INTERMEDIATE|ADVANCED|NATIVE",
      "availability": "boolean",
      "rating": "decimal"
    }
    ```
  - Response: `MentorResponse`
    ```json
    {
      "id": "number",
      "userId": "number",
      "bio": "string",
      "experience": "number",
      "skills": ["string"],
      "specialization": "string",
      "hourlyRate": "decimal",
      "englishLevel": "string",
      "availability": "boolean",
      "rating": "decimal",
      "createdAt": "timestamp"
    }
    ```
  - Status: 201 Created

### Get All Mentors
- **GET** `/mentors`
  - Description: Retrieve all available mentors
  - Parameters: None
  - Response: `List<MentorResponse>`

### Search Mentors (Advanced)
- **GET** `/mentors/search`
  - Description: Search and filter mentors
  - Parameters (query):
    - `skill` (optional) - Filter by skill
    - `level` (optional) - Filter by English level
    - `minRating` (optional) - Minimum rating filter
    - `maxRate` (optional) - Maximum hourly rate
    - `onlyAvailable` (optional, default: false) - Only available mentors
  - Response: `List<MentorResponse>`

### Get Mentor By ID
- **GET** `/mentors/{id}`
  - Description: Get specific mentor profile
  - Parameters: `id` (path) - Mentor ID
  - Response: `MentorResponse`

### Update Mentor
- **PUT** `/mentors/{id}`
  - Description: Update mentor profile information
  - Parameters: `id` (path) - Mentor ID
  - Request Body: `MentorRequest`
  - Response: `MentorResponse`

### Delete Mentor
- **DELETE** `/mentors/{id}`
  - Description: Delete mentor profile
  - Parameters: `id` (path) - Mentor ID
  - Response: `MessageResponse`
    ```json
    {
      "success": true,
      "message": "Xóa mentor thành công"
    }
    ```

### Toggle Mentor Availability
- **PATCH** `/mentors/{id}/availability`
  - Description: Toggle mentor's availability status
  - Parameters: `id` (path) - Mentor ID
  - Request Body: None
  - Response: `MentorResponse`

---

## 5. Learner Management

**Base Path:** `/learners`

### Create Learner
- **POST** `/learners`
  - Description: Create new learner profile
  - Request Body: `LearnerRequest`
    ```json
    {
      "userId": "number",
      "bio": "string",
      "englishLevel": "BEGINNER|INTERMEDIATE|ADVANCED",
      "learningGoals": "string",
      "age": "number",
      "interests": ["string"],
      "avgPronunciationScore": "decimal",
      "mentorId": "number (optional)"
    }
    ```
  - Response: `LearnerResponse`
    ```json
    {
      "id": "number",
      "userId": "number",
      "bio": "string",
      "englishLevel": "string",
      "learningGoals": "string",
      "age": "number",
      "interests": ["string"],
      "avgPronunciationScore": "decimal",
      "mentorId": "number (optional)",
      "createdAt": "timestamp"
    }
    ```
  - Status: 201 Created

### Get All Learners
- **GET** `/learners`
  - Description: Retrieve all learners
  - Response: `List<LearnerResponse>`

### Get Learner By ID
- **GET** `/learners/{id}`
  - Description: Get specific learner profile
  - Parameters: `id` (path) - Learner ID
  - Response: `LearnerResponse`

### Get Learner By User ID
- **GET** `/learners/by-user/{userId}`
  - Description: Get learner profile by user ID
  - Parameters: `userId` (path) - User ID
  - Response: `LearnerResponse`

### Update Learner
- **PUT** `/learners/{id}`
  - Description: Update learner profile
  - Parameters: `id` (path) - Learner ID
  - Request Body: `LearnerRequest`
  - Response: `LearnerResponse`

### Delete Learner
- **DELETE** `/learners/{id}`
  - Description: Delete learner profile
  - Parameters: `id` (path) - Learner ID
  - Response: `MessageResponse`
    ```json
    {
      "success": true,
      "message": "Xóa learner thành công"
    }
    ```

### Assign Mentor to Learner
- **POST** `/learners/{id}/assign-mentor/{mentorId}`
  - Description: Assign a mentor to a learner
  - Parameters: 
    - `id` (path) - Learner ID
    - `mentorId` (path) - Mentor ID
  - Request Body: None
  - Response: `LearnerResponse`

---

## 6. Practice Sessions

**Base Path:** `/practice-sessions`

### Create Session
- **POST** `/practice-sessions`
  - Description: Create new practice session
  - Authentication: Required (Learner, Mentor roles)
  - Request Body: `PracticeSessionRequest`
    ```json
    {
      "learnerId": "number",
      "mentorId": "number",
      "topicId": "number",
      "scheduledTime": "datetime",
      "duration": "number (minutes)",
      "sessionType": "string"
    }
    ```
  - Response: `PracticeSessionResponse`
    ```json
    {
      "id": "number",
      "learnerId": "number",
      "mentorId": "number",
      "topicId": "number",
      "scheduledTime": "datetime",
      "duration": "number",
      "sessionType": "string",
      "status": "SCHEDULED|IN_PROGRESS|COMPLETED|CANCELLED",
      "createdAt": "timestamp"
    }
    ```
  - Status: 201 Created

### Get Sessions By Learner
- **GET** `/practice-sessions/learner/{learnerId}`
  - Description: Get all practice sessions for a learner
  - Authentication: Required
  - Parameters: `learnerId` (path) - Learner ID
  - Response: `List<PracticeSessionResponse>`

### Get Sessions By Mentor
- **GET** `/practice-sessions/mentor/{mentorId}`
  - Description: Get all practice sessions for a mentor
  - Authentication: Required (Mentor, Admin roles)
  - Parameters: `mentorId` (path) - Mentor ID
  - Response: `List<PracticeSessionResponse>`

### Get All Sessions (Admin Only)
- **GET** `/practice-sessions`
  - Description: Get all practice sessions
  - Authentication: Required (Admin role)
  - Response: `List<PracticeSessionResponse>`

### Get Session By ID
- **GET** `/practice-sessions/{id}`
  - Description: Get specific session details
  - Authentication: Required
  - Parameters: `id` (path) - Session ID
  - Response: `PracticeSessionResponse`

### Update Session Status
- **PUT** `/practice-sessions/{id}/status`
  - Description: Update session status
  - Authentication: Required (Learner, Mentor roles)
  - Parameters: 
    - `id` (path) - Session ID
    - `status` (query) - New status
  - Response: `MessageResponse`
    ```json
    {
      "success": "boolean",
      "message": "Cập nhật trạng thái session thành công"
    }
    ```

### Delete Session
- **DELETE** `/practice-sessions/{id}`
  - Description: Delete a practice session
  - Authentication: Required (Mentor, Admin roles)
  - Parameters: `id` (path) - Session ID
  - Response: `MessageResponse`
    ```json
    {
      "success": "boolean",
      "message": "Xóa session thành công"
    }
    ```

---

## 7. Conversation Topics

**Base Path:** `/topics`

### Get All Active Topics
- **GET** `/topics`
  - Description: Get all active conversation topics
  - Parameters: None
  - Response: `List<ConversationTopicResponse>`
    ```json
    [
      {
        "id": "number",
        "title": "string",
        "description": "string",
        "category": "string",
        "englishLevel": "BEGINNER|INTERMEDIATE|ADVANCED",
        "keywords": ["string"],
        "active": "boolean",
        "createdAt": "timestamp"
      }
    ]
    ```

### Get All Topics (Including Inactive)
- **GET** `/topics/all`
  - Description: Get all topics regardless of active status
  - Response: `List<ConversationTopicResponse>`

### Get Topic By ID
- **GET** `/topics/{id}`
  - Description: Get specific topic details
  - Parameters: `id` (path) - Topic ID
  - Response: `ConversationTopicResponse`

### Get Topics By Level
- **GET** `/topics/level/{level}`
  - Description: Filter topics by English level
  - Parameters: `level` (path) - BEGINNER, INTERMEDIATE, or ADVANCED
  - Response: `List<ConversationTopicResponse>`

### Get Topics By Category
- **GET** `/topics/category/{category}`
  - Description: Filter topics by category
  - Parameters: `category` (path) - Category name
  - Response: `List<ConversationTopicResponse>`

### Get Topics By Category and Level
- **GET** `/topics/category/{category}/level/{level}`
  - Description: Filter topics by both category and level
  - Parameters: 
    - `category` (path) - Category name
    - `level` (path) - BEGINNER, INTERMEDIATE, or ADVANCED
  - Response: `List<ConversationTopicResponse>`

---

## 8. AI Conversations

**Base Path:** `/conversations`

### Save Message
- **POST** `/conversations`
  - Description: Save a conversation message
  - Request Body: `AIConversationRequest`
    ```json
    {
      "sessionId": "number",
      "speaker": "USER|AI",
      "message": "string"
    }
    ```
  - Response: `AIConversationResponse`
    ```json
    {
      "id": "number",
      "sessionId": "number",
      "speaker": "string",
      "message": "string",
      "createdAt": "timestamp"
    }
    ```

### Get Messages By Session
- **GET** `/conversations/session/{sessionId}`
  - Description: Get all messages in a conversation session
  - Parameters: `sessionId` (path) - Session ID
  - Response: `List<AIConversationResponse>`

### Get Recent Messages
- **GET** `/conversations/session/{sessionId}/recent`
  - Description: Get recent messages from a session (with limit)
  - Parameters: 
    - `sessionId` (path) - Session ID
    - `limit` (query, optional, default: 10) - Number of messages to retrieve
  - Response: `List<AIConversationResponse>`

### Get Message By ID
- **GET** `/conversations/{id}`
  - Description: Get specific message details
  - Parameters: `id` (path) - Message ID
  - Response: `AIConversationResponse`

### Start Conversation
- **POST** `/conversations/start`
  - Description: Generate first AI question for a new conversation
  - Request Body: `StartConversationRequest`
    ```json
    {
      "topicId": "number"
    }
    ```
  - Response: First question as string
    ```
    "string (AI generated question)"
    ```

### Send Message with Audio
- **POST** `/conversations/send-message`
  - Description: Send user message (text or audio), receive AI response with feedback
  - Parameters (query):
    - `sessionId` (required) - Practice session ID
    - `audio` (optional) - Audio file (multipart)
    - `userMessage` (optional) - Text message
  - Request: Multipart form-data or request parameter
  - Response: `SendAudioResponse`
    ```json
    {
      "aiResponse": "string",
      "feedback": "string",
      "audioUrl": "string (optional)"
    }
    ```
  - Notes:
    - If audio is provided, it will be transcribed
    - AI generates response and feedback
    - AI response is converted to speech
    - All messages are saved to database

---

## 9. Pronunciation Scores

**Base Path:** `/pronunciation`

### Submit Score
- **POST** `/pronunciation`
  - Description: Submit pronunciation score for a learner
  - Request Body: `PronunciationScoreRequest`
    ```json
    {
      "learnerId": "number",
      "sessionId": "number",
      "word": "string",
      "score": "decimal (0-100)",
      "audioUrl": "string"
    }
    ```
  - Response: `PronunciationScoreResponse`
    ```json
    {
      "id": "number",
      "learnerId": "number",
      "sessionId": "number",
      "word": "string",
      "score": "decimal",
      "audioUrl": "string",
      "createdAt": "timestamp"
    }
    ```

### Get Scores By Learner
- **GET** `/pronunciation/learner/{learnerId}`
  - Description: Get all pronunciation scores for a learner
  - Parameters: `learnerId` (path) - Learner ID
  - Response: `List<PronunciationScoreResponse>`

### Get Scores By Session
- **GET** `/pronunciation/session/{sessionId}`
  - Description: Get pronunciation scores from a specific session
  - Parameters: `sessionId` (path) - Session ID
  - Response: `List<PronunciationScoreResponse>`

### Get Score By ID
- **GET** `/pronunciation/{id}`
  - Description: Get specific pronunciation score
  - Parameters: `id` (path) - Score ID
  - Response: `PronunciationScoreResponse`

### Get Average Score
- **GET** `/pronunciation/learner/{learnerId}/average`
  - Description: Calculate average pronunciation score for a learner
  - Parameters: `learnerId` (path) - Learner ID
  - Response: `BigDecimal` (score value)

### Get Detailed Average Scores
- **GET** `/pronunciation/learner/{learnerId}/detailed-average`
  - Description: Get detailed average scores breakdown
  - Parameters: `learnerId` (path) - Learner ID
  - Response: `Map<String, BigDecimal>`
    ```json
    {
      "overall_average": "decimal",
      "vowel_average": "decimal",
      "consonant_average": "decimal",
      "word_average": "decimal"
    }
    ```

### Update Learner Average
- **PUT** `/pronunciation/learner/{learnerId}/update-average`
  - Description: Recalculate and update learner's average pronunciation score
  - Parameters: `learnerId` (path) - Learner ID
  - Response: 200 OK (empty body)

---

## 10. Packages

**Base Path:** `/packages`

### Create Package
- **POST** `/packages`
  - Description: Create new lesson package
  - Request Body: `PackageRequest`
    ```json
    {
      "name": "string",
      "description": "string",
      "price": "decimal",
      "duration": "number (days)",
      "lessonsCount": "number",
      "active": "boolean"
    }
    ```
  - Response: `PackageResponse`
    ```json
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "price": "decimal",
      "duration": "number",
      "lessonsCount": "number",
      "active": "boolean",
      "createdAt": "timestamp"
    }
    ```
  - Status: 201 Created

### Get All Packages
- **GET** `/packages`
  - Description: Retrieve all packages
  - Response: `List<PackageResponse>`

### Get Package By ID
- **GET** `/packages/{id}`
  - Description: Get specific package details
  - Parameters: `id` (path) - Package ID
  - Response: `PackageResponse`

### Update Package
- **PUT** `/packages/{id}`
  - Description: Update package information
  - Parameters: `id` (path) - Package ID
  - Request Body: `PackageRequest`
  - Response: `PackageResponse`

### Delete Package
- **DELETE** `/packages/{id}`
  - Description: Delete a package
  - Parameters: `id` (path) - Package ID
  - Response: `MessageResponse`
    ```json
    {
      "success": true,
      "message": "Xóa package thành công"
    }
    ```

### Update Package Status
- **PATCH** `/packages/{id}/status`
  - Description: Activate or deactivate a package
  - Parameters: 
    - `id` (path) - Package ID
    - `active` (query) - true or false
  - Response: `PackageResponse`

---

## 11. Subscriptions

**Base Path:** `/subscriptions`

### Create Subscription
- **POST** `/subscriptions`
  - Description: Create new subscription (usually after payment)
  - Request Body: `SubscriptionRequest`
    ```json
    {
      "learnerId": "number",
      "packageId": "number",
      "startDate": "date",
      "endDate": "date",
      "status": "ACTIVE|CANCELLED|EXPIRED"
    }
    ```
  - Response: `SubscriptionResponse`
    ```json
    {
      "id": "number",
      "learnerId": "number",
      "packageId": "number",
      "startDate": "date",
      "endDate": "date",
      "status": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```
  - Status: 201 Created

### Get All Subscriptions By Learner
- **GET** `/subscriptions/learner/{learnerId}`
  - Description: Get subscription history for a learner
  - Parameters: `learnerId` (path) - Learner ID
  - Response: `List<SubscriptionResponse>`

### Get Active Subscription
- **GET** `/subscriptions/learner/{learnerId}/active`
  - Description: Get currently active subscription for a learner
  - Parameters: `learnerId` (path) - Learner ID
  - Response: `SubscriptionResponse`

### Check Active Subscription
- **GET** `/subscriptions/learner/{learnerId}/has-active`
  - Description: Check if learner has an active subscription
  - Parameters: `learnerId` (path) - Learner ID
  - Response: `Boolean` (true or false)

### Get Subscription By ID
- **GET** `/subscriptions/{id}`
  - Description: Get specific subscription details
  - Parameters: `id` (path) - Subscription ID
  - Response: `SubscriptionResponse`

### Cancel Subscription
- **PUT** `/subscriptions/{id}/cancel`
  - Description: Cancel an active subscription
  - Parameters: `id` (path) - Subscription ID
  - Response: 204 No Content

### Renew Subscription
- **PUT** `/subscriptions/{id}/renew`
  - Description: Renew subscription with new end date
  - Parameters: 
    - `id` (path) - Subscription ID
    - `newEndDate` (query) - New end date (date format)
  - Response: `SubscriptionResponse`

---

## Authentication & Authorization

### JWT Token Usage
- Include the JWT token in the `Authorization` header as `Bearer <token>`
- Example: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Role-Based Access Control (RBAC)
- **ADMIN**: Full system access, user management
- **MENTOR**: Can manage their own sessions and profiles
- **LEARNER**: Can manage their own profile, sessions, and subscriptions

### Public Endpoints (No Authentication Required)
- `GET /api/health`
- `GET /api/`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/topics` (and related topic endpoints)

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "timestamp": "2025-11-25T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation error message",
  "path": "/api/endpoint"
}
```

Common HTTP Status Codes:
- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `204 No Content` - Request succeeded (no content to return)
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## CORS Configuration
- Allowed Origins: `*` (all origins)
- Max Age: 3600 seconds

---

## Summary Statistics
- **Total Endpoints**: 63+
- **Resource Groups**: 11
- **HTTP Methods Used**:
  - GET: ~35 endpoints
  - POST: ~13 endpoints
  - PUT: ~10 endpoints
  - DELETE: ~6 endpoints
  - PATCH: ~2 endpoints

---

## Quick Reference by HTTP Method

### GET Requests (Read Operations)
- Status checks, user/mentor/learner lookup, session retrieval, topic browsing, conversation history, scores review

### POST Requests (Create Operations)
- User registration/login, profile creation, session creation, message submission, score submission

### PUT Requests (Full Update Operations)
- Profile updates, session status updates, package updates, subscription renewal/cancellation

### PATCH Requests (Partial Update Operations)
- Mentor availability toggle, package status updates

### DELETE Requests (Remove Operations)
- User/mentor/learner deletion, session deletion, package deletion

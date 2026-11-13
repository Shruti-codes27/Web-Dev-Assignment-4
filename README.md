# i7Lab 4: Secure Connect and Communication Platform
**Course:** Web Dev III | **Unit:** Unit – 4 | **Marks:** 2.5

A complete, secure Node.js backend application implementing authentication, role-based access control (RBAC), protected CRUD operations for a Notes API, and real-time bidirectional communication using WebSockets (Socket.IO) and Node.js `EventEmitter`.

---

## 🚀 Features & Architecture

### 1. Authentication & Security
- **Password Hashing:** Passwords hashed with salt rounds using `bcrypt`.
- **Stateless Sessions (JWT):** Generates and validates JSON Web Tokens (`jsonwebtoken`) containing user identity and role.
- **Protected Routes:** `protect` middleware blocks unauthenticated requests with `403 Forbidden` (`{"message": "No token provided"}`).
- **Role-Based Access Control (RBAC):** `authorizeRoles("admin")` restricts administrative routes to authorized personnel.

### 2. Secure Notes API (CRUD)
- `POST /api/notes` — Create personal notes (automatically assigns `owner: req.user.id`).
- `GET /api/notes` — Returns an array of notes belonging only to the authenticated user.
- `GET /api/notes/:id` — View specific note (with ownership check).
- `PUT /api/notes/:id` — Update note title or content (with ownership check).
- `DELETE /api/notes/:id` — Remove note (with ownership check).
- `GET /api/notes/admin/all` — Admin-only endpoint to inspect notes across all users.

### 3. Real-Time Chat & Event-Driven Architecture
- **Socket.IO:** Real-time bidirectional room-based messaging (`joinRoom`, `sendMessage`).
- **Node.js EventEmitter:** Decoupled application-level event emitter (`appEmitter`) handling chat logging, audit events, and notifications.
- **Web Interface:** Includes an interactive chat client accessible at `http://localhost:5000/chat.html`.

---

## 📁 Project Structure

```
secure-connect-platform/
├── config/
│   └── db.js                 # MongoDB connection & resilient fallback
├── controllers/
│   ├── authController.js     # Signup, login, and user management
│   └── notesController.js    # Notes CRUD logic
├── middleware/
│   ├── authMiddleware.js     # JWT token validation & protection
│   └── roleMiddleware.js     # Role-based access control (RBAC)
├── models/
│   ├── User.js               # User mongoose schema
│   └── Note.js               # Note mongoose schema
├── public/
│   └── chat.html             # Web-based interactive chat interface
├── routes/
│   ├── authRoutes.js         # /api/auth routing
│   └── notesRoutes.js        # /api/notes routing
├── services/
│   └── dataStore.js          # Unified data persistence layer (MongoDB + In-memory)
├── sockets/
│   └── chatSocket.js         # Socket.IO connection & event handlers
├── utils/
│   └── eventEmitter.js       # App-level Node.js EventEmitter
├── .env                      # Environment configuration
├── package.json              # Dependencies and run scripts
├── server.js                 # Application entry point
└── test-platform.js          # Complete automated test suite
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=secure_connect_random_secret_2026_change_this
```
> *Note:* If MongoDB is offline or unavailable, the application gracefully activates an in-memory data store so all APIs and tests run seamlessly without interruption.

### 3. Run the Server
```bash
npm start
# or for auto-reload during development:
npm run dev
```

The server will output:
```
[server] listening on http://localhost:5000
```

---

## 🧪 Automated Verification Test Suite

Run the full end-to-end test suite verifying Fig 1, Fig 2, and Fig 3:

```bash
npm test
```

### Test Output Preview:
```
========================================================
   i7Lab 4: COMPLETE PLATFORM VERIFICATION TEST
========================================================

--> [1] Testing POST /api/auth/signup (Victor)
Status: 201
Response: {"message":"User registered","id":"...","username":"victor","email":"victor@example.com"}
✔ PASS: Signup response matches Fig 1 specification!

--> [2] Testing POST /api/auth/signup with duplicate email
Status: 400 Response: { message: 'User already exists' }
✔ PASS: Duplicate user registration rejected correctly!

--> [3] Testing POST /api/auth/login (Victor)
Status: 200
Response: {"message":"Login successful","token":"eyJhbGci..."}
✔ PASS: Login response matches Fig 1 specification!

--> [4] Testing GET /api/notes WITHOUT token (Blocked)
Status: 403
Response: {"message":"No token provided"}
✔ PASS: Notes API blocked with 403 'No token provided' matching Fig 1!

--> [5] Testing POST /api/notes (My First Note)
Status: 201
Response: {"_id":"...","title":"My First Note","content":"This is my first note of web dev -III","owner":"..."}
✔ PASS: Note 1 created successfully matching Fig 2 format!

--> [6] Testing POST /api/notes (My Second Note)
Status: 201
Response: {"_id":"...","title":"My Second Note","content":"This is my second note of web dev -III","owner":"..."}
✔ PASS: Note 2 created successfully matching Fig 2 format!

--> [7] Testing GET /api/notes with valid JWT
Status: 200
Response: [ { ... }, { ... } ]
✔ PASS: GET /api/notes returned direct array matching Fig 2!

--> [8] Testing GET, PUT, DELETE for individual notes
✔ PASS: Notes CRUD (Read Single, Update, Delete) completed successfully!

--> [9] Testing Role-Based Access Control (RBAC)
✔ PASS: RBAC restricts standard users and authorizes admin successfully!

--> [10] Testing Socket.IO Real-Time Chat & EventEmitter Logging (Fig 3)
---------------- Console Output Simulation (Fig 3) ----------------
User connected: sk92_xT31Qp
sk92_xT31Qp joined room general
User connected: pL04_vB88Rk
pL04_vB88Rk joined room general

[general] Aditi: Hey team, backend is ready 🚀
[general] Rohan: Testing chat now...
[general] Aditi: Messages arriving in real time ⚡
-------------------------------------------------------------------
✔ PASS: Socket.IO events and EventEmitter logging match Fig 3 perfectly!

========================================================
   🎉 ALL TESTS PASSED SUCCESSFULLY! 100% COMPLIANT 🎉
========================================================
```

---

## 📡 API Reference & Postman Samples

### 1. Signup (`POST /api/auth/signup`)
- **Request Body:**
  ```json
  {
    "username": "victor",
    "email": "victor@example.com",
    "password": "123456"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "User registered",
    "id": "f7cbca9b1af2a98e4bf03131",
    "username": "victor",
    "email": "victor@example.com"
  }
  ```

### 2. Login (`POST /api/auth/login`)
- **Request Body:**
  ```json
  {
    "email": "victor@example.com",
    "password": "123456"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 3. Access Notes Without Token (`GET /api/notes`)
- **Response (403 Forbidden):**
  ```json
  {
    "message": "No token provided"
  }
  ```

### 4. Create Note (`POST /api/notes`)
- **Header:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "title": "My First Note",
    "content": "This is my first note of web dev -III"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "_id": "b58b58fcc962dd6f6adebd3b",
    "title": "My First Note",
    "content": "This is my first note of web dev -III",
    "owner": "f7cbca9b1af2a98e4bf03131",
    "createdAt": "2026-07-10T10:02:50.134Z",
    "updatedAt": "2026-07-10T10:02:50.135Z"
  }
  ```

### 5. Fetch Notes (`GET /api/notes`)
- **Header:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  [
    {
      "_id": "b58b58fcc962dd6f6adebd3b",
      "title": "My First Note",
      "content": "This is my first note of web dev -III",
      "owner": "f7cbca9b1af2a98e4bf03131",
      "createdAt": "2026-07-10T10:02:50.134Z",
      "updatedAt": "2026-07-10T10:02:50.135Z"
    },
    {
      "_id": "ed96b387a3ba4f2f77a492a7",
      "title": "My Second Note",
      "content": "This is my second note of web dev -III",
      "owner": "f7cbca9b1af2a98e4bf03131",
      "createdAt": "2026-07-10T10:05:35.111Z",
      "updatedAt": "2026-07-10T10:05:35.111Z"
    }
  ]
  ```

---

## 💬 Real-Time Chat (Socket.IO + EventEmitter)

To test the real-time chat in a web browser:
1. Start the server (`npm start`).
2. Open two browser tabs to `http://localhost:5000/chat.html`.
3. Set the first tab username to `Aditi` and room to `general`.
4. Set the second tab username to `Rohan` and room to `general`.
5. Send messages between the two tabs — messages will appear in real time and log in the server console exactly as in Fig 3!

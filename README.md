<div align="center">

# 📱 mini Local Zap

**A terminal-based instant messaging system inspired by WhatsApp's core functionality**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

> First Assignment — Distributed Systems at UENF  
> Professor Dr. Luis João Almeida Filho

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technical Decisions](#-technical-decisions)
- [Known Limitations](#-known-limitations)
- [How to Use](#-how-to-use)
- [Database Schema](#-database-schema)
- [Assignment Requirements](#-assignment-requirements)
- [What Would I Do Differently](#-what-would-i-do-differently)

---

## 📖 Overview

**mini Local Zap** is a terminal-based instant messaging system that simulates the core behavior of WhatsApp — without a graphical interface, without a browser, and without the cloud. It runs entirely over a local network.

The project was developed as the first assignment for the Distributed Systems course at UENF. The goal is to practice distributed systems concepts by implementing a multi-client application communicating with a server, covering:

- State synchronization across multiple clients
- Event and exception handling
- Network communication protocols
- Concurrency and disconnection tolerance

---

## ✅ Features

| Feature | Status | Notes |
|---|---|---|
| User registration | ✅ Done | Phone number as unique ID |
| User identification (name + nickname) | ✅ Done | No authentication required |
| Send text messages | ✅ Done | Terminal input |
| Receive text messages | ✅ Done | Real-time push via WebSocket |
| Delivery confirmation | ✅ Done | `sent` → `delivered` on reconnect |
| Read confirmation | ✅ Done | `delivered` → `seen` on open |
| Conversation history | ✅ Done | Retrieved from SQLite |
| Offline message queuing | ✅ Done | Delivered on reconnect |
| Concurrent users | ✅ Done | Multiple simultaneous connections |

---

## 🏗️ Architecture

The system follows a classic **client-server architecture** with three separated components:

```
┌──────────────────────────────────────────────┐
│                  LOCAL NETWORK               │
│                                              │
│   ┌──────────┐        ┌──────────────────┐   │
│   │ Client A │◄──────►│                  │   │
│   └──────────┘        │     Server       │   │
│                       │   (Node.js +     │   │
│   ┌──────────┐        │   WebSocket)     │   │
│   │ Client B │◄──────►│                  │   │
│   └──────────┘        └────────┬─────────┘   │
│                                │             │
│                       ┌────────▼─────────┐   │
│                       │  SQLite3 (DB)    │   │
│                       └──────────────────┘   │
└──────────────────────────────────────────────┘
```

### Message State Flow

Every message follows a strict lifecycle:

```
[User sends]
     │
     ▼
  📤 SENT          ← message stored in DB; recipient offline or not yet received
     │
     ▼ (recipient connects / is online)
  📬 DELIVERED     ← server pushes message; client ACKs receipt
     │
     ▼ (recipient opens the conversation)
  👁️ SEEN          ← client sends read confirmation; server updates DB and notifies sender
```

### Component Responsibilities

| Component | Responsibility |
|---|---|
| **Client** | Terminal UI, send/receive messages, send ACKs (delivered + seen) |
| **Server** | Route messages, manage connections, update message states, notify senders |
| **Database (SQLite3)** | Persist users, messages, conversation history |

---

## ⚙️ Technical Decisions

### 1. Protocol: WebSocket — Why?

Simply because it was the easiest to implement alone within the time available.

However, to be technically honest: **gRPC would have been the better choice** for this project. Here's why:

The professor restricted browser-based systems. That restriction removes gRPC's main real-world limitation — native browser incompatibility. Since this runs terminal-only, there is technically no reason not to use gRPC.

| | WebSocket | gRPC |
|---|---|---|
| Contract | ❌ None — untyped JSON | ✅ `.proto` file — enforced schema |
| Serialization | JSON (`JSON.stringify`) | Binary Protobuf (~5–10× more compact) |
| Streaming | ✅ Bidirectional | ✅ Bidirectional (native) |
| Browser support | ✅ Native | ❌ Requires gRPC-Web + proxy |
| Terminal support | ✅ | ✅ |
| Type safety | ❌ | ✅ Compile-time errors |

> **Bottom line:** WebSocket was chosen for simplicity. gRPC is the technically superior choice for a terminal-only system, especially for anything that would go to production.

---

### 2. Language: JavaScript (Node.js) — Why?

The ideal language for this project is **Rust** (no garbage collector, true parallelism, better scalability). But since the goal was to deliver a working system within the deadline, Node.js was chosen due to familiarity.

For reference, here's how the main options compare:

| Language | Performance | Concurrency Model | Complexity |
|---|---|---|---|
| **Rust** | 🥇 Highest | True parallelism, no GC | High |
| **Go** | 🥈 Very high | Goroutines (lightweight threads) | Medium |
| **Node.js** | Medium | Event loop (single thread) | Low |

Node.js handles I/O-bound workloads (like chat) well. The event loop limitation only becomes a real bottleneck at tens of thousands of simultaneous connections — far beyond the scope of this assignment.

---

### 3. Database: SQLite3 — Why?

It's a JavaScript library. All you need is:

```bash
npm install
```

No Docker, no external service, no configuration. Chosen to keep the project simple and easy to test on any machine.

**The trade-off:** SQLite3 does not support concurrent WRITE operations. For production scale, PostgreSQL (ideally via Docker) would be the right choice, since it handles concurrent writes properly.

> **SQLite3 is the bottleneck of this project.** However, supporting a high number of simultaneous users is not a requirement for this assignment — so it is an acceptable trade-off.

---

## ⚠️ Known Limitations

| Limitation | Reason | Production Fix |
|---|---|---|
| No authentication | Out of scope | JWT + bcrypt |
| No encryption | Out of scope | TLS + E2E encryption |
| SQLite write bottleneck | Simplicity | PostgreSQL |
| No group chats | Out of scope | — |
| Terminal only (no GUI) | By design (assignment rule) | React Native / Flutter |
| Single server instance | Simplicity | Load balancer + Redis pub/sub |

---

## 🚀 How to Use

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Zadoque/mini_local_zap
cd mini_local_zap
npm install
```

### Running the Server

```bash
npm start
```

The server starts on port `8080` by default.

### Running a Client

```bash
npm start
```

You will be prompted to:
1. Enter your phone number (unique ID)
2. Enter your name and nickname
3. Start chatting

### Running Multiple Clients (same machine)

Open multiple terminal windows and run `node client.js` in each one.

---

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE Usuario (
  telefone     TEXT PRIMARY KEY,
  nome      TEXT NOT NULL,
  apelido  TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  sender       TEXT NOT NULL,
  recipient    TEXT NOT NULL,
  content      TEXT NOT NULL,
  timestamp    DATETIME DEFAULT CURRENT_TIMESTAMP,
  status       TEXT DEFAULT 'sent',  -- 'sent' | 'delivered' | 'seen'
  FOREIGN KEY (sender)    REFERENCES users(phone),
  FOREIGN KEY (recipient) REFERENCES users(phone)
);
```

---

## 📚 Assignment Requirements

<details>
<summary>Click to expand full assignment specification</summary>

### Minimum Viable Product

The system must allow:

1. **User registration and identification.** Each user must have a unique ID (phone number), name, and nickname. No complex authentication or cryptography required.

2. **Sending messages.** A user must be able to send text messages to another user. Each message must contain at least: sender, recipient, text content, send timestamp, and message state (`sent`, `delivered`, or `seen`).

3. **Delivery confirmation.** The system must indicate whether the message was effectively delivered to the recipient and display its current state.

4. **Conversation history.** Messages exchanged between two users must be retrievable.

5. **Network communication.** The system must work with clients and server(s) communicating over a network. Allowed protocols: Sockets, WebSocket, RPC, or RMI. HTTP may be used, but browser-based web systems are not allowed. The programming language is free to choose.

### Technical Requirements

1. **Distributed solution.** The system cannot be a single local program with everything in the same memory. There must be separation between at least a client and a server — ideally including a separate database/persistence server.

2. **Concurrency support.** Two users connected simultaneously, exchanging messages at nearly the same time, with correct status updates.

3. **Disconnection tolerance.** If the recipient is offline, the system must handle this consistently:
   - Message remains as `sent`
   - Upon reconnection, transitions to `delivered`
   - Upon opening the conversation, transitions to `seen`

### Evaluation Criteria

1. Does the system fulfill the minimum requirements?
2. Do the delivery and read confirmations work correctly?
3. Is the component separation well thought out?
4. Did the team understand the problems of communication, concurrency, and synchronization?
5. Is the code organized and does it handle failures? (Documentation is not mandatory.)
6. All members of the pair must know the software and understand its architecture and the purpose of each part of the code.

### Project Defense

The pair must present the system as a product, covering its main advantages and disadvantages. The code must be available on GitHub at least 4 days before the presentation. The pair must explain how they modeled the message flow, how they solved delivery and read confirmations, which limitations still exist, and where the system may fail. A live demo is preferred, but a video is acceptable as a fallback.

</details>

---

## 🔄 What Would I Do Differently

If this project had a larger scope, more time, or a larger team, these would be the upgrades:

| Area | Current | Ideal |
|---|---|---|
| Protocol | WebSocket + JSON | **gRPC + Protobuf** |
| Language | Node.js | **Rust + Tokio** |
| Database | SQLite3 | **PostgreSQL via Docker** |
| Scalability | Single server | **Load balancer + Redis pub/sub** |
| Security | None | **TLS + JWT + bcrypt** |
| Interface | Terminal | **React Native or Flutter** |

> The biggest single improvement would be replacing WebSocket with gRPC. Since browser support is not required, there is no trade-off — only gains: stronger typing, binary serialization, and a formal API contract via `.proto`.

---

<div align="center">

**UENF — Distributed Systems — 2026**

</div>

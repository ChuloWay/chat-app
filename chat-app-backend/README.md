# Chat Backend

## Technologies Used

- MongoDB Atlas
- NestJS Framework
- Mongoose
- Stripe

## Features

1. **User Registration, Authorization, and Profile Update with JWT Token:**
   - Users can register for an account and authenticate using JWT tokens.
   - Users can update their information as needed.

2. **Real-time Messaging with Socket.IO Integration:**
   - Users can send and receive messages in real-time using Socket.IO.
   - The application handles events for connecting, disconnecting, sending, and receiving messages.
   - Chat history is stored in MongoDB for persistence.

3. **User Search and Contact Management:**
   - Users can search for other users and add them to their contact list.
   - The application ensures users are not added to the contact list multiple times.

## Getting Started

### Prerequisites

Ensure the following are installed locally:
1. [Git](https://git-scm.com)
2. [Node.js](https://nodejs.org/)
3. [NPM](https://www.npmjs.com/)

## Implementation Details

The project is implemented using NodeJS, NestJs, TypeScript, and Mongoose for database interactions. The chosen database is MongoDB Atlas.

### Setup Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create an env file:**

   - Duplicate the `.env.example` file in the project root.
   - Rename the duplicated file to `.env`.
   - Open the `.env` file and set your variables as shown in the example file.

   ```bash
   cp .env.example .env
   ```

   Ensure to fill in the necessary values in the `.env` file for a smooth configuration.

3. **Start your server:**

   ```bash
   npm run start:dev
   ```

### 🚀 Thank you for exploring the Chat Backend! Happy coding!

# CodeCanvas

CodeCanvas is a web-based code execution platform that allows users to write and execute code in multiple programming languages. It supports **JavaScript**, **Python**, and **C++**, processes code asynchronously using a worker system, and displays the execution output in real time.

## Features

* Write and execute code in:

  * JavaScript
  * Python
  * C++
* Asynchronous code execution using Redis queues
* Background worker for compiling and running user code
* Stores submission history and results in PostgreSQL
* Modern React frontend
* REST API built with Express
* Fast and scalable architecture

## Tech Stack

### Frontend

* React

### Backend

* Node.js
* Express

### Database

* PostgreSQL

### Queue

* Redis

### Worker

* Node.js Worker Process

## Architecture

```text
                +------------------+
                |   React Client   |
                +--------+---------+
                         |
                         | HTTP
                         |
                +--------v---------+
                | Express Backend  |
                +--------+---------+
                         |
          Stores metadata in PostgreSQL
                         |
                +--------v---------+
                |    PostgreSQL    |
                +------------------+

                         |
              Push submission to Redis
                         |
                +--------v---------+
                |      Redis       |
                +--------+---------+
                         |
                         |
                +--------v---------+
                |  Worker Process  |
                +--------+---------+
                         |
          Compile/Run JS, Python or C++
                         |
                +--------v---------+
                | Update PostgreSQL|
                +------------------+
```

## Supported Languages

* JavaScript (Node.js)
* Python 3
* C++

## Project Structure

```text
codecanvas/
├── client/          # React frontend
├── server/          # Express backend
├── worker/          # Redis worker
├── prisma/          # Prisma schema and migrations
└── README.md
```

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd codecanvas
```

### Install dependencies

```bash
npm install
```

or

```bash
bun install
```

## Environment Variables

Create a `.env` file and configure the following:

```env
DATABASE_URL=your_postgres_connection_string
REDIS_URL=your_redis_connection_string
PORT=5000
```

## Running the Project

### Start PostgreSQL

Ensure PostgreSQL is running and accessible.

### Start Redis

Run Redis locally or use a managed Redis service.

### Start the backend

```bash
bun run dev
```

### Start the worker

```bash
bun run dev
```

### Start the frontend

```bash
bun run dev
```

## How It Works

1. The user writes code in the React application.
2. The Express backend receives the submission.
3. Submission details are stored in PostgreSQL.
4. The submission is pushed into a Redis queue.
5. The worker continuously listens for new jobs.
6. Depending on the selected language:

   * JavaScript is executed using Node.js
   * Python is executed using Python 3
   * C++ is compiled using `g++` and then executed
7. The worker captures the program output.
8. The execution result is stored in PostgreSQL.
9. The frontend displays the final output to the user.

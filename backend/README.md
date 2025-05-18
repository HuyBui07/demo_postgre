# Node.js Backend Project

A modern Node.js backend project with TypeScript, Express, and best practices.

## Features

- TypeScript for type safety
- Express.js web framework
- ESLint and Prettier for code quality
- Environment configuration
- Error handling middleware
- CORS enabled
- Security headers with Helmet
- Request logging with Morgan

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Development

To start the development server:
```bash
npm run dev
```

## Building

To build the project:
```bash
npm run build
```

## Running Production

To start the production server:
```bash
npm start
```

## Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build the project
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm test`: Run tests

## Project Structure

```
src/
  ├── index.ts          # Application entry point
  ├── routes/           # Route definitions
  ├── controllers/      # Route controllers
  ├── middleware/       # Custom middleware
  ├── services/         # Business logic
  ├── models/          # Data models
  └── utils/           # Utility functions
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
``` 
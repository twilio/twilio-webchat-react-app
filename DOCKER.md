# Docker Setup for Twilio Webchat Widget

This project includes Docker configuration to run both the server and client applications in separate containers.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- `.env` file with your environment variables

## Quick Start

### Option 1: Using Docker Compose (Recommended)

Start both services at once:
```bash
yarn docker:up
```

Stop both services:
```bash
yarn docker:down
```

View logs:
```bash
yarn docker:logs
```

### Option 2: Using Individual Docker Commands

#### Server Only
```bash
# Build and run server
yarn docker:server

# Or build and run separately
yarn docker:server:build
yarn docker:server:run
```

#### Client Only
```bash
# Build and run client
yarn docker:client

# Or build and run separately
yarn docker:client:build
yarn docker:client:run
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn docker:server` | Build and run server container |
| `yarn docker:client` | Build and run client container |
| `yarn docker:server:build` | Build server container only |
| `yarn docker:client:build` | Build client container only |
| `yarn docker:server:run` | Run existing server container |
| `yarn docker:client:run` | Run existing client container |
| `yarn docker:up` | Start both services with Docker Compose |
| `yarn docker:down` | Stop both services |
| `yarn docker:build` | Build both containers |
| `yarn docker:logs` | View logs from both services |

## Ports

- **Client**: http://localhost:3000
- **Server**: http://localhost:3002

## Development Features

### Hot Reload
Both containers include volume mounts for hot reloading during development:
- Server changes in `./server/` will trigger nodemon restart
- Client changes in `./src/` will trigger React development server reload

### Environment Variables
The containers will use your `.env` file for environment variables. Make sure to create this file with your Twilio credentials and other configuration.

## Production Build

For production, you can modify the Dockerfiles to build the React app and serve it from the Express server:

1. Build the React app: `yarn build`
2. Serve static files from the Express server
3. Use a single container for both client and server

## Troubleshooting

### Port Already in Use
If you get port conflicts, make sure no other services are running on ports 3000 or 3002:
```bash
# Stop existing containers
yarn docker:down

# Kill any processes using the ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### Environment Variables
Ensure your `.env` file contains all required variables:
- Twilio Account SID
- Twilio Auth Token
- Workspace SID
- Workflow SID
- Other configuration variables

### Container Networking
The containers are connected via a Docker network called `twilio-widget-network`. The client can reach the server at `http://server:3002` within the Docker network.


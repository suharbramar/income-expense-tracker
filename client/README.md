# Income & Expense Tracker (React + JSON Server)

Lightweight full-stack practice app for tracking personal income and expenses. The client is a React single-page app; the API is powered by JSON Server. The goal is to learn and demonstrate a basic end-to-end React workflow (UI, data fetching, CRUD, local mock API).

## What it does

- Capture income and expense entries with a name and amount.
- Persist data to a mock REST API (JSON Server) backed by `server/data.json`.
- View separate income and expense lists and delete items.

## Tech stack

- **Client:** ReactJS(Create React App), Axios.
- **API:** JSON Server 0.17 with a simple `data.json` store.
- **Tooling:** npm scripts; ESLint/CRA defaults.

## Project structure

- `client/` - React UI, axios calls defined in `src/App.js`.
- `server/` - JSON Server setup and seed data in `data.json`.

## Prerequisites

- Node.js 18+ and npm.

## Run locally (dev)

1. Start the API (align with the client base URL `http://localhost:3000` in `client/src/App.js`):

```bash
cd server
npx json-server --watch data.json --port 3001 # keep this port unless you change the client URL
```

2. Start the React app (CRA will pick a free port if 3000 is already used by JSON Server):

```bash
cd client
npm install
npm start
```

3. Open the UI at the port http://localhost:3001 and interact with the tracker.

> If you prefer to run JSON Server on the default 3001, update the `URL` constant in `client/src/App.js` to `http://localhost:3001`.

## API quick reference

- `GET /income`, `POST /income`, `DELETE /income/:id`
- `GET /expense`, `POST /expense`, `DELETE /expense/:id`
- Sample schema (see `server/data.json`):
  ```json
  { "id": 1, "transactionName": "Rent", "amount": 1500, "date": "2024-06-01" }
  ```

## License

Choose a license (MIT is common for demos) before publishing.

# Income & Expense Tracker (React + JSON Server)

Full-stack practice project to track personal income and expenses. The React client consumes a JSON Server API so you can learn and demo a basic end-to-end workflow: UI, data fetching, CRUD, and a lightweight mock backend.

## Tech stack
- **Client:** React 19 (Create React App), Axios.
- **API:** JSON Server 0.17 with `server/data.json` as the data store.
- **Tooling:** npm scripts; ESLint/CRA defaults.

## Project structure
- `client/` - React UI, axios calls in `src/App.js`.
- `server/` - JSON Server setup and seed data in `data.json`.

## Prerequisites
- Node.js 18+ and npm.

## Run locally
1) Start the API (default client base URL is `http://localhost:3000` in `client/src/App.js`):
```bash
cd server
npm install
npm run server -- --port 3000   # keep this port unless you change the client URL
```
2) Start the React app (CRA will choose another port if 3000 is taken):
```bash
cd client
npm install
npm start
```
3) Open the UI at the port CRA prints (e.g., http://localhost:3001) and interact with the tracker.

> If you prefer JSON Server on its default 3001, update the `URL` constant in `client/src/App.js` to `http://localhost:3001`.

## API quick reference
- `GET /income`, `POST /income`, `DELETE /income/:id`
- `GET /expense`, `POST /expense`, `DELETE /expense/:id`
- Sample record (see `server/data.json`):
```json
{ "id": 1, "transactionName": "Rent", "amount": 1500, "date": "2024-06-01" }
```

## Suggested improvements
- Add running totals and simple charts.
- Move API base URL to `REACT_APP_API_URL` env instead of a hardcoded constant.
- Add tests (React Testing Library) and CI (GitHub Actions) for lint/test on PRs.
- Deploy the static build to Vercel/Netlify and host JSON Server (or replace with a real API).

## License
MIT — see `LICENSE`.

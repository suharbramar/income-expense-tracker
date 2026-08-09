import "./App.css";

import { lazy, Suspense } from "react";
import Header from "./components/Header";
import { NavLink, Route, Routes } from "react-router-dom";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

const App = () => {
  return (
    <div className="App">
      <Header name="Income and Expense Tracker" />
      <nav className="app-nav" aria-label="Main Navigation">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
      <Suspense fallback={<p className="page">Loading page...</p>}>
        <Routes>
          <Route path="/" element={<DashboardPage />}></Route>
          <Route path="/transactions" element={<TransactionsPage />}></Route>
          <Route path="/about" element={<AboutPage />}></Route>
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;

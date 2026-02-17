import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormationPage from "./pages/FormationPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormationPage />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from "react";
import Machine from "./components/Machine";
import "./App.css";

function App() {
  return (
    <div className="container">
      <Machine name="Machine 1" id={1} />
      <Machine name="Machine 2" id={2} />
      <Machine name="Machine 3" id={3} />
    </div>
  );
}

export default App;

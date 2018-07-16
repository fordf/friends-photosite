import React from "react";
import { BrowserRouter } from 'react-router-dom';

import "./App.css";

import Main from "./components/Main";

const App = (
  <BrowserRouter>
    <div className="container">
        <Main />
    </div>
  </BrowserRouter>
);

export default App;

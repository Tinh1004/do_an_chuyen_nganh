import { EthProvider } from "./contexts/EthContext";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <EthProvider>
        <div className="container-fluid">
          <div className="card card1 p-2">
            <div className="innercard p-2">
              <Routes>
                <Route path="/" element={<Home />} />
              </Routes>
            </div>
          </div>
        </div>
      </EthProvider>
    </BrowserRouter>
  );
}

export default App;

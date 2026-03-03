import { BrowserRouter } from "react-router-dom";
import { ThemeInit } from "./components/ThemeInit";
import { AppRouter } from "./router";

function App() {
  return (
    <BrowserRouter>
      <ThemeInit />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;

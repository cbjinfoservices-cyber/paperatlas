import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { LangProvider } from "./i18n/LangProvider";
import { AuthProvider } from "./auth/AuthProvider";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <LangProvider>
        <AuthProvider>
          <BrowserRouter basename={__BASE_PATH__}>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LangProvider>
    </I18nextProvider>
  );
}

export default App;
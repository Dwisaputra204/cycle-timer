import React, { useEffect } from "react";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route } from "react-router-dom";
import Cycle from "./pages/Cycle";

/* Core CSS */
import "@ionic/react/css/core.css";
/* Basic CSS */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
/* Optional CSS */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
/* Dark mode */
import "@ionic/react/css/palettes/dark.system.css";
/* Theme variables */
import "./theme/variables.css";

/* Capacitor StatusBar */
import { StatusBar, Style } from "@capacitor/status-bar";

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    const configureStatusBar = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: "#ffffff" });
      } catch (err) {
        console.warn("StatusBar config error:", err);
      }
    };

    configureStatusBar();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/">
            <Cycle />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

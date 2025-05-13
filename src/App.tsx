import React, { useEffect } from "react";
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import { bicycleOutline, ellipse, settingsOutline } from "ionicons/icons";

import Cycle from "./pages/Cycle";
import Config from "./pages/Config";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";

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
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/cycle" component={Cycle} />
            <Route exact path="/config" component={Config} />
            <Redirect exact from="/" to="/cycle" />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="cycle" href="/cycle">
              <IonIcon icon={bicycleOutline} />
              <IonLabel>Cycle</IonLabel>
            </IonTabButton>

            <IonTabButton tab="config" href="/config">
              <IonIcon icon={settingsOutline} />
              <IonLabel>Config</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

const Cycle: React.FC = () => {
  const [loaderTime, setLoaderTime] = useState(0);
  const [haulerTime, setHaulerTime] = useState(0);
  const [isLoaderRunning, setIsLoaderRunning] = useState(false);
  const [isHaulerRunning, setIsHaulerRunning] = useState(false);
  const [loaderIntervalId, setLoaderIntervalId] =
    useState<NodeJS.Timeout | null>(null);
  const [haulerIntervalId, setHaulerIntervalId] =
    useState<NodeJS.Timeout | null>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const [recommendedHauler, setRecommendedHauler] = useState<number | null>(
    null
  );
  const [capacity, setCapacity] = useState(0); // State untuk menyimpan capacity
  const [loading, setLoading] = useState(true);
  const [haulerButtonDisabled, setHaulerButtonDisabled] = useState(false);
  const [selectedHauler, setSelectedHauler] = useState("777"); // Default value
  const [pdtyLoad, setPdtyLoad] = useState<number | null>(null);
  const [pdtyHaul, setPdtyHaul] = useState<number | null>(null);
  const [matchFactor, setMatchFactor] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (loaderIntervalId) clearInterval(loaderIntervalId);
      if (haulerIntervalId) clearInterval(haulerIntervalId);
    };
  }, [loaderIntervalId, haulerIntervalId]);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        // Coba langsung baca file
        const { data } = await Filesystem.readFile({
          path: "config.json",
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        const configData = JSON.parse(typeof data === "string" ? data : "{}");
        const haulerKey = selectedHauler === "777" ? "cap777" : "cap773";
        const capacityValue = parseInt(configData[haulerKey], 10);

        if (!isNaN(capacityValue)) {
          setCapacity(capacityValue);
        } else {
          console.warn("Invalid capacity in config file, using default");
          setCapacity(selectedHauler === "777" ? 41 : 25);
        }
      } catch (error) {
        console.warn("File not found or error reading config:", error);
        setCapacity(selectedHauler === "777" ? 41 : 25);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [selectedHauler]);

  const startLoaderTimer = () => {
    setLoaderTime(0);
    setHaulerTime(0);
    setIsLoaderRunning(true);
    setIsHaulerRunning(true);
    setLoaderIntervalId(
      setInterval(() => {
        setLoaderTime((prevTime) => prevTime + 10);
      }, 10)
    );
    setHaulerIntervalId(
      setInterval(() => {
        setHaulerTime((prevTime) => prevTime + 10);
      }, 10)
    );
    setRatio(null);
    setRecommendedHauler(null);
    setHaulerButtonDisabled(true); // Disable Hauler Start on Loader Start
    setPdtyLoad(null);
    setPdtyHaul(null);
    setMatchFactor(null);
  };

  const stopLoaderTimer = () => {
    setIsLoaderRunning(false);
    if (loaderIntervalId) clearInterval(loaderIntervalId);
    // setHaulerButtonDisabled(false); // Jangan enable di sini
  };

  const resetLoaderTimer = () => {
    setIsLoaderRunning(false);
    if (loaderIntervalId) clearInterval(loaderIntervalId);
    setLoaderTime(0);
    setIsHaulerRunning(false);
    if (haulerIntervalId) clearInterval(haulerIntervalId);
    setHaulerTime(0);
    setRatio(null);
    setRecommendedHauler(null);
    setHaulerButtonDisabled(false); // Enable di sini
    setPdtyLoad(null);
    setPdtyHaul(null);
    setMatchFactor(null);
  };

  const startHaulerTimer = () => {
    setIsHaulerRunning(true);
    setHaulerIntervalId(
      setInterval(() => {
        setHaulerTime((prevTime) => prevTime + 10);
      }, 10)
    );
  };

  const stopHaulerTimer = () => {
    setIsHaulerRunning(false);
    if (haulerIntervalId) clearInterval(haulerIntervalId);
    calculateRatioAndProduction();
    setHaulerButtonDisabled(false); // Enable Hauler button after Hauler Stop
  };

  const resetHaulerTimer = () => {
    setIsHaulerRunning(false);
    if (haulerIntervalId) clearInterval(haulerIntervalId);
    setHaulerTime(0);
    setRatio(null);
    setRecommendedHauler(null);
    setHaulerButtonDisabled(false); // Enable di sini
    setPdtyLoad(null);
    setPdtyHaul(null);
    setMatchFactor(null);
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}:${String(ms).padStart(2, "0")}`;
  };

  const calculateRatioAndProduction = () => {
    const loaderSeconds = Math.floor(loaderTime / 1000);
    const haulerSeconds = Math.floor(haulerTime / 1000);

    if (loaderSeconds > 0 && haulerSeconds > 0) {
      const currentRatio = haulerSeconds / loaderSeconds;
      setRatio(currentRatio);
      setRecommendedHauler(Math.round(currentRatio)); // Use Math.round here

      // Calculate additional values for summary
      const calculatedPdtyLoad = (3600 / loaderSeconds) * capacity;
      const calculatedPdtyHaul = (3600 / haulerSeconds) * capacity;
      const calculatedMatchFactor = recommendedHauler
        ? (recommendedHauler * calculatedPdtyHaul) / calculatedPdtyLoad
        : 0;

      setPdtyLoad(calculatedPdtyLoad);
      setPdtyHaul(calculatedPdtyHaul);
      setMatchFactor(calculatedMatchFactor);
    } else {
      setRatio(null);
      setRecommendedHauler(null);
      setPdtyLoad(null);
      setPdtyHaul(null);
      setMatchFactor(null);
    }
  };

  const handleHaulerChange = (event: any) => {
    setSelectedHauler(event.target.value);
  };

  useEffect(() => {
    calculateRatioAndProduction();
  }, [capacity, loaderTime, haulerTime, recommendedHauler]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cycle Counter</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <IonText>Loading configuration...</IonText>
        ) : (
          <>
            <div>
              <IonText>
                <h1>{formatTime(loaderTime)}</h1>
              </IonText>
              {!isLoaderRunning ? (
                <IonButton expand="block" onClick={startLoaderTimer}>
                  Mulai Loader
                </IonButton>
              ) : (
                <IonButton
                  expand="block"
                  color="warning"
                  onClick={stopLoaderTimer}
                >
                  Stop Loader
                </IonButton>
              )}
              <IonButton
                expand="block"
                color="danger"
                onClick={resetLoaderTimer}
              >
                Reset Loader
              </IonButton>
            </div>

            <IonGrid>
              <IonRow>
                <IonCol size="8">
                  <IonText>
                    <h1>{formatTime(haulerTime)}</h1>
                  </IonText>
                </IonCol>
                <IonCol size="4" className="ion-align-self-center">
                  <IonSelect
                    value={selectedHauler}
                    onIonChange={handleHaulerChange}
                    interface="popover"
                  >
                    <IonSelectOption value="777">777</IonSelectOption>
                    <IonSelectOption value="773">773</IonSelectOption>
                  </IonSelect>
                </IonCol>
              </IonRow>
            </IonGrid>
            <IonButton
              expand="block"
              onClick={startHaulerTimer}
              disabled={isLoaderRunning || haulerButtonDisabled}
            >
              Mulai Hauler
            </IonButton>
            {!isHaulerRunning ? null : (
              <IonButton
                expand="block"
                color="warning"
                onClick={stopHaulerTimer}
              >
                Stop Hauler
              </IonButton>
            )}
            <IonButton expand="block" color="danger" onClick={resetHaulerTimer}>
              Reset Hauler
            </IonButton>

            {/* Summary Section */}
            {pdtyLoad !== null && pdtyHaul !== null && matchFactor !== null && (
              <IonCard className="ion-margin-top">
                <IonCardContent>
                  <IonGrid>
                    {[
                      { label: "Hauler", value: recommendedHauler },
                      {
                        label: "PDTY Loader",
                        value: `${pdtyLoad.toFixed(2)} ton/jam`,
                      },
                      {
                        label: "PDTY Hauler",
                        value: `${pdtyHaul.toFixed(2)} ton/jam`,
                      },
                      { label: "Match Factor", value: matchFactor.toFixed(2) },
                    ].map((item, index) => (
                      <IonRow key={index} className="ion-align-items-center">
                        <IonCol size="6" className="ion-text-wrap">
                          <IonText color="medium">
                            <strong>{item.label}</strong>
                          </IonText>
                        </IonCol>
                        <IonCol size="6">
                          <IonText color="dark">{item.value}</IonText>
                        </IonCol>
                      </IonRow>
                    ))}
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Cycle;

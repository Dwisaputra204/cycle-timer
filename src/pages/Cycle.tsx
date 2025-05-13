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

interface MaterialData {
  name: string;
  val777: number;
  val773: number;
}

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
  const [capacity, setCapacity] = useState(0);
  const [haulerButtonDisabled, setHaulerButtonDisabled] = useState(false);
  const [selectedHauler, setSelectedHauler] = useState("777");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [pdtyLoad, setPdtyLoad] = useState<number | null>(null);
  const [pdtyHaul, setPdtyHaul] = useState<number | null>(null);
  const [matchFactor, setMatchFactor] = useState<number | null>(null);
  const [materialData, setMaterialData] = useState<MaterialData[]>([]);

  // Mengambil nilai selectedMaterial dari localStorage saat komponen dimuat
  useEffect(() => {
    const savedMaterial = localStorage.getItem("selectedMaterial");
    if (savedMaterial) {
      setSelectedMaterial(savedMaterial);
    }

    // Mengambil data material dari localStorage saat komponen dimuat
    loadMaterialData();
  }, []);

  const loadMaterialData = () => {
    const storedMaterials = localStorage.getItem("materials");
    if (storedMaterials) {
      setMaterialData(JSON.parse(storedMaterials));
    }
  };

  useEffect(() => {
    return () => {
      if (loaderIntervalId) clearInterval(loaderIntervalId);
      if (haulerIntervalId) clearInterval(haulerIntervalId);
    };
  }, [loaderIntervalId, haulerIntervalId]);

  // Efek untuk memperbarui kapasitas setiap kali selectedHauler atau selectedMaterial berubah
  useEffect(() => {
    console.log("useEffect - Pembaruan Kapasitas:", {
      selectedHauler,
      selectedMaterial,
      materialData,
    });
    if (selectedHauler && selectedMaterial && materialData.length > 0) {
      const foundMaterial = materialData.find(
        (material) => material.name === selectedMaterial
      );
      console.log("Material Ditemukan:", foundMaterial);
      if (foundMaterial) {
        const newCapacity =
          selectedHauler === "777"
            ? foundMaterial.val777
            : foundMaterial.val773;
        setCapacity(newCapacity);
        console.log("Kapasitas Diatur:", newCapacity);
      } else {
        console.warn("Material tidak ditemukan:", selectedMaterial);
        setCapacity(selectedHauler === "777" ? 41 : 25); // Nilai default
        console.log("Kapasitas Diatur (Default):", capacity);
      }
    }
  }, [selectedHauler, selectedMaterial, materialData]);

  const startLoaderTimer = () => {
    // Muat ulang data material dari localStorage setiap kali timer loader dimulai
    loadMaterialData();
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
    setHaulerButtonDisabled(true);
    setPdtyLoad(null);
    setPdtyHaul(null);
    setMatchFactor(null);
  };

  const stopLoaderTimer = () => {
    setIsLoaderRunning(false);
    if (loaderIntervalId) clearInterval(loaderIntervalId);
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
    setHaulerButtonDisabled(false);
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
    setHaulerButtonDisabled(false);
  };

  const resetHaulerTimer = () => {
    setIsHaulerRunning(false);
    if (haulerIntervalId) clearInterval(haulerIntervalId);
    setHaulerTime(0);
    setRatio(null);
    setRecommendedHauler(null);
    setHaulerButtonDisabled(false);
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
      setRecommendedHauler(Math.round(currentRatio));

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

  const handleMaterialChange = (event: any) => {
    const newValue = event.target.value;
    setSelectedMaterial(newValue);
    localStorage.setItem("selectedMaterial", newValue); // Simpan perubahan material
    console.log("handleMaterialChange - selectedMaterial:", newValue);
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
        <IonGrid>
          <IonRow>
            <IonCol size="4">
              <IonSelect
                value={selectedHauler}
                onIonChange={handleHaulerChange}
                interface="popover"
              >
                <IonSelectOption value="777">777</IonSelectOption>
                <IonSelectOption value="773">773</IonSelectOption>
              </IonSelect>
            </IonCol>
            <IonCol size="8">
              <IonSelect
                value={selectedMaterial}
                onIonChange={handleMaterialChange}
                interface="popover"
              >
                {materialData.map((material) => (
                  <IonSelectOption key={material.name} value={material.name}>
                    {material.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Loader Timer Section */}
        <div>
          <IonText>
            <h1>{formatTime(loaderTime)}</h1>
          </IonText>
          {!isLoaderRunning ? (
            <IonButton expand="block" onClick={startLoaderTimer}>
              Mulai Loader
            </IonButton>
          ) : (
            <IonButton expand="block" color="warning" onClick={stopLoaderTimer}>
              Stop Loader
            </IonButton>
          )}
          <IonButton expand="block" color="danger" onClick={resetLoaderTimer}>
            Reset Loader
          </IonButton>
        </div>

        {/* Hauler Timer Section */}
        <IonGrid>
          <IonRow>
            <IonCol size="8">
              <IonText>
                <h1>{formatTime(haulerTime)}</h1>
              </IonText>
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
          <IonButton expand="block" color="warning" onClick={stopHaulerTimer}>
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
                  { label: "PDTY Loader", value: `${pdtyLoad.toFixed(2)}` },
                  { label: "PDTY Hauler", value: `${pdtyHaul.toFixed(2)}` },
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
      </IonContent>
    </IonPage>
  );
};

export default Cycle;

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
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
} from "@ionic/react";
import React, { useState, useEffect, useCallback } from "react";
import { useHistory, useLocation } from "react-router";

interface MaterialData {
  name: string;
  val777: number;
  val773: number;
}

const Cycle: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  // State timer dan interval
  const [loaderTime, setLoaderTime] = useState(0);
  const [haulerTime, setHaulerTime] = useState(0);
  const [isLoaderRunning, setIsLoaderRunning] = useState(false);
  const [isHaulerRunning, setIsHaulerRunning] = useState(false);
  const [loaderIntervalId, setLoaderIntervalId] =
    useState<NodeJS.Timeout | null>(null);
  const [haulerIntervalId, setHaulerIntervalId] =
    useState<NodeJS.Timeout | null>(null);

  // State lain (capacity, material, dll)
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
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [showLoading, setShowLoading] = useState(false);

  // Fungsi load material data
  const loadMaterialData = useCallback(async () => {
    setShowLoading(true);
    setLoadingMaterials(true);
    const storedMaterials = localStorage.getItem("materials");
    if (storedMaterials) {
      setMaterialData(JSON.parse(storedMaterials));
    } else {
      setMaterialData([]);
    }
    setLoadingMaterials(false);
    setShowLoading(false);
  }, []);

  // Fungsi format waktu
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

  // Fungsi mulai timer loader dan hauler bersamaan
  const startLoaderTimer = () => {
    const startTimestamp = Date.now();
    localStorage.setItem("loaderStartTime", startTimestamp.toString());
    localStorage.setItem("loaderRunning", "true");

    setIsLoaderRunning(true);
    setLoaderTime(0);

    if (loaderIntervalId) clearInterval(loaderIntervalId);

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTimestamp;
      setLoaderTime(elapsed);
    }, 10);
    setLoaderIntervalId(intervalId);

    // Mulai juga timer hauler secara otomatis
    startHaulerTimer();

    // Reset hasil perhitungan dan state terkait
    setRatio(null);
    setRecommendedHauler(null);
    setHaulerButtonDisabled(true);
    setPdtyLoad(null);
    setPdtyHaul(null);
    setMatchFactor(null);
  };

  // Fungsi stop timer loader
  const stopLoaderTimer = () => {
    setIsLoaderRunning(false);
    localStorage.setItem("loaderRunning", "false");
    if (loaderIntervalId) clearInterval(loaderIntervalId);
  };

  // Fungsi reset timer loader
  const resetLoaderTimer = () => {
    setIsLoaderRunning(false);
    localStorage.removeItem("loaderStartTime");
    localStorage.setItem("loaderRunning", "false");
    if (loaderIntervalId) clearInterval(loaderIntervalId);
    setLoaderTime(0);

    resetHaulerTimer();

    setRatio(null);
    setRecommendedHauler(null);
    setHaulerButtonDisabled(false);
    setPdtyLoad(null);
    setPdtyHaul(null);
    setMatchFactor(null);
  };

  // Fungsi mulai timer hauler
  const startHaulerTimer = () => {
    const startTimestamp = Date.now();
    localStorage.setItem("haulerStartTime", startTimestamp.toString());
    localStorage.setItem("haulerRunning", "true");

    setIsHaulerRunning(true);
    setHaulerTime(0);

    if (haulerIntervalId) clearInterval(haulerIntervalId);

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTimestamp;
      setHaulerTime(elapsed);
    }, 10);
    setHaulerIntervalId(intervalId);
  };

  // Fungsi stop timer hauler
  const stopHaulerTimer = () => {
    setIsHaulerRunning(false);
    localStorage.setItem("haulerRunning", "false");
    if (haulerIntervalId) clearInterval(haulerIntervalId);
    calculateRatioAndProduction();
    setHaulerButtonDisabled(false);
  };

  // Fungsi reset timer hauler
  const resetHaulerTimer = () => {
    setIsHaulerRunning(false);
    localStorage.removeItem("haulerStartTime");
    localStorage.setItem("haulerRunning", "false");
    if (haulerIntervalId) clearInterval(haulerIntervalId);
    setHaulerTime(0);
    setRatio(null);
    setRecommendedHauler(null);
    setHaulerButtonDisabled(false);
    setPdtyLoad(null);
    setPdtyHaul(null);
    setMatchFactor(null);
  };

  // Fungsi hitung rasio dan produksi
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

  // Handle perubahan hauler dan material
  const handleHaulerChange = (event: any) => {
    setSelectedHauler(event.target.value);
  };

  const handleMaterialChange = (event: any) => {
    const newValue = event.target.value;
    setSelectedMaterial(newValue);
    localStorage.setItem("selectedMaterial", newValue);
  };

  // Navigasi ke halaman konfigurasi
  const goToConfig = () => {
    history.push("/config");
  };

  // Load material data dan selected material saat mount dan saat tab Cycle diakses
  useEffect(() => {
    const savedMaterial = localStorage.getItem("selectedMaterial");
    if (savedMaterial) {
      setSelectedMaterial(savedMaterial);
    }
    if (location.pathname === "/cycle") {
      loadMaterialData();
    }
  }, [location.pathname, loadMaterialData]);

  // Load dan lanjutkan timer dari localStorage saat mount
  useEffect(() => {
    // Loader timer
    const loaderStartStr = localStorage.getItem("loaderStartTime");
    const loaderRunningStr = localStorage.getItem("loaderRunning");
    if (loaderStartStr && loaderRunningStr === "true") {
      const loaderStart = parseInt(loaderStartStr, 10);
      const elapsed = Date.now() - loaderStart;
      setLoaderTime(elapsed);
      setIsLoaderRunning(true);

      if (loaderIntervalId) clearInterval(loaderIntervalId);
      const intervalId = setInterval(() => {
        setLoaderTime(Date.now() - loaderStart);
      }, 10);
      setLoaderIntervalId(intervalId);
    }

    // Hauler timer
    const haulerStartStr = localStorage.getItem("haulerStartTime");
    const haulerRunningStr = localStorage.getItem("haulerRunning");
    if (haulerStartStr && haulerRunningStr === "true") {
      const haulerStart = parseInt(haulerStartStr, 10);
      const elapsed = Date.now() - haulerStart;
      setHaulerTime(elapsed);
      setIsHaulerRunning(true);

      if (haulerIntervalId) clearInterval(haulerIntervalId);
      const intervalId = setInterval(() => {
        setHaulerTime(Date.now() - haulerStart);
      }, 10);
      setHaulerIntervalId(intervalId);
    }

    // Bersihkan interval saat unmount
    return () => {
      if (loaderIntervalId) clearInterval(loaderIntervalId);
      if (haulerIntervalId) clearInterval(haulerIntervalId);
    };
  }, []);

  // Update capacity saat hauler atau material berubah
  useEffect(() => {
    if (selectedHauler && selectedMaterial && materialData.length > 0) {
      const foundMaterial = materialData.find(
        (material) => material.name === selectedMaterial
      );
      if (foundMaterial) {
        const newCapacity =
          selectedHauler === "777"
            ? foundMaterial.val777
            : foundMaterial.val773;
        setCapacity(newCapacity);
      } else {
        setCapacity(selectedHauler === "777" ? 41 : 25);
      }
    } else {
      setCapacity(0);
    }
  }, [selectedHauler, selectedMaterial, materialData]);

  // Hitung rasio dan produksi saat waktu atau kapasitas berubah
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
        <IonLoading
          isOpen={showLoading}
          message="Memuat data..."
          duration={0}
        />
        {loadingMaterials ? (
          <IonText>Memuat konfigurasi...</IonText>
        ) : materialData.length === 0 ? (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Konfigurasi Dibutuhkan</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                Data material belum dikonfigurasi. Silakan atur konfigurasi
                terlebih dahulu di halaman Konfigurasi.
              </IonText>
              <IonButton
                expand="block"
                className="ion-margin-top"
                onClick={goToConfig}
              >
                Pergi ke Konfigurasi
              </IonButton>
            </IonCardContent>
          </IonCard>
        ) : (
          <>
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
                      <IonSelectOption
                        key={material.name}
                        value={material.name}
                      >
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
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Cycle;

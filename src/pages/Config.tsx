import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonButton,
  IonToast,
  IonLabel,
} from "@ionic/react";

interface MaterialData {
  name: string;
  val777: number;
  val773: number;
}

const initialData: MaterialData[] = [
  { name: "MUD CAIR", val777: 25, val773: 17 },
  { name: "MUD PADAT", val777: 25, val773: 17 },
  { name: "OVERBURDEN - BLASTING", val777: 41, val773: 25 },
  { name: "OVERBURDEN - FREEDIG", val777: 41, val773: 25 },
  { name: "OVERBURDEN - RIPPING", val777: 41, val773: 25 },
  { name: "TOP SOIL - FREEDIG", val777: 41, val773: 25 },
];

const Config: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialData[]>(initialData);
  const [showToast, setShowToast] = useState(false);

  // Load saved materials from localStorage on component mount
  useEffect(() => {
    const savedMaterials = localStorage.getItem("materials");
    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    }
  }, []);

  // Save the updated materials to localStorage every time the material data changes
  const saveToLocalStorage = (updatedMaterials: MaterialData[]) => {
    localStorage.setItem("materials", JSON.stringify(updatedMaterials));
  };

  // Update material value and save to localStorage immediately
  const handleInputChange = (
    index: number,
    field: "val777" | "val773",
    value: string
  ) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index][field] = parseFloat(value) || 0;
    setMaterials(updatedMaterials);
    saveToLocalStorage(updatedMaterials); // Directly save to localStorage on input change
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveToLocalStorage(materials); // Save to localStorage when the user clicks the save button
    setShowToast(true); // Show the success toast
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Konfigurasi Material</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <form onSubmit={handleSave}>
          <IonGrid>
            <IonRow className="ion-align-items-center ion-padding-vertical">
              <IonCol size="6" className="ion-text-start">
                <IonLabel>
                  <strong>Material</strong>
                </IonLabel>
              </IonCol>
              <IonCol size="3" className="ion-text-center">
                <IonLabel>
                  <strong>777</strong>
                </IonLabel>
              </IonCol>
              <IonCol size="3" className="ion-text-center">
                <IonLabel>
                  <strong>773</strong>
                </IonLabel>
              </IonCol>
            </IonRow>

            {materials.map((item, idx) => (
              <IonRow
                key={idx}
                className="ion-align-items-center ion-padding-vertical"
              >
                <IonCol size="6" className="ion-text-start">
                  <IonLabel>{item.name}</IonLabel>
                </IonCol>

                <IonCol size="3" className="ion-text-center">
                  <IonInput
                    type="number"
                    value={item.val777}
                    onIonChange={(e) =>
                      handleInputChange(idx, "val777", e.detail.value!)
                    }
                    inputmode="numeric"
                    style={{ textAlign: "center" }}
                  />
                </IonCol>

                <IonCol size="3" className="ion-text-center">
                  <IonInput
                    type="number"
                    value={item.val773}
                    onIonChange={(e) =>
                      handleInputChange(idx, "val773", e.detail.value!)
                    }
                    inputmode="numeric"
                    style={{ textAlign: "center" }}
                  />
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>

          <IonButton expand="block" type="submit" className="ion-margin-top">
            Simpan Konfigurasi
          </IonButton>
        </form>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Data konfigurasi disimpan!"
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Config;

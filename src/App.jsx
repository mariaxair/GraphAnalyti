import Matrice from "./components/matrice";
import React, { useState, useRef } from "react";
import "./App.css";
import GMA from "./components/GMA";
import LandingPage from "./components/landingPage";
import { motion } from "framer-motion";
import useDarkMode from "@fisch0920/use-dark-mode";
import { DarkModeToggle } from "react-dark-mode-toggle-2";
import { FileUpload } from "primereact/fileupload";
import { ConfirmDialog } from "primereact/confirmdialog"; // For <ConfirmDialog /> component
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast"; // For <Toast /> component
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";

import "primeicons/primeicons.css";

export default function Home() {
  const [landing, setLanding] = useState(true);
  const darkMode = useDarkMode(false, { classNameDark: "dark" });
  const toast = useRef(null);

  //exemples of petri net
  const ex1 = {
    pre: [
      [2, 1, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0, 0, 1],
    ],
    post: [
      [0, 0, 3],
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0],
    ],
    M0: [[5], [1], [0], [0]],
  };
  const ex2 = {
    pre: [[1, 0]],
    post: [[0, 1]],
    M0: [[2]],
  };
  const ex3 = {
    pre: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    post: [
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0],
    ],
    M0: [[1], [1], [1]],
  };

  const items = [
    {
      label: "Example 1 ",
      icon: "pi pi-file-export",
      command: () => {
        setReset(0);
        setGma(0);
        setLines(ex1.pre.length);
        setColumns(ex1.pre[0].length);
        //
        localStorage.setItem("pre", JSON.stringify(ex1.pre));
        localStorage.setItem("post", JSON.stringify(ex1.post));
        localStorage.setItem("M0", JSON.stringify(ex1.M0));
        setUploaded((prev) => prev + 1);
      },
    },
    {
      label: "Example 2 ~non-borné~",
      icon: "pi pi-file-export",
      command: () => {
        setReset(0);
        setGma(0);
        setLines(ex2.pre.length);
        setColumns(ex2.pre[0].length);
        //
        localStorage.setItem("pre", JSON.stringify(ex2.pre));
        localStorage.setItem("post", JSON.stringify(ex2.post));
        localStorage.setItem("M0", JSON.stringify(ex2.M0));
        setUploaded((prev) => prev + 1);
      },
    },
    {
      label: "Example 3 ~borné~",
      icon: "pi pi-file-export",
      command: () => {
        setReset(0);
        setGma(0);
        setLines(ex3.pre.length);
        setColumns(ex3.pre[0].length);
        //
        localStorage.setItem("pre", JSON.stringify(ex3.pre));
        localStorage.setItem("post", JSON.stringify(ex3.post));
        localStorage.setItem("M0", JSON.stringify(ex3.M0));
        setUploaded((prev) => prev + 1);
      },
    },
  ];

  //**************************** */

  const accept = () => {
    resetData();
    toast.current.show({
      severity: "success",
      summary: "Réinitialisation éffectuée",
      detail: "vous venez de réinitialiser les données des matrices",
      life: 3000,
    });
  };

  const reject = () => {
    toast.current.show({
      severity: "info",
      summary: "Réinitialisation annulée",
      detail: "vous avez annulé la réinitialisation des données des matrices",
      life: 3000,
    });
  };

  const confirm2 = () => {
    confirmDialog({
      message: "Voulez-vous réinitialiser les données des matrices ?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept,
      reject,
    });
  };

  const matrixEmpty = () => {
    confirmDialog({
      message: "veuillez remplir les matrices",
      header: "Attention",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
    });
  };
  const [lines, setLines] = useState(
    localStorage.getItem("pre")
      ? JSON.parse(localStorage.getItem("pre")).length
      : 1
  );

  const [columns, setColumns] = useState(
    localStorage.getItem("pre")
      ? JSON.parse(localStorage.getItem("pre"))[0].length
      : 1
  );

  const [gma, setGma] = useState(0);
  const [reset, setReset] = useState(0);

  const fileUploadOptions = {
    className: "p-button-outlined",
    icon: "pi pi-cloud-upload",
  };

  const fileUploadRef = useRef(null);

  const [uploaded, setUploaded] = useState(0);

  const handleUpload = (event) => {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      isValide(data);
    };
    reader.readAsText(file);
    setReset(0);
  };

  function isValide(data) {
    setGma(0); //reset the clicked button to 0 (to avoid the bug of the graph)

    if (
      //check if data contains pre, post and M0
      data.hasOwnProperty("pre") &&
      data.hasOwnProperty("post") &&
      data.hasOwnProperty("M0") &&
      data.pre.length === data.post.length &&
      data.pre[0].length === data.post[0].length &&
      data.pre.length === data.M0.length &&
      // check if values are numbers
      data.pre.every((row) => row.every((value) => !isNaN(value))) &&
      data.post.every((row) => row.every((value) => !isNaN(value))) &&
      data.M0.every((row) => row.every((value) => !isNaN(value)))
    ) {
      setLines(data.pre.length);
      setColumns(data.pre[0].length);
      localStorage.setItem("pre", JSON.stringify(data.pre));
      localStorage.setItem("post", JSON.stringify(data.post));
      localStorage.setItem("M0", JSON.stringify(data.M0));
      setUploaded((prev) => prev + 1);
    } else {
      alert("Fichier non valide");
    }
  }

  function downloadJSON() {
    const data = {
      pre: JSON.parse(localStorage.getItem("pre")),
      post: JSON.parse(localStorage.getItem("post")),
      M0: JSON.parse(localStorage.getItem("M0")),
    };
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download =
      "graphanalyt_" +
      new Date().toLocaleTimeString() +
      "_" +
      new Date().toLocaleDateString() +
      ".json";

    link.click();
  }

  function handleKeyDown(event) {
    if (event.key === "Backspace") {
      event.preventDefault();
      event.target.value = "1";
      event.target.select();
      if (event.target.id === "lig") {
        setLines(1);
      } else {
        setColumns(1);
      }
    }
  }
  function handleInputChange(event) {
    let value = parseInt(event.target.value);
    if (isNaN(value)) {
      value = 1;
    } else if (value < 1) {
      value = 1;
    } else if (value > 100) {
      value = 100;
    }
    event.target.value = value;
  }

  function resetData() {
    setLines(1);
    setColumns(1);

    setReset(reset + 1);
    setGma(false);
  }

  const [visible, setVisible] = useState(false);
  const [analyseProps, setAnalyseProps] = useState([]);

  const onAnalysePropsChange = (e) => {
    let _analyseProps = [...analyseProps];

    if (e.checked) _analyseProps.push(e.value);
    else _analyseProps.splice(_analyseProps.indexOf(e.value), 1);

    setAnalyseProps(_analyseProps);
  };

  if (landing) {
    return (
      <div className="flex flex-col h-screen">
        <nav>
          <DarkModeToggle
            id="darkModeToggle"
            onChange={darkMode.toggle}
            isDarkMode={darkMode.value}
            className="float-right mt-[2%] mr-[2%]"
            size={50}
          />
        </nav>
        <div className="flex-grow">
          <LandingPage onClick={() => setLanding(false)} />
        </div>
      </div>
    );
  }
  document.getElementsByTagName("body")[0].style.overflow = "auto";
  return (
    <motion.div
      className="flex items-center justify-center flex-col m-0 font-myFont"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <SpeedDial
        model={items}
        type="linear"
        direction="down"
        showIcon="pi pi-question"
        hideIcon="pi pi-times"
        transitionDelay={80}
        style={{ left: 0, top: 0, position: "fixed", margin: "10px" }}
        buttonStyle={{ width: "40px", height: "40px" }}
        buttonClassName="p-button-outlined"
        className="speeddial"
      />
      <Tooltip target=".speeddial .p-speeddial-action" position="right" />

      <div className="flex mt-[1%] mr-[2%] self-end">
        <DarkModeToggle
          id="darkModeToggle"
          onChange={darkMode.toggle}
          isDarkMode={darkMode.value}
          className="float-right mt-[2%] mr-[2%] "
          size={50}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2  gap-10 gap-y-5">
        <div className="bg-lightDivInput dark:bg-darkDivInput flex flex-col justify-center items-center rounded-[10px] pb-1 shadow-lg gap-1 dark:shadow-gray-700">
          <label
            htmlFor="lig"
            className="md:max-content text-[#484848] dark:text-[#F3F1F1] font-bold "
          >
            Nombre de places:
          </label>
          <input
            id="lig"
            type="number"
            onChange={(e) => {
              handleInputChange(e);
              setLines(e.target.value);
            }}
            placeholder="3"
            onKeyDown={handleKeyDown}
            value={lines}
            className="w-12 py-2 text-center text-[#484848] rounded-[10px]"
          />
        </div>

        <div className="bg-lightDivInput dark:bg-darkDivInput flex flex-col justify-center items-center shadow-lg rounded-[10px] p-2 gap-1 dark:shadow-gray-700">
          <label
            htmlFor="col"
            className="md:max-content text-[#484848] dark:text-[#F3F1F1] font-bold"
          >
            Nombre de transitions:
          </label>
          <input
            id="col"
            type="number"
            onChange={(e) => {
              handleInputChange(e);
              setColumns(e.target.value);
            }}
            placeholder="3"
            onKeyDown={handleKeyDown}
            value={columns}
            className="w-12 py-2 text-center text-[#484848] rounded-[10px]"
          />
        </div>
      </div>
      <div className="flex flex-wrap rounded-[30px] px-2 py-3 m-8 gap-10">
        <div className="bg-lightDiv dark:bg-darkDiv flex flex-col justify-center items-center rounded-[20px] p-2 shadow-lg dark:shadow-gray-700">
          <h3 className="text-[#484848] dark:text-[#F3F1F1] font-bold">
            Matrice Pré
          </h3>
          <Matrice
            lines={lines}
            columns={columns}
            name="pre"
            reset={reset}
            key={uploaded}
          />
        </div>

        <div className="bg-lightDiv dark:bg-darkDiv flex flex-col justify-center items-center rounded-[20px] p-2 shadow-lg dark:shadow-gray-700">
          <h3 className="text-[#484848] dark:text-[#F3F1F1] font-bold">
            Matrice Post
          </h3>
          <Matrice
            lines={lines}
            columns={columns}
            name="post"
            reset={reset}
            key={uploaded}
          />
        </div>

        <div className="bg-lightDiv dark:bg-darkDiv   flex flex-col justify-center items-center rounded-[20px] shadow-lg p-3 dark:shadow-gray-700">
          <h3 className="text-[#484848] dark:text-[#F3F1F1] font-bold">
            Marquage Initial
          </h3>
          <Matrice
            lines={lines}
            columns={1}
            name="M0"
            reset={reset}
            key={uploaded}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center items-center ">
        <Toast ref={toast} />
        <ConfirmDialog />

        <Button
          className="p-button-success"
          icon="pi pi-check"
          label="Générer le GMA et l'Analyse"
          outlined
          onClick={async () => {
            if (
              localStorage.getItem("pre") &&
              localStorage.getItem("post") &&
              localStorage.getItem("M0")
            ) {
            setVisible(true);}
            else {
              toast.current.show({
                severity: "error",
                summary: "Erreur",
                detail: "Veuillez remplir toutes les matrices",
                life: 3000,
              });
            }
          }}
        ></Button>
        <Dialog
          header="Choisissez les propriétés à afficher: "
          visible={visible}
          style={{ width: "50vw" }}
          onHide={() => setVisible(false)}
        >
          <div className="flex flex-col justify-center ">
            <div className="mx-5 my-1 flex gap-3 ">
              <Checkbox
                inputId="p1"
                name="p1"
                value="Bornitude"
                onChange={onAnalysePropsChange}
                checked={analyseProps.includes("Bornitude")}
              />
              <label htmlFor="p1" className="p-checkbox-label">
                Bornitude
              </label>
            </div>
            <div className="mx-5 my-1 flex gap-3 ">
              <Checkbox
                inputId="p2"
                name="p2"
                value="Binaire"
                onChange={onAnalysePropsChange}
                checked={analyseProps.includes("Binaire")}
              />
              <label htmlFor="p2" className="p-checkbox-label">
                Binaire
              </label>
            </div>
            <div className="mx-5 my-1 flex gap-3 ">
              <Checkbox
                inputId="p3"
                name="p3"
                value="Conservatif"
                onChange={onAnalysePropsChange}
                checked={analyseProps.includes("Conservatif")}
              />
              <label htmlFor="p3" className="p-checkbox-label">
                Conservatif
              </label>
            </div>
            <div className="mx-5 my-1 flex gap-3 ">
              <Checkbox
                inputId="p4"
                name="p4"
                value="quasiVive"
                onChange={onAnalysePropsChange}
                checked={analyseProps.includes("quasiVive")}
              />
              <label htmlFor="p4" className="p-checkbox-label">
                Quasi Vivacité
              </label>
            </div>
            <div className="mx-5 my-1 flex gap-3 ">
              <Checkbox
                inputId="p5"
                name="p5"
                value="pseudoVive"
                onChange={onAnalysePropsChange}
                checked={analyseProps.includes("pseudoVive")}
              />
              <label htmlFor="p5" className="p-checkbox-label">
                Pseudo Vivacité
              </label>
            </div>
            <div className="mx-5 my-1 flex gap-3 ">
              <Checkbox
                inputId="p6"
                name="p6"
                value="vivacite"
                onChange={onAnalysePropsChange}
                checked={analyseProps.includes("vivacite")}
              />
              <label htmlFor="p6" className="p-checkbox-label">
                Vivacité
              </label>
            </div>
            <div className="mx-5 my-1 flex gap-3 ">
              <Checkbox
                inputId="p7"
                name="p7"
                value="rénialisabilité"
                onChange={onAnalysePropsChange}
                checked={analyseProps.includes("rénialisabilité")}
              />
              <label htmlFor="p7" className="p-checkbox-label">
                Rénialisabilité
              </label>
            </div>
            <div className="mx-5 my-1 flex gap-3 ">
              <Checkbox
                inputId="p8"
                name="p8"
                value="bloquage"
                onChange={onAnalysePropsChange}
                checked={analyseProps.includes("bloquage")}
              />
              <label htmlFor="p8" className="p-checkbox-label">
                Bloquage
              </label>
            </div>
            <div className="mx-5 my-1 flex gap-3 ">
              <Checkbox
                inputId="p9"
                name="p9"
                value="accueil"
                onChange={onAnalysePropsChange}
                checked={analyseProps.includes("accueil")}
              />
              <label htmlFor="p9" className="p-checkbox-label">
                Etats d'accueil
              </label>
            </div>
          </div>
          <Button
            className="p-button-success mx-5 my-2"
            icon="pi pi-check"
            label="Générer"
            outlined
            onClick={async () => {
              toast.current.show({
                severity: "success",
                summary: "GMA et analyse générés avec succès",
                detail: "Vous pouvez les télécharger",
                life: 3000,
              });

              setVisible(false);
              setGma(gma + 1);
              await setGma(gma + 1);
              document;
              // .getElementById("myGMA")
              // .scrollIntoView({ behavior: "smooth" });
            }}
          ></Button>
          <Button
            className="p-button-danger mx-5 my-2"
            icon="pi pi-times"
            label="Annuler"
            outlined
            onClick={() => {
              toast.current.show({
                severity: "info",
                summary: "GMA non généré",
                detail: "Vous pouvez le générer à nouveau",
                life: 3000,
              });
              setVisible(false);
            }}
          ></Button>
          <Button
            className="p-button-primary mx-5 my-2 float-right"
            icon="pi pi-check"
            label="Séléctionner toutes les propriétés"
            outlined
            onClick={async () => {
              toast.current.show({
                severity: "success",
                summary: "GMA et analyse générés avec succès",
                detail: "Vous pouvez les télécharger",
                life: 3000,
              });

              setVisible(false);
              setAnalyseProps([
                "Bornitude",
                "Binaire",
                "Conservatif",
                "quasiVive",
                "pseudoVive",
                "vivacite",
                "rénialisabilité",
                "bloquage",
                "accueil",
              ]);
              setGma(gma + 1);

              document
                .getElementById("myGMA")
                .scrollIntoView({ behavior: "smooth" });
            }}
          ></Button>
        </Dialog>
        <Button
          className="p-button-danger"
          icon="pi pi-times"
          label="Réinitialiser"
          outlined
          onClick={confirm2}
        ></Button>
        <Button
          className="p-button-primary"
          icon="pi pi-cloud-download"
          label="Sauvegarder les matrices"
          outlined
          onClick={() => {
            downloadJSON();
          }}
        ></Button>
        <FileUpload
          chooseOptions={fileUploadOptions}
          name="myfile"
          accept=".json"
          mode="basic"
          maxFileSize={1000000}
          onSelect={handleUpload}
          uploadHandler={() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                fileUploadRef.current.setFiles([]);
                resolve();
              }, 0);
            });
          }}
          ref={fileUploadRef}
          customUpload={true}
          chooseLabel="Importer"
        />
      </div>
      <span id="myGMA"></span>
      {gma > 0 && (
        <GMA
          key={gma}
          pre={JSON.parse(localStorage.getItem("pre"))}
          post={JSON.parse(localStorage.getItem("post"))}
          M0={JSON.parse(localStorage.getItem("M0"))}
          analyseProps={analyseProps}
        />
      )}

      {gma > 0 && (
        <Button
          className="p-button-primary"
          icon="pi pi-cloud-download"
          label="Télécharger les résultats"
          outlined
          onClick={() => {
            print();
          }}
        ></Button>
      )}
      <h1 id="Msg" className="text-red-700 font-extrabold text-[20px]">
        Pour avoir le GMA correspondant veuillez consulter l'application
      </h1>
    </motion.div>
  );
}

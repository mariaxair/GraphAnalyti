import React, { useEffect, useRef, useCallback } from "react";
import { create, all } from "mathjs";
import ReactFlow, {
  ControlButton,
  Controls,
  MiniMap,
  Background,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { SmartBezierEdge } from "@tisoap/react-flow-smart-edge";
import dagre from "dagre";
import { Toast } from "primereact/toast"; // For <Toast /> component
import {
  Conservatif,
  Binaire,
  QuasiVivant,
  PseudoVivant,
  Reinitialisable,
  Vivant,
  getFathers,
  getFathersM0,
  getMaxValue,
  matrixIntersection,
  isEtatAccueil,
} from "./analyse";
import { toJpeg } from "html-to-image";

const config = {};
const math = create(all, config);

export default function GMA({ M0, pre, post, analyseProps }) {
  const gma = { marquages: [], transitions: [], infiniteMarquages: [] }; // array de marquages et array de trasitions en objet ayant comme attributs from, name, to c'est des String
  const jpeg = useRef(null);



  // gma = {"marquages":[M0,M2,M3,M4],"transitions":[
  //     {"from":"M0","name":"t1","to":"M2"},
  //     {"from":"M0","name":"t2","to":"M3"}]
  // }   structure de gma

  if(M0.length>0)
  M0 = M0.flat();
  gma.marquages.push(M0);

  const c = math.subtract(post, pre);

  var A = [];
  var Ae = [];
  var M;
  var Mn;
  var T = math.transpose(pre);
  const Tnames = T.map((elem, i) => "t" + parseInt(parseInt(i) + 1));
  var Ct = math.transpose(c);
  var infinite = false;
  let loopTransitions = [];

  A.push(M0);
  Ae.push(M0);

  while (Ae.length > 0) {
    M = Ae.shift();
    boucle: for (let t in T) {
      let fs = getFathers(gma, M);
      let fs0 = getFathersM0(gma, M);
      if (
        //check if a previous father has fired the transition and it is infinite
        loopTransitions.includes(t) &&
        matrixIntersection(fs0, gma.infiniteMarquages) &&
        !gma.marquages.includes(math.add(M, Ct[t]))
      ) {
        continue boucle;
      }

      if (math.largerEq(M, T[t]).every((el) => el)) {
        Mn = math.add(M, Ct[t]);
        gma.transitions.push({
          from: M,
          name: "t" + parseInt(parseInt(t) + 1),
          to: Mn,
        });
        if (!A.some((m) => math.deepEqual(m, Mn))) {
          A.push(Mn);
          Ae.push(Mn);
          gma.marquages.push(Mn);
        }
        const fathers = getFathers(gma, Mn);
        if (
          fathers.some(
            (father) =>
              father.every((el, i) => Mn[i] >= el) &&
              father.some((el, i) => Mn[i] > el)
          )
        ) {
          infinite = true;
          loopTransitions.push(t);
          //set the infinite marquage value to ...
          gma.infiniteMarquages.push(Mn);
        }
      }
    }
  }

  const toast = useRef(null);

  useEffect(() => {
    if (infinite) {
      toast.current.show({
        severity: "warn",
        summary: "Attention",
        detail: "Il existe un chemin infini",
        life: 3000,
      });
    }
  }, []);

  
  const noeuds = gma.marquages.map((M, i) => ({
    id: `[${M}]`,
    type: "default",
    data: {
      label: gma.infiniteMarquages.includes(M)
        ? "M" + i + " : \n " + "\n [" + M.toString() + "] ... (chemin infini)"
        : "M" + i + " : \n " + "\n [" + M.toString() + "]",
    },
    position: { x: 90 * (i % 2 === 0 ? -1 : 1), y: 80 * (i + 2) },
  }));

  // Création des transitions
  const trans = gma.transitions.map((t, i) => {
    {
      let couleur = "#" + Math.floor(Math.random() * 16777215).toString(16); //random colors
      return {
        id: `t${i}`,
        source: `[${t.from}]`,
        target: `[${t.to}]`,
        label: t.name.toString().replace("t", "T"),
        animated: true,
        markerEnd: {
          type: MarkerType.Arrow,
          color: couleur,
          size: 5,
        },
        style: { stroke: couleur, strokeWidth: 2.5, smooth: true },
      };
    }
  });

  //   // Affichage progressif des noeuds et des transitions
  //   let i = 0;
  //   const timerId = setInterval(() => {
  //     if (i < noeuds.length) {
  //       setNoeuds((prevNoeuds) => [...prevNoeuds, noeuds[i]]);
  //       i++;
  //     } else if (i < noeuds.length + trans.length) {
  //       setTrans((prevTrans) => [...prevTrans, trans[i - noeuds.length]]);
  //       i++;
  //     } else {
  //       clearInterval(timerId);
  //     }
  //   }, 800);

  //   return () => clearInterval(timerId);
  // },
  //  []);

  const analyse = {
    bornitude: infinite
      ? "GMA infini donc RdP non borné"
      : "GMA fini" + ", le RdP est " + getMaxValue(gma.marquages) + "-borné",
    binaire: "",
    "quasi vivacite": "RdP quasi-vivant",
    "pseudo vivacite": "RdP pseudo-vivant",
    vivacite: "RdP non vivant",
    reinitialisable: "",
    "Reseau sans blocage": "RdP sans Blocage",
    "Etat d'accueil": "",
    Conservatif: "",
  };

  Binaire(gma, analyse, infinite);
  PseudoVivant(gma, analyse);
  Conservatif(gma, analyse)
    ? (analyse["Conservatif"] = "RdP conservatif")
    : (analyse["Conservatif"] = "RdP non conservatif");

  analyse["reinitialisable"] = Reinitialisable(gma);
  Vivant(gma, analyse, Tnames);

  //***********************************PROP QUASI VIVACITE********************************/
  const tqv = QuasiVivant(gma, Tnames);
  if (tqv.length == 0) {
    analyse["quasi vivacite"] =
      "aucune transition n'est quasi-vivante, RdP non quasi-vivant";
  } else {
    if (tqv.length < Tnames.length) {
      analyse["quasi vivacite"] =
        "seules les transitions [" +
        tqv.toString() +
        "] sont quasi-vivantes, RdP non quasi-vivant";
    }
  }
  if (tqv.length == Tnames.length) {
    analyse["quasi vivacite"] =
      "toutes les transitions sont quasi-vivantes, RdP quasi-vivant";
  }
  //************************************************************************************** */

  //***********************************PROP ETAT D'ACCUEIL********************************/
  const EtatsAccueil = [];
  if (gma.marquages.every((m) => isEtatAccueil(gma, m))) {
    analyse["Etat d'accueil"] = "Tous les marquages sont des états d'accueil";
  } else {
    gma.marquages.forEach((m) => {
      if (isEtatAccueil(gma, m)) {
        EtatsAccueil.push(m);
      }
    });
    if (EtatsAccueil.length === 1) {
      analyse["Etat d'accueil"] =
        "le marquage [" + EtatsAccueil[0] + "] est un état d'accueil";
    } else if (EtatsAccueil.length > 1) {
      analyse["Etat d'accueil"] =
        "les marquages [" + EtatsAccueil + "] sont des états d'accueil";
    } else {
      analyse["Etat d'accueil"] = "Absence d'état d'acceuil";
    }
  }
  //************************************************************************************** */

  //*********************************GRAPHE********************************************** */
  const edgeTypes = {
    bezier: SmartBezierEdge,
  };

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 172;
  const nodeHeight = 36;
  const getLayoutedElements = (nodes, edges, direction = "LF") => {
    const isHorizontal = direction === "LF";
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);

      node.sourcePosition = "right";

      node.targetPosition = "top";

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };

      return node;
    });

    return { nodes, edges };
  };

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    noeuds,
    trans
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );


 


  return (
    <div className="container mx-auto py-4">
      <Toast ref={toast} />

      <div className="flex flex-col justify-center items-center m-5 mt-1">
        <div
          className="w-[70%] h-96 sm:h-[600px] md:h-[600px] lg:h-[600px] xl:h-[600px] 2xl:h-[600px] border-2 border-black rounded-md"
          id="myGMA"
        >
          <ReactFlow
            ref={jpeg}
            nodes={nodes}
            edges={edges}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView={true}
            edgesUpdatable={false}
            nodesConnectable={false}
          >
            <MiniMap
              nodeColor={(node) => {
                if (node.type === "input") return "blue";
                if (node.type === "output") return "yellow";
                return "#FFCC00";
              }}
              nodeStrokeWidth={3}
              nodeBorderRadius={2}
              nodeStrokeColor={(node) => "green"}
            />

            <Background />
            <Controls>
              <ControlButton
                onClick={() => {
                  if (jpeg.current === null) return;
                  toJpeg(jpeg.current, {
                    filter: (node) =>
                      !(
                        node?.classList?.contains("react-flow__minimap") ||
                        node?.classList?.contains("react-flow__controls") ||
                        node?.classList?.contains("react-flow__background")
                      ),
                  }).then((dataUrl) => {
                    const a = document.createElement("a");
                    a.setAttribute(
                      "download",
                      "reactflow" + Date.now() + ".jpeg"
                    );
                    a.setAttribute("href", dataUrl);
                    a.click();
                  });
                }}
              >
                <i className="pi pi-download"></i>
              </ControlButton>
            </Controls>
          </ReactFlow>
          {/* img that contains data url jpeg and display it only on print */}
          {/* <img
            id="print-only-img"
            ref={jpeg}
            src=" "
            alt="export"
            width="100%"
            height="100%"
          /> */}
        </div>
      </div>
      {/* center div on screen */}

      <div className="m-auto py-4 px-10 flex flex-col gap-y-3 bg-lightDivInput dark:bg-darkDivInput rounded-[20px] w-fit">
        <h2 className="dark:bg-[#bdbdbd3e] bg-[#f1f1f1f4] px-8 py-1 shadow-md rounded-[40px] text-xl font-bold mb-2 text-center">
          Résultats de l'Analyse Comportementale
        </h2>

        <ul className="dark:bg-[#bdbdbd3e] bg-[#f1f1f1f4] px-8 rounded-[25px]">
          {analyseProps.includes("Bornitude") && (
            <li className="mb-2">
              <span className="font-semibold">Bornitude:</span>{" "}
              {analyse.bornitude}
            </li>
          )}
          {analyseProps.includes("Binaire") && (
            <li className="mb-2">
              <span className="font-semibold">Binaire:</span> {analyse.binaire}
            </li>
          )}
          {analyseProps.includes("Conservatif") && (
            <li className="mb-2">
              <span className="font-semibold">Conservatif:</span>{" "}
              {analyse.Conservatif}
            </li>
          )}
          {analyseProps.includes("quasiVive") && (
            <li className="mb-2">
              <span className="font-semibold">Quasi Vivacité:</span>{" "}
              {analyse["quasi vivacite"]}
            </li>
          )}
          {analyseProps.includes("pseudoVive") && (
            <li className="mb-2">
              <span className="font-semibold">Pseudo Vivacité:</span>{" "}
              {analyse["pseudo vivacite"]}
            </li>
          )}
          {analyseProps.includes("vivacite") && (
            <li className="mb-2">
              <span className="font-semibold">Vivacité:</span>{" "}
              {analyse.vivacite}
            </li>
          )}
          {analyseProps.includes("rénialisabilité") && (
            <li className="mb-2">
              <span className="font-semibold">Réinitialisable:</span>{" "}
              {analyse.reinitialisable}
            </li>
          )}
          {analyseProps.includes("bloquage") && (
            <li className="mb-2">
              <span className="font-semibold">Réseau sans blocage:</span>{" "}
              {analyse["Reseau sans blocage"]}
            </li>
          )}
          {analyseProps.includes("accueil") && (
            <li className="mb-2">
              <span className="font-semibold">Etat d'accueil:</span>{" "}
              {analyse["Etat d'accueil"]}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

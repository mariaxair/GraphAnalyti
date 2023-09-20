import React from "react";
import "./style.css";
//import images
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";
import rdp from "../assets/rdp.png";
import laptop from "../assets/laptop.png";

export default function LandingPage(props) {
  /*===== MOUSEMOVE HOME IMG =====*/
  document.addEventListener("mousemove", move);
  function move(e) {
    this.querySelectorAll(".move").forEach((layer) => {
      const speed = layer.getAttribute("data-speed");

      const x = (window.innerWidth - e.pageX * speed) / 300;
      const y = (window.innerHeight - e.pageY * speed) / 300;

      layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
  }

  return (
    <main className="l-main">
      <section className="home" id="home">
        <div className="home__container bd-container bd-grid">
          <div className="home__img">
            <img id="img1" src={img1} alt="" data-speed="-2" className="move" />
            <img id="img2" src={img2} alt="" data-speed="2" className="move" />
            <img id="img3" src={img3} alt="" data-speed="-2" className="move" />
            <img id="rdp" src={rdp} alt="" data-speed="2" className="move" />
            <img
              id="laptop"
              src={laptop}
              alt=""
              data-speed="-2"
              className="move"
            />
          </div>

          <div className="home__data">
            <h1 className="home__title">GraphAnalyti</h1>
            <p className="home__description font-bold text-[24px]">
              Pour votre Analyse Comportementale des Réseaux de Petri.
            </p>
            <p className="home__description">
              L'analyse comportementale d'un réseau de Petri consiste à étudier
              et à comprendre le comportement dynamique du système modélisé.
              Cela implique l'analyse des séquences de franchissements de
              transitions, la détection de blocages, l'étude des propriétés de
              vivacité et de bornitude, ainsi que d'autres caractéristiques du
              réseau pour évaluer son fonctionnement et ses performances.
            </p>
            <button onClick={props.onClick} className="button">
              Commencer
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

import { create, all } from "mathjs";

const config = {};
const math = create(all, config);

export function getMaxValue(arr) {
  let maxNumber = -Infinity;

  maxNumber = Math.max(...[].concat(...arr));
  return maxNumber;
}

export function getFathers(gma, marquage, visited = []) {
  visited.push(marquage);

  gma.transitions.forEach((transition) => {
    if (JSON.stringify(transition.to) === JSON.stringify(marquage)) {
      const from = transition.from;
      if (!visited.some((v) => JSON.stringify(v) === JSON.stringify(from))) {
        visited = getFathers(gma, from, visited); // Update visited array with the result of the recursive call
      }
    }
  });

  return visited;
}

export function getFathersM0(gma, marquage, visited = []) {
  visited.push(marquage);

  gma.transitions.forEach((transition) => {
    if (JSON.stringify(transition.to) === JSON.stringify(marquage)) {
      const from = transition.from;
      const to = transition.to;
      if (!visited.some((v) => JSON.stringify(v) === JSON.stringify(from))) {
        if (JSON.stringify(to) != JSON.stringify(gma.marquages[0].flat())) {
          visited = getFathersM0(gma, from, visited);
        }
      }
    }
  });
  visited = visited.filter(
    (marking) =>
      JSON.stringify(marking) !== JSON.stringify(gma.marquages[0].flat())
  );
  return visited;
}

export function add(vec1, vec2) {
  var vec = [];
  for (let i = 0; i < vec1.length; i++) {
    vec[i] = parseInt(vec1[i]) + parseInt(vec2[i]);
  }
  return vec;
}

// BORNITUDE
export function Bornitude(gma) {
  var i = 0;
  var M = gma.marquages;
  while (i < M.length - 1) {
    if (compareArrays(M[i], M[i + 1]) == true) {
      return "RdP infini donc RdP non borné";
    }
    i++;
  }
  return "RdP fini donc RdP borné, il est " + math.max(M) + "-borné";
}

//BINAIRE
export function Binaire(gma, analyse, infinite) {
  if (infinite) {
    analyse["binaire"] = "RdP non Binaire";
    return;
  }
  if (getMaxValue(gma.marquages) == 1 || getMaxValue(gma.marquages) == 0) {
    analyse["binaire"] = "RdP Binaire";
    return;
  } else {
    analyse["binaire"] = "RdP non Binaire";
    return;
  }
}

//CONSERVATIF
export function Conservatif(gma, analyse) {
  const marquages = [...gma.marquages];
  const tab = [];
  marquages.map((m, i) => {
    tab.push(m.reduce((a, b) => parseInt(a) + parseInt(b), 0));
  });
  return tab.every((t) => t == tab[0]);
}

//PSEUDO VIVACITE ET SANS BLOCAGE     V2
export function PseudoVivant(gma, analyse) {
  for (let i = 0; i < gma.marquages.length; i++) {
    const marquage = gma.marquages[i].flat();
    let found = false;

    gma.transitions.some((transition) => {
      if (math.deepEqual(transition.from, marquage)) {
        found = true;
      }
    });
    if (!found) {
      console.log("blockage found");
      console.log(marquage);
      analyse["pseudo vivacite"] = "RdP non Pseudo-vivant";
      analyse["Reseau sans blocage"] = "RdP avec Blocage";
      return; // blockage found
    }
  }

  return; // no blockage found , pseudo
}

//QUASI VIVACITE
export function QuasiVivant(gma, Tnames) {
  let tqv = new Array();
  Tnames.forEach((t) => {
    var b = false;

    for (let i = 0; i < gma.transitions.length; i++) {
      if (t == gma.transitions[i].name) {
        b = true;
        tqv.push(t);
        break;
      }
    }
  });
  return tqv;
}

//ETAT D'ACCUEIL

//REINITIALISABLE
export function Reinitialisable(gma) {
  return isEtatAccueil(gma, gma.marquages[0])
    ? "RdP réinitialisable"
    : "RdP non réinitialisable";
}

//VIVACITE
export function Vivant(gma, analyse, tnames) {
  if (
    QuasiVivant(gma, tnames).length == tnames.length &&
    Reinitialisable(gma) == "RdP réinitialisable"
  ) {
    analyse["vivacite"] = "RdP Vivant";
    return;
  }
  
}

export function matrixIntersection(matrix1, matrix2) {
  const intersection = [];

  for (let i = 0; i < matrix1.length; i++) {
    const row = [];

    for (let j = 0; j < matrix1[i].length; j++) {
      if (matrix2[i] && matrix2[i][j] === matrix1[i][j]) {
        row.push(matrix1[i][j]);
      }
    }

    if (row.length > 0) {
      return true;
    }
  }

  return false;
}

//

function existeChemin(gma, from, to, visited = []) {
  if (JSON.stringify(from) == JSON.stringify(to)) return true;

  visited.push(from);

  for (const transition of gma.transitions) {
    if (JSON.stringify(transition.from) === JSON.stringify(from)) {
      const next = transition.to;
      if (!visited.some((v) => JSON.stringify(v) === JSON.stringify(next))) {
        if (existeChemin(gma, next, to, visited)) return true;
      }
    }
  }

  return false;
}

export function isEtatAccueil(gma, m) {
  return gma.marquages.every((ma) => existeChemin(gma, ma.flat(), m.flat()));
}

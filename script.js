// script.js

let numJugadores = 0;
let jugadores = [];
let maxCartas = 8;
let rondas = [];
let rondaActual = 0;
let apuestas = [];
let bazas = [];
let historial = [];

const btnSiguiente = document.getElementById("siguiente-nombres");
const nombresContainer = document.getElementById("nombres-container");
const formNombres = document.getElementById("form-nombres");
const btnIniciar = document.getElementById("iniciar-partida");

const setupDiv = document.getElementById("setup");
const juegoDiv = document.getElementById("juego");
const tablaDiv = document.getElementById("tabla-container");
const headerTabla = document.getElementById("header-tabla");
const tablaBody = document.getElementById("tabla-body");

const numRondaSpan = document.getElementById("num-ronda");
const jugadorActualSpan = document.getElementById("jugador-actual");

const faseApuestas = document.getElementById("fase-apuestas");
const formApuestas = document.getElementById("form-apuestas");
const btnConfirmarApuestas = document.getElementById("confirmar-apuestas");

const faseBazas = document.getElementById("fase-bazas");
const jugadorBazas = document.getElementById("jugador-bazas");
const selectBaza = document.getElementById("select-baza");
const btnConfirmarBaza = document.getElementById("confirmar-baza");

btnSiguiente.onclick = () => {
  numJugadores = parseInt(document.getElementById("num-jugadores").value);
  if (isNaN(numJugadores) || numJugadores < 2) return alert("Mínimo 2 jugadores");
  formNombres.innerHTML = "";
  for (let i = 0; i < numJugadores; i++) {
    formNombres.innerHTML += `<input type=\"text\" placeholder=\"Jugador ${i + 1}\" required id=\"jugador-${i}\" />`;
  }
  nombresContainer.classList.remove("hidden");
};

btnIniciar.onclick = () => {
  jugadores = [];
  for (let i = 0; i < numJugadores; i++) {
    const nombre = document.getElementById(`jugador-${i}`).value.trim();
    if (!nombre) return alert("Todos los nombres son obligatorios");
    jugadores.push(nombre);
  }

  maxCartas = parseInt(document.getElementById("max-cartas").value);
  if (isNaN(maxCartas) || maxCartas < 1) return alert("Máximo de cartas inválido");

  rondas = [];
  for (let i = 1; i <= maxCartas; i++) rondas.push(i);
  for (let i = maxCartas - 1; i >= 1; i--) rondas.push(i);

//   jugadores.forEach(j => {
//     const th = document.createElement("th");
//     th.textContent = j;
//     headerTabla.appendChild(th);
//   });

  historial = [];
  setupDiv.classList.add("hidden");
  //tablaDiv.classList.remove("hidden");
  juegoDiv.classList.remove("hidden");
  rondaActual = 0;
  iniciarRonda();
};

function iniciarRonda() {
  if (rondaActual >= rondas.length) {
    mostrarPopupFinalRanking();
    juegoDiv.classList.add("hidden");
    return;
  }

  apuestas = [];
  bazas = [];

  const cartasRonda = rondas[rondaActual];
  const quienEmpieza = rondaActual % jugadores.length;

  numRondaSpan.textContent = rondaActual + 1;
  jugadorActualSpan.textContent = jugadores[quienEmpieza];

  faseApuestas.classList.remove("hidden");
  mostrarFormularioApuestas(quienEmpieza, cartasRonda);
}

function procesarRonda(cartas) {
  const puntosRonda = [];
  for(let i=0; i < jugadores.length; i++){
    puntosRonda.push(calcPuntos(apuestas[i], bazas[i]));
  }
  historial.push(puntosRonda);
  //agregarFilaTabla(puntosRonda, cartas);
  agregarCardRonda(puntosRonda, cartas, numRondaSpan.textContent)

  rondaActual++;
  iniciarRonda();
}


function mostrarFormularioApuestas(inicio, cartasRonda) {
  formApuestas.innerHTML = "";

  const totalBazas = cartasRonda;

  for (let i = 0; i < jugadores.length; i++) {
    const index = (inicio + i) % jugadores.length;
    const jugador = jugadores[index];

    const div = document.createElement("div");
    div.innerHTML = `
      <label>${jugador}:</label>
      <select id="apuesta-${index}"></select>
    `;

    const select = div.querySelector("select");

    for (let c = 0; c <= cartasRonda; c++) {
      const option = document.createElement("option");
      option.value = c;
      option.textContent = c;
      select.appendChild(option);
    }

    formApuestas.appendChild(div);
  }

  // Función para actualizar opción prohibida en último select
  function actualizarProhibido() {
    const ultimoIndex = (inicio + jugadores.length - 1) % jugadores.length;
    const ultimoSelect = document.getElementById(`apuesta-${ultimoIndex}`);

    // Sumamos apuestas previas (todos menos último)
    let sumaPrevias = 0;
    for (let j = 0; j < jugadores.length - 1; j++) {
      const idx = (inicio + j) % jugadores.length;
      const sel = document.getElementById(`apuesta-${idx}`);
      sumaPrevias += sel ? parseInt(sel.value) || 0 : 0;
    }

    const apuestaProhibida = totalBazas - sumaPrevias;

    // Actualizamos opciones del último select
    for (const option of ultimoSelect.options) {
      const val = parseInt(option.value);
      if (val === apuestaProhibida && apuestaProhibida >= 0 && apuestaProhibida <= cartasRonda) {
        option.disabled = true;
        option.textContent = `${val} (Prohibido)`;
        option.style.backgroundColor = "#ff9999";
        option.style.color = "#a00";
        option.style.fontWeight = "bold";
      } else {
        option.disabled = false;
        option.textContent = val;
        option.style.backgroundColor = "";
        option.style.color = "";
        option.style.fontWeight = "";
      }
    }

    // Si la opción seleccionada en último es la prohibida, la cambiamos a 0
    if (parseInt(ultimoSelect.value) === apuestaProhibida) {
      ultimoSelect.value = 0;
    }
  }

  // Añadimos listeners a todos menos último para actualizar la opción prohibida al cambiar
  for (let i = 0; i < jugadores.length - 1; i++) {
    const idx = (inicio + i) % jugadores.length;
    const sel = document.getElementById(`apuesta-${idx}`);
    sel.addEventListener("change", actualizarProhibido);
  }

  // Ejecutamos una vez para inicializar bien
  actualizarProhibido();

  btnConfirmarApuestas.onclick = () => {
    let total = 0;
    apuestas = [];
    for (let i = 0; i < jugadores.length; i++) {
      const val = parseInt(document.getElementById(`apuesta-${i}`).value);
      apuestas.push(val);
      total += val;
    }

    if (total === totalBazas) {
      alert(`La suma total de apuestas no puede ser igual a ${totalBazas}. Cambia la apuesta del último jugador.`);
      return;
    }

    faseApuestas.classList.add("hidden");
    mostrarFormularioBazas(inicio, cartasRonda);
  };
}


function mostrarFormularioBazas(inicio, cartasRonda) {
  faseBazas.innerHTML = "<h3>Confirmar bazas:</h3>";
  for (let i = 0; i < jugadores.length; i++) {
    const index = (inicio + i) % jugadores.length;
    const jugador = jugadores[index];

    const div = document.createElement("div");
    div.innerHTML = `
      <label>${jugador}:</label>
      <select id=\"baza-${index}\"></select>
    `;

    const select = div.querySelector("select");
    for (let c = 0; c <= cartasRonda; c++) {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    }

    faseBazas.appendChild(div);
  }

  const btn = document.createElement("button");
  btn.textContent = "Confirmar Bazas";
  btn.onclick = () => {
    bazas = [];
    for (let i = 0; i < jugadores.length; i++) {
        bazas.push(parseInt(document.getElementById(`baza-${i}`).value));
    }
    faseBazas.classList.add("hidden");
    procesarRonda(rondas[rondaActual]);
    };
  faseBazas.appendChild(btn);
  faseBazas.classList.remove("hidden");
}

function calcPuntos(apuesta, baza) {
  if (apuesta === baza) {
    return 10 + (5 * apuesta);
  } else {
    return -5 * Math.abs(apuesta - baza);
  }
}

function calcularPuntos(cartas) {
  // ya tienes esta función para puntuar, pero tú la llamas así:
  const puntosRonda = [];

  for(let i=0; i < jugadores.length; i++){
    const p = calcularPuntos(apuestas[i], bazas[i]);
    puntosRonda.push(p);
  }

  historial.push(puntosRonda);
  agregarFilaTabla(puntosRonda, cartas);

  // Aquí incrementamos la ronda actual para avanzar a la siguiente
  rondaActual++;

  iniciarRonda();
}



function agregarFilaTabla(puntos, cartas) {
  const fila = document.createElement("tr");
  fila.innerHTML = `<td>${rondaActual + 1}</td><td>${cartas}</td>`;
  puntos.forEach(p => {
    const td = document.createElement("td");
    td.textContent = p;
    fila.appendChild(td);
  });
  tablaBody.appendChild(fila);

  // Actualizar fila total al final
  actualizarFilaTotal();
}

function actualizarFilaTotal() {
  // Si existe fila total, la elimina para actualizar
  const filaTotalExistente = document.getElementById("fila-total");
  if (filaTotalExistente) filaTotalExistente.remove();

  // Suma puntos de cada jugador de todas las rondas
  const totales = new Array(jugadores.length).fill(0);
  historial.forEach(ronda => {
    ronda.forEach((p, i) => {
      totales[i] += p;
    });
  });

  const filaTotal = document.createElement("tr");
  filaTotal.id = "fila-total";
  filaTotal.style.fontWeight = "bold";
  filaTotal.innerHTML = `<td colspan="2">Total</td>`;
  totales.forEach(t => {
    const td = document.createElement("td");
    td.textContent = t;
    filaTotal.appendChild(td);
  });

  tablaBody.appendChild(filaTotal);
}

function agregarCardRonda(puntos, cartas, numeroRonda) {
  const container = document.getElementById("rondas-container");

  const card = document.createElement("div");
  card.className = "ronda-card";

  // Header ronda
  const header = document.createElement("h3");
  header.textContent = `Ronda ${numeroRonda} - Cartas: ${cartas}`;
  card.appendChild(header);

  // Lista de jugadores con puntos
  jugadores.forEach((jugador, i) => {
    const fila = document.createElement("div");
    fila.className = "jugador-fila";

    const nombre = document.createElement("span");
    nombre.className = "jugador-nombre";
    nombre.textContent = jugador;

    const puntosJugador = document.createElement("span");
    puntosJugador.className = "jugador-puntos";

    // Asignar clase según positivo o negativo
    if (puntos[i] >= 0) {
      puntosJugador.classList.add("positivo");
      puntosJugador.textContent = `+${puntos[i]}`;
    } else {
      puntosJugador.classList.add("negativo");
      puntosJugador.textContent = puntos[i];
    }

    // Total acumulado separado a la derecha
    const totalAcumulado = document.createElement("span");
    totalAcumulado.className = "jugador-total-neutral";
    const total = totalAcumuladoHastaRonda(i, rondaActual);
    totalAcumulado.textContent = total >= 0 ? `${total}` : total;

    fila.appendChild(nombre);
    fila.appendChild(puntosJugador);
    fila.appendChild(totalAcumulado);

    card.appendChild(fila);
  });

  container.appendChild(card);
}

function totalAcumuladoHastaRonda(jugadorIndex, rondaIndex) {
  let total = 0;
  for(let i = 0; i <= rondaIndex; i++) {
    total += historial[i][jugadorIndex];
  }
  return total;
}

// Mostrar el botón de ranking una vez iniciada la partida
function mostrarBotonRanking() {
  const toggle = document.getElementById("ranking-toggle-container");
  if (toggle) toggle.classList.remove("hidden");
}

// Llamar esta función cuando se inicie la partida:
document.getElementById("iniciar-partida").addEventListener("click", () => {
  mostrarBotonRanking();
});

// Toggle para mostrar/ocultar ranking
let rankingVisible = false;

document.getElementById("ver-ranking").addEventListener("click", () => {
  const contenedor = document.getElementById("ranking-container");

  if (rankingVisible) {
    contenedor.classList.add("hidden");
    contenedor.innerHTML = "";
    document.getElementById("ver-ranking").textContent = "Ver Ranking";
    rankingVisible = false;
    return;
  }

  // Calcular totales
  const totales = {};

  document.querySelectorAll(".jugador-fila").forEach(fila => {
    const nombre = fila.querySelector(".jugador-nombre").textContent.trim();
    const total = fila.querySelector(".jugador-total-neutral");
    if (total) {
      const puntos = parseInt(total.textContent.trim(), 10) || 0;
      totales[nombre] = puntos;
    }
  });

  const rankingOrdenado = Object.entries(totales).sort((a, b) => b[1] - a[1]);

  // Crear el ranking HTML
  const htmlRanking = `
    <h2 class="ranking-title">🏆 Ranking Actual</h2>
    <ul class="ranking-list">
      ${rankingOrdenado.map(([nombre, puntos], i) => `
        <li class="ranking-item">
          <span>${i + 1}. ${nombre}</span>
          <span>${puntos} pts</span>
        </li>
      `).join('')}
    </ul>
  `;

  contenedor.innerHTML = htmlRanking;
  contenedor.classList.remove("hidden");
  document.getElementById("ver-ranking").textContent = "Ocultar Ranking";
  rankingVisible = true;
});

function mostrarPopupFinalRanking() {
  const contenedor = document.getElementById("contenido-ranking-final");
  const overlay = document.getElementById("popup-ranking-final");

  // Calcular totales
  const totales = {};

  document.querySelectorAll(".jugador-fila").forEach(fila => {
    const nombre = fila.querySelector(".jugador-nombre").textContent.trim();
    const total = fila.querySelector(".jugador-total-neutral");
    if (total) {
      const puntos = parseInt(total.textContent.trim(), 10) || 0;
      totales[nombre] = puntos;
    }
  });

  const rankingOrdenado = Object.entries(totales).sort((a, b) => b[1] - a[1]);

  const html = `
    <ul>
      ${rankingOrdenado.map(([nombre, puntos], i) => `
        <li><span>${i + 1}. ${nombre}</span><span>${puntos} pts</span></li>
      `).join('')}
    </ul>
  `;

  contenedor.innerHTML = html;
  overlay.classList.remove("hidden");
}

document.getElementById("cerrar-popup").addEventListener("click", () => {
  document.getElementById("popup-ranking-final").classList.add("hidden");
});

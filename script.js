// Script para simulador de tiro parabólico con caída libre

// Obtener elementos del DOM
const calcularBtn = document.getElementById("calcular");
const ctx = document.getElementById("grafico").getContext("2d");
const ctxCaida = document.getElementById("graficoCaida").getContext("2d"); // Nuevo canvas para la caída
let grafico;
let graficoCaida;

calcularBtn.addEventListener("click", function () {
    // Obtener valores del problema (debe ser procesado para extraer números)
    const problemaTexto = document.getElementById("problema").value;
    const valoresExtraidos = extraerValores(problemaTexto);

    if (!valoresExtraidos) {
        alert("Por favor, ingrese un problema válido con velocidad y ángulo.");
        return;
    }

    const { velocidadInicial, angulo } = valoresExtraidos;
    const g = 9.8; // Gravedad en m/s^2

    // Convertir ángulo a radianes
    const anguloRad = (angulo * Math.PI) / 180;

    // Componentes de la velocidad inicial
    const velocidadX = velocidadInicial * Math.cos(anguloRad);
    const velocidadY = velocidadInicial * Math.sin(anguloRad);

    // 1. Altura máxima
    const alturaMaxima = (velocidadY ** 2) / (2 * g);

    // 2. Tiempo hasta altura máxima
    const tiempoSubida = velocidadY / g;

    // 3. Distancia horizontal hasta el cable
    const distanciaCable = velocidadX * tiempoSubida;

    // 4. Tiempo de caída libre desde la altura máxima
    const tiempoCaida = Math.sqrt((2 * alturaMaxima) / g);

    // 5. Velocidad final antes de impactar el suelo
    const velocidadFinal = Math.sqrt(2 * g * alturaMaxima);

    // Mostrar resultados en la página
    document.getElementById("alturaMaxima").textContent = alturaMaxima.toFixed(2);
    document.getElementById("tiempoSubida").textContent = tiempoSubida.toFixed(2);
    document.getElementById("distanciaCable").textContent = distanciaCable.toFixed(2);
    document.getElementById("tiempoCaida").textContent = tiempoCaida.toFixed(2);
    document.getElementById("velocidadFinal").textContent = velocidadFinal.toFixed(2);

    // Limpiar gráficos anteriores
    if (grafico) {
        grafico.destroy();
    }
    if (graficoCaida) {
        graficoCaida.destroy();
    }

    // Animación de la trayectoria
    animarTrayectoria(velocidadX, velocidadY, tiempoSubida, tiempoCaida, distanciaCable, alturaMaxima);
});

// Función para extraer valores de un problema en texto
function extraerValores(texto) {
    const velocidadMatch = texto.match(/(\d+(\.\d+)?)\s*m\/s/);
    const anguloMatch = texto.match(/(\d+(\.\d+)?)\s*°/);

    if (velocidadMatch && anguloMatch) {
        return {
            velocidadInicial: parseFloat(velocidadMatch[1]),
            angulo: parseFloat(anguloMatch[1])
        };
    }
    return null;
}

// Función para animar la trayectoria y caída
function animarTrayectoria(vx, vy, tiempoSubida, tiempoCaida, xCable, yMax) {
    let datosX = [];
    let datosY = [];
    let t = 0;
    let dt = tiempoSubida / 30;

    while (t <= tiempoSubida) {
        let x = vx * t;
        let y = vy * t - (0.5 * 9.8 * t ** 2);
        datosX.push(x);
        datosY.push(y);
        t += dt;
    }

    t = 0;
    dt = tiempoCaida / 30;
    let datosCaidaX = [];
    let datosCaidaY = [];
    while (t <= tiempoCaida) {
        let y = yMax - (0.5 * 9.8 * t ** 2);
        datosCaidaX.push(xCable);
        datosCaidaY.push(y);
        t += dt;
    }

    grafico = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Pelota",
                data: [],
                borderColor: "rgba(34, 193, 195, 0.8)",
                pointRadius: 6,
                fill: false,
                backgroundColor: "rgba(34, 193, 195, 1)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true
        }
    });

    graficoCaida = new Chart(ctxCaida, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Caída libre",
                data: [],
                borderColor: "rgba(255, 69, 0, 0.8)",
                fill: false,
                pointRadius: 5,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true
        }
    });

    let i = 0;
    function actualizarGrafico() {
        if (i < datosX.length) {
            grafico.data.labels.push(datosX[i].toFixed(2));
            grafico.data.datasets[0].data.push({ x: datosX[i], y: datosY[i] });
            grafico.update();

            if (i < datosCaidaX.length) {
                graficoCaida.data.labels.push(datosCaidaX[i].toFixed(2));
                graficoCaida.data.datasets[0].data.push({ x: datosCaidaX[i], y: datosCaidaY[i] });
                graficoCaida.update();
            }

            i++;
            setTimeout(actualizarGrafico, 50);
        }
    }

    actualizarGrafico();
}

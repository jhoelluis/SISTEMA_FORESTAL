const ARBOLES = {
    "Roble": {
        "suelos": ["arcilloso", "franco"],
        "ph_min": 4.5,
        "ph_max": 7.5,
        "temp_min": 10,
        "temp_max": 30,
        "precipitacion_min": 600,
        "probabilidad_base": 0.3,
        "verosimilitud": 0.8,
        "icon": "🌳"
    },
    "Pino": {
        "suelos": ["arenoso", "franco"],
        "ph_min": 5.0,
        "ph_max": 7.0,
        "temp_min": 5,
        "temp_max": 25,
        "precipitacion_min": 500,
        "probabilidad_base": 0.4,
        "verosimilitud": 0.7,
        "icon": "🌲"
    },
    "Eucalipto": {
        "suelos": ["arcilloso", "franco", "arenoso"],
        "ph_min": 5.5,
        "ph_max": 7.5,
        "temp_min": 15,
        "temp_max": 35,
        "precipitacion_min": 700,
        "probabilidad_base": 0.25,
        "verosimilitud": 0.6,
        "icon": "🌴"
    },
    "Abeto": {
        "suelos": ["franco", "arenoso"],
        "ph_min": 5.0,
        "ph_max": 6.5,
        "temp_min": 0,
        "temp_max": 20,
        "precipitacion_min": 800,
        "probabilidad_base": 0.2,
        "verosimilitud": 0.75,
        "icon": "🎄"
    },
    "Arce": {
        "suelos": ["franco", "arcilloso"],
        "ph_min": 6.0,
        "ph_max": 7.5,
        "temp_min": 5,
        "temp_max": 25,
        "precipitacion_min": 700,
        "probabilidad_base": 0.3,
        "verosimilitud": 0.7,
        "icon": "🍁"
    },
    "Sauce": {
        "suelos": ["arcilloso", "franco"],
        "ph_min": 5.5,
        "ph_max": 7.5,
        "temp_min": 5,
        "temp_max": 30,
        "precipitacion_min": 800,
        "probabilidad_base": 0.25,
        "verosimilitud": 0.65,
        "icon": "🌿"
    },
    "Cedro": {
        "suelos": ["arenoso", "franco"],
        "ph_min": 5.5,
        "ph_max": 7.0,
        "temp_min": 10,
        "temp_max": 30,
        "precipitacion_min": 600,
        "probabilidad_base": 0.2,
        "verosimilitud": 0.7,
        "icon": "🌳"
    },
    "Abedul": {
        "suelos": ["arenoso", "franco"],
        "ph_min": 4.5,
        "ph_max": 6.5,
        "temp_min": 0,
        "temp_max": 25,
        "precipitacion_min": 500,
        "probabilidad_base": 0.35,
        "verosimilitud": 0.75,
        "icon": "🌿"
    },
    "Castaño": {
        "suelos": ["franco", "arenoso"],
        "ph_min": 5.0,
        "ph_max": 6.5,
        "temp_min": 10,
        "temp_max": 30,
        "precipitacion_min": 700,
        "probabilidad_base": 0.3,
        "verosimilitud": 0.7,
        "icon": "🌰"
    },
    "Olmo": {
        "suelos": ["arcilloso", "franco"],
        "ph_min": 6.0,
        "ph_max": 8.0,
        "temp_min": 5,
        "temp_max": 30,
        "precipitacion_min": 600,
        "probabilidad_base": 0.2,
        "verosimilitud": 0.6,
        "icon": "🌳"
    }
};
let mapa;
let vertices = [];
let polilinea;
let indicePreguntaActual = 0;
const contenedorPreguntas = document.getElementById('contenedorPreguntas');
const cajaMensajes = document.getElementById('cajaMensajes');

const preguntas = [
    "¿Cuál es el tipo de suelo predominante en el área? (arcilloso/franco/arenoso)",
    "¿El pH del suelo está entre 4.5 y 8.0? (Sí/No)",
    "¿Cuál es la temperatura promedio anual del área en °C?",
    "¿Cuál es la precipitación anual promedio en mm?"
];
const respuestas = [];

function iniciarMapa() {
    mapa = L.map('mapa').setView([-15.822352, -70.017083], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(mapa);

    mapa.on('click', agregarVertice);
    document.getElementById('enlazarVertices').addEventListener('click', enlazarVertices);
    document.getElementById('analizarArea').addEventListener('click', iniciarAnalisis);
}

function agregarVertice(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    vertices.push([lat, lon]);

    L.marker([lat, lon]).addTo(mapa);
    actualizarListaVertices();
}

function actualizarListaVertices() {
    const listaVertices = document.getElementById('listaVertices');
    listaVertices.innerHTML = '';
    vertices.forEach((vertice, indice) => {
        const li = document.createElement('li');
        li.textContent = `Vértice ${indice + 1}: Lat ${vertice[0].toFixed(6)}, Lon ${vertice[1].toFixed(6)}`;
        listaVertices.appendChild(li);
    });
}

function enlazarVertices() {
    if (vertices.length < 3) {
        mostrarMensaje('Se necesitan al menos 3 vértices para definir un área de análisis.');
        return;
    }

    if (polilinea) {
        mapa.removeLayer(polilinea);
    }

    const verticesCerrados = [...vertices, vertices[0]];
    polilinea = L.polyline(verticesCerrados, { color: 'red' }).addTo(mapa);
    mapa.fitBounds(polilinea.getBounds());

    const poligono = L.polygon(verticesCerrados, { color: 'blue', fillOpacity: 0.2 }).addTo(mapa);
    calcularAreaYPerimetro(verticesCerrados);

    indicePreguntaActual = 0;
    respuestas.length = 0;
    hacerSiguientePregunta();
}

function calcularAreaYPerimetro(vertices) {
    const poligonoTurf = turf.polygon([vertices]);
    const area = turf.area(poligonoTurf);
    const perimetro = turf.length(turf.lineString(vertices), { units: 'meters' });
    mostrarAreaYPerimetro(area, perimetro);
}

function mostrarAreaYPerimetro(area, perimetro) {
    const divResultados = document.getElementById('resultados');
    divResultados.innerHTML = `<p>Área de análisis: ${area.toFixed(2)} m²</p>
                               <p>Perímetro: ${perimetro.toFixed(2)} m</p>`;
}

function hacerSiguientePregunta() {
    if (indicePreguntaActual < preguntas.length) {
        contenedorPreguntas.innerHTML = `
            <p>${preguntas[indicePreguntaActual]}</p>
            <input type="text" id="respuesta" />
            <button onclick="enviarRespuesta()">Siguiente</button>
        `;
    } else {
        contenedorPreguntas.innerHTML = '';
        analizarArea();
    }
}

function enviarRespuesta() {
    const respuesta = document.getElementById('respuesta').value;
    if (respuesta) {
        respuestas.push(respuesta);
        indicePreguntaActual++;
        hacerSiguientePregunta();
    } else {
        mostrarMensaje('Por favor, ingresa una respuesta.');
    }
}

function iniciarAnalisis() {
    document.querySelector('#analizarArea .cargando').style.display = 'inline-block';
    setTimeout(analizarArea, 2000); // Simulamos un tiempo de procesamiento de 2 segundos
}

function analizarArea() {
    document.querySelector('#analizarArea .cargando').style.display = 'none';
    
    if (respuestas.length < preguntas.length) {
        mostrarMensaje('No se pudo obtener toda la información necesaria para el análisis.');
        return;
    }

    const tipoSuelo = respuestas[0].toLowerCase();
    const respuestaPH = respuestas[1].toLowerCase() === 'sí';
    const temperatura = parseFloat(respuestas[2]);
    const precipitacion = parseFloat(respuestas[3]);
    const phValido = (respuestaPH && (temperatura >= 4.5 && temperatura <= 8.0)) || (!respuestaPH && (temperatura < 4.5 || temperatura > 8.0));

    const aptoParaPlantacion = (phValido && precipitacion > 500) || (tipoSuelo === 'franco' && precipitacion > 400);

    const arbolesAdecuados = [];

    for (const [nombreArbol, datosArbol] of Object.entries(ARBOLES)) {
        const esAdecuado = 
            datosArbol.suelos.includes(tipoSuelo) &&
            temperatura >= datosArbol.temp_min && temperatura <= datosArbol.temp_max &&
            precipitacion >= datosArbol.precipitacion_min;

        if (esAdecuado) {
            const pBA = datosArbol.verosimilitud;
            const pA = datosArbol.probabilidad_base;
            const pB = (pA * pBA) + (1 - pA) * (1 - pBA);

            const probabilidadPosterior = (pBA * pA) / pB;

            arbolesAdecuados.push({
                nombre: nombreArbol,
                probabilidad: probabilidadPosterior,
                icono: datosArbol.icon
            });
        }
    }

    mostrarResultados(aptoParaPlantacion, arbolesAdecuados);
    mostrarPercepcionesIA(arbolesAdecuados, tipoSuelo, temperatura, precipitacion);
    agregarIconosArboles(arbolesAdecuados);
}

function mostrarResultados(aptoParaPlantacion, arbolesAdecuados) {
    const divResultados = document.getElementById('resultados');
    divResultados.innerHTML += `<p>Evaluación de IA: ${aptoParaPlantacion ? 'El área es adecuada' : 'El área no es adecuada'} para la plantación de árboles.</p>`;
    
    if (arbolesAdecuados.length > 0) {
        divResultados.innerHTML += `<p>Especies de árboles recomendadas por la IA:</p><ul>`;
        arbolesAdecuados.forEach(arbol => {
            divResultados.innerHTML += `<li>${arbol.icono} ${arbol.nombre} (Probabilidad de éxito: ${(arbol.probabilidad * 100).toFixed(2)}%)</li>`;
        });
        divResultados.innerHTML += `</ul>`;
    } else {
        divResultados.innerHTML += `<p>La IA no encontró especies de árboles adecuadas para las condiciones dadas.</p>`;
    }
}

function mostrarPercepcionesIA(arbolesAdecuados, tipoSuelo, temperatura, precipitacion) {
    const recomendacionesIA = document.getElementById('recomendacionesIA');
    recomendacionesIA.innerHTML = `
        <p>Basado en el análisis de IA, se recomienda:</p>
        <ul>
            <li>Preparación del suelo: ${obtenerRecomendacionPreparacionSuelo(tipoSuelo)}</li>
            <li>Riego: ${obtenerRecomendacionRiego(precipitacion)}</li>
            <li>Manejo de temperatura: ${obtenerRecomendacionManejoTemperatura(temperatura)}</li>
        </ul>
    `;
    
    crearGraficaDistribucionArboles(arbolesAdecuados);
}

function obtenerRecomendacionPreparacionSuelo(tipoSuelo) {
    switch(tipoSuelo) {
        case 'arcilloso':
            return 'Añadir materia orgánica para mejorar el drenaje.';
        case 'arenoso':
            return 'Incorporar compost para aumentar la retención de agua y nutrientes.';
        case 'franco':
            return 'Mantener el equilibrio actual del suelo con fertilización regular.';
        default:
            return 'Realizar un análisis detallado del suelo para determinar las necesidades específicas.';
    }
}

function obtenerRecomendacionRiego(precipitacion) {
    if (precipitacion < 500) {
        return 'Implementar un sistema de riego eficiente para compensar la baja precipitación.';
    } else if (precipitacion < 800) {
        return 'Monitorear la humedad del suelo y proporcionar riego suplementario durante períodos secos.';
    } else {
        return 'El riego natural debería ser suficiente, pero estar preparado para drenar en caso de exceso de lluvia.';
    }
}

function obtenerRecomendacionManejoTemperatura(temperatura) {
    if (temperatura < 10) {
        return 'Considerar el uso de invernaderos o protección contra heladas para especies sensibles.';
    } else if (temperatura > 30) {
        return 'Proporcionar sombra y riego adecuado para prevenir el estrés por calor.';
    } else {
        return 'Las condiciones de temperatura son generalmente favorables para la mayoría de las especies.';
    }
}

function crearGraficaDistribucionArboles(arbolesAdecuados) {
    const ctx = document.getElementById('graficaDistribucionArboles').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: arbolesAdecuados.map(arbol => arbol.nombre),
            datasets: [{
                label: 'Probabilidad de éxito (%)',
                data: arbolesAdecuados.map(arbol => arbol.probabilidad * 100),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución de Probabilidad de Éxito por Especie'
                }
            }
        }
    });
}

function agregarIconosArboles(arbolesAdecuados) {
    const poligono = turf.polygon([vertices]);
    const cajaDelimitadora = turf.bbox(poligono);
    const numeroDeArboles = Math.min(arbolesAdecuados.length * 5, 20);
    
    for (let i = 0; i < numeroDeArboles; i++) {
        const puntoAleatorio = turf.randomPoint(1, {bbox: cajaDelimitadora});
        const coordenadas = puntoAleatorio.features[0].geometry.coordinates;
        
        if (turf.booleanPointInPolygon(puntoAleatorio.features[0], poligono)) {
            const indiceArbol = i % arbolesAdecuados.length;
            const arbol = arbolesAdecuados[indiceArbol];
            
            L.marker([coordenadas[1], coordenadas[0]], {
                icon: L.divIcon({
                    html: arbol.icono,
                    className: 'icono-arbol',
                    iconSize: [20, 20]
                })
            }).addTo(mapa);
        }
    }
}

function mostrarMensaje(mensaje) {
    cajaMensajes.innerHTML = `<p>${mensaje}</p>`;
    cajaMensajes.style.display = 'block';
}

iniciarMapa();
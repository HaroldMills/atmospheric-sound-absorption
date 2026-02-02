/**
 * JavaScript that plots atmospheric sound absorption versus frequency
 * for a single temperature and pressure and several relative humidities.
 */

import { fahrenheitToKelvin, atmToKpa, getAbsorptionCoefficients }
    from './absorption-utils.js';

// Initial environmental conditions. We initialize the sliders and text
// boxes to these values.
const initialTemperature = 68;   // degrees Fahrenheit
const initialPressure = 1;       // atmospheres

// Relative humidities, in percent. The plot includes a trace for each
// of these values.
const humidities = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// plot frequencies
const freqsPerDecade = 40;
const minFreqLog = 1;
const maxFreqLog = 6;
const freqCount = (maxFreqLog - minFreqLog) * freqsPerDecade + 1;
const frequencies = Array.from({ length: freqCount }, (_, i) => {
    const freqLog = minFreqLog + i / freqsPerDecade;
    return 10 ** freqLog;
});

// y-axis limits
const minAlphaLog = -5;
const maxAlphaLog = 2;

const plotMargins = {
    l: 80,
    r: 40,
    b: 80,
    t: 40,
    pad: 4
}

// Get DOM elements.
const temperatureSlider = document.getElementById('temperature-slider');
const temperatureText = document.getElementById('temperature-text');
const pressureSlider = document.getElementById('pressure-slider');
const pressureText = document.getElementById('pressure-text');
const plotDiv = document.getElementById('plot');

// Initialize DOM element values.
temperatureSlider.value = initialTemperature;
temperatureText.value = initialTemperature;
pressureSlider.value = initialPressure;
pressureText.value = initialPressure;

function getEnvironmentalConditions() {
    const t = fahrenheitToKelvin(parseFloat(temperatureSlider.value));
    const p = atmToKpa(parseFloat(pressureSlider.value));
    return { t, p };
}

function getAlphas() {
    const { t, p } = getEnvironmentalConditions();
    return humidities.map(h =>
        getAbsorptionCoefficients(t, p, h, frequencies)[0]);
}

function getLogAxisTicks(minLog, maxLog) {

    const tickvals = [];
    const ticktext = [];

    for (let i = minLog; i <= maxLog; i++) {

        const val = 10 ** i;
        tickvals.push(val);
        ticktext.push(`10<sup>${i}</sup>`);

        if (i < maxLog) {
            for (let j = 2; j < 10; j++) {
                tickvals.push(val * j);
                ticktext.push('');
            }
        }

    }

    return { tickvals, ticktext };

}

function initPlot() {

    const alphas = getAlphas();

    const traces = humidities.map((h, index) => {
        return {
            x: frequencies,
            y: alphas[index],
            mode: 'lines',
            // line: {width: 1},   // nice for high resolution displays
            type: 'scatter',
            name: `${h}`,
        };
    });

    const xTicks = getLogAxisTicks(minFreqLog, maxFreqLog);
    const yTicks = getLogAxisTicks(minAlphaLog, maxAlphaLog);

    const layout = {
        xaxis: {
            title: {text: 'Frequency (Hz)'},
            showgrid: true,
            type: 'log',
            range: [minFreqLog, maxFreqLog],
            tickvals: xTicks.tickvals,
            ticktext: xTicks.ticktext
        },
        yaxis: {
            title: {text: 'Absorption Coefficient (dB/m)'},
            showgrid: true,
            type: 'log',
            range: [minAlphaLog, maxAlphaLog],
            tickvals: yTicks.tickvals,
            ticktext: yTicks.ticktext
        },
        legend: {
            xanchor: 'left',
            yanchor: 'top',
            x: 0.05,
            y: 0.98,
            bgcolor: 'rgba(255, 255, 255, 0)',
            title: {text: '%RH:'},
        },
        margin: plotMargins,
    };

    // Make plot respond to window resizes.
    const config = { responsive: true };

    Plotly.newPlot(plotDiv, traces, layout, config);

}

function updatePlot() {
    const alphas = getAlphas();
    const update = { y: alphas };
    Plotly.update(plotDiv, update);
}

// Update DOM element value and update plot after input event.
function updateValue(element, event) {
    element.value = event.target.value;
    updatePlot();
}

// Add event listeners for a slider and text box pair.
function addEventListeners(slider, text) {
    slider.addEventListener('input', e => updateValue(text, e));
    text.addEventListener('input', e => updateValue(slider, e));
}

addEventListeners(temperatureSlider, temperatureText);
addEventListeners(pressureSlider, pressureText);

initPlot();

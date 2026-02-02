/**
 * JavaScript that plots atmospheric sound absorption versus frequency for
 * a single temperature, pressure, and relative humidity.
 */

// TODO: Update constant names.
// TODO: Modify `getEnvironmentalConditions` to return list.

import { fahrenheitToKelvin, atmToKpa, getAbsorptionCoefficients }
    from './absorption-utils.js';

// Initial environmental conditions. We initialize the sliders and text
// boxes to these values.
const INITIAL_TEMPERATURE = 68;   // degrees Fahrenheit
const INITIAL_PRESSURE = 1;       // atmospheres
const INITIAL_HUMIDITY = 50;      // percent

// plot frequencies
const FREQS_PER_DECADE = 40;
const MIN_FREQ_LOG = 1;
const MAX_FREQ_LOG = 6;
const FREQ_COUNT = (MAX_FREQ_LOG - MIN_FREQ_LOG) * FREQS_PER_DECADE + 1;
const FREQUENCIES = Array.from({ length: FREQ_COUNT }, (_, i) => {
    const freqLog = MIN_FREQ_LOG + i / FREQS_PER_DECADE;
    return 10 ** freqLog;
});

// y-axis limits
const MIN_ALPHA_LOG = -5;
const MAX_ALPHA_LOG = 2;

const traceInfos = [
    {
        name: 'Total',
        color: 'black',
        dash: 'solid'
    },
    {
        name: 'O<sub>2</sub>',
        color: 'rgba(255, 0, 0, .5)',
        dash: 'dash'
    },
    {
        name: 'N<sub>2</sub>',
        color: 'rgba(0, 0, 255, .5)',
        dash: 'dash'
    },
    {
        name: 'Other',
        color: 'rgba(0, 128, 0, .5)',
        dash: 'dash'
    }
];

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
const humiditySlider = document.getElementById('humidity-slider');
const humidityText = document.getElementById('humidity-text');
const plotDiv = document.getElementById('plot');

// Initialize DOM element values.
temperatureSlider.value = INITIAL_TEMPERATURE;
temperatureText.value = INITIAL_TEMPERATURE;
pressureSlider.value = INITIAL_PRESSURE;
pressureText.value = INITIAL_PRESSURE;
humiditySlider.value = INITIAL_HUMIDITY;
humidityText.value = INITIAL_HUMIDITY;

function getEnvironmentalConditions() {
    const t = fahrenheitToKelvin(parseFloat(temperatureSlider.value));
    const p = atmToKpa(parseFloat(pressureSlider.value));
    const h = parseFloat(humiditySlider.value);
    return { t, p, h };
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

    const { t, p, h } = getEnvironmentalConditions();

    const alphas = getAbsorptionCoefficients(t, p, h, FREQUENCIES);

    const traces = traceInfos.map((info, index) => {
        return {
            x: FREQUENCIES,
            y: alphas[index],
            mode: 'lines',
            line: {
                color: info.color,
                dash: info.dash
            },
            type: 'scatter',
            name: info.name,
        };
    });

    const xTicks = getLogAxisTicks(MIN_FREQ_LOG, MAX_FREQ_LOG);
    const yTicks = getLogAxisTicks(MIN_ALPHA_LOG, MAX_ALPHA_LOG);

    const layout = {
        xaxis: {
            title: {text: 'Frequency (Hz)'},
            showgrid: true,
            type: 'log',
            range: [MIN_FREQ_LOG, MAX_FREQ_LOG],
            tickvals: xTicks.tickvals,
            ticktext: xTicks.ticktext
        },
        yaxis: {
            title: {text: 'Absorption Coefficient (dB/m)'},
            showgrid: true,
            type: 'log',
            range: [MIN_ALPHA_LOG, MAX_ALPHA_LOG],
            tickvals: yTicks.tickvals,
            ticktext: yTicks.ticktext
        },
        legend: {
            xanchor: 'left',
            yanchor: 'top',
            x: 0.05,
            y: 0.98,
            bgcolor: 'rgba(255, 255, 255, 0)',
        },
        margin: plotMargins,
    };

    // Make plot respond to window resizes.
    const config = { responsive: true };

    Plotly.newPlot(plotDiv, traces, layout, config);

}

function updatePlot() {
    const { t, p, h } = getEnvironmentalConditions();
    const alphas = getAbsorptionCoefficients(t, p, h, FREQUENCIES);
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
addEventListeners(humiditySlider, humidityText);

initPlot();

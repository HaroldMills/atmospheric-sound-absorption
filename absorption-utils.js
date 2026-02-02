/* Utilities concerning atmospheric sound absorption coefficients. */

// Reference atmospheric temperature in Kelvin.
const T0 = 293.15;   // 20 degrees Celsius

// Triple-point isotherm temperature in Kelvin.
const T01 = 273.16;

// Reference atmospheric pressure in kPa.
const pr = 101.325;

export function fahrenheitToKelvin(t) {
    return 273.15 + (t - 32) * 5. / 9.;
}

export function atmToKpa(p) {
    return pr * p;
}

export function kpaToAtm(p) {
    return p / pr;
}

export function getAbsorptionCoefficients(t, pa, hr, frequencies) {

    /*
    Compute atmospheric sound absorption coefficients for the specified
    temperature, atmospheric pressure, and relative humidity at the
    specified frequencies.

    The equations used by this function to compute relaxation frequencies
    and absorption coefficients are from the ISO standard ISO 9613-1:1993(E),
    "Acoustics -- Attenuation of sound during propagation outdoors --
    Part 1: Calculation of the absorption of sound by the atmosphere". The
    equations for saturation vapor pressure and absolute humidity are from
    Appendix B of David Blackstock's "Fundamentals of Physical Acoustics",
    Wiley, 2000. Other useful references include Bass et al. "Atmospheric
    absorption of sound: Further developments", J. Acoust. Soc. Am. 97(1),
    pp. 680-683, January 1995, and the associated erratum published in
    J. Acoust. Soc. Am. 99(2), p. 1259, February 1996.

    Input parameters:
    t: Temperature in Kelvin.
    pa: Ambient atmospheric pressure in kPa.
    hr: Relative humidity in percent.
    frequencies: Array of frequencies in Hz at which to compute
        absorption coefficients.

    Return value:
    A 2D array of absorption coefficients in dB per meter. The first
    dimension has length 4, corresponding to total absorption,
    absorption due to oxygen relaxation, absorption due to nitrogen
    relaxation, and absorption due to other effects. The second
    dimension corresponds to the input frequencies.
    */

    const tRatio = t / T0;
    const pRatio = kpaToAtm(pa);

    // Get saturation vapor pressure in atm. See Blackstock equation B-4.
    const psat = 10 ** (-6.8346 * (T01 / t) ** 1.261 + 4.6151);

    // Get absolute humidity in percent. See Blackstock equation B-3.
    const h = hr * psat / pRatio;

    // Get oxygen relaxation frequency in Hz. See ISO 9613-1 equation 3.
    const frO = pRatio * (24 + 4.04e4 * h * (0.02 + h) / (0.391 + h));

    // Get nitrogen relaxation frequency in Hz. See ISO 9613-1 equation 4.
    const frN = pRatio * tRatio ** -0.5 *
        (9 + 280 * h * Math.exp(-4.170 * (tRatio ** (-1 / 3) - 1)));

    // Nepers to dB conversion factor from ISO 9613-1 equation 5.
    const nepersToDb = 8.686;

    // Get scale factor for computing coefficient of absorption due to
    // oxygen relaxation. This is part of ISO 9613-1 equation 5.
    const cO = nepersToDb * tRatio ** -2.5 * 0.01275 * Math.exp(-2239.1 / t);
    
    // Get scale factor for computing coefficient of absorption due to
    // nitrogen relaxation. This is part of ISO 9613-1 equation 5.
    const cN = nepersToDb * tRatio ** -2.5 * 0.1068 * Math.exp(-3352.0 / t);
    // Get scale factor for computing coefficient of absorption due to
    // other effects. This is part of ISO 9613-1 equation 5.
    const cOther = nepersToDb * 1.84e-11 / pRatio * tRatio ** 0.5;

    // Arrays in which to collect absorption coefficients.
    const alphaOs = [];
    const alphaNs = [];
    const alphaOthers = [];
    const alphaTotals = [];

    for (const f of frequencies) {

        const f2 = f * f;

        // Get coefficients of absorption due to oxygen relaxation,
        // nitrogen relaxation, and other effects in dB per meter.
        // These are the top-level summands of ISO 9613-1 equation 5.
        const alphaO = cO * f2 / (frO + f2 / frO);
        const alphaN = cN * f2 / (frN + f2 / frN);
        const alphaOther = cOther * f2;

        // Get total absorption coefficient.
        const alphaTotal = alphaO + alphaN + alphaOther;

        // Append coefficients to arrays.
        alphaOs.push(alphaO);
        alphaNs.push(alphaN);
        alphaOthers.push(alphaOther);
        alphaTotals.push(alphaTotal);

    }

    return [alphaTotals, alphaOs, alphaNs, alphaOthers];

}

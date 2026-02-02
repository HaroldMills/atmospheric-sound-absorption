from acoustics.atmosphere import Atmosphere


def get_absorption_coefficients(t, p, h, f):
    t = fahrenheit_to_kelvin(t)
    p = atm_to_kpa(p)
    a = Atmosphere(temperature=t, pressure=p, relative_humidity=h)
    return a.attenuation_coefficient(f)


def fahrenheit_to_kelvin(t):
    return 273.15 + (t - 32) * 5 / 9


def atm_to_kpa(p):
    return 101.325 * p

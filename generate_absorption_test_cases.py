# This script writes a CSV file of test cases for code that computes
# atmospheric sound absorption coefficients.
#
# The CSV file contains a header line followed by the test cases, one
# per line. The temperature, pressure, relative humidity, and frequency
# of each test case are selected randomly from the ranges specified below.
# The script uses the `python-acoustics` package
# (https://pypi.org/project/acoustics/) to compute the expected absorption
# coefficient from these parameters.


import csv
import random

import absorption_utils as utils


T_RANGE = (-20, 120)      # °F
P_RANGE = (0.01, 1.1)     # atm
H_RANGE = (0, 100)        # %
F_LOG10_RANGE = (1, 6)    # Hz base 10 logarithm

OUTPUT_FILE_NAME = 'absorption_test_cases.csv'
CASE_COUNT = 10000


def main():

    with open(OUTPUT_FILE_NAME, 'w', newline='') as csvfile:

        writer = csv.writer(csvfile)

        writer.writerow([
            'Temperature (°F)', 'Pressure (atm)', 'Relative Humidity (%)',
            'Frequency (Hz)', 'Absorption Coefficient (dB/m)'])
        
        for _ in range(CASE_COUNT):

            t = random.uniform(*T_RANGE)
            p = random.uniform(*P_RANGE)
            h = random.uniform(*H_RANGE)
            f = 10 ** random.uniform(*F_LOG10_RANGE)
            alpha = utils.get_absorption_coefficients(t, p, h, f)

            writer.writerow([t, p, h, f, alpha])


if __name__ == '__main__':
    main()

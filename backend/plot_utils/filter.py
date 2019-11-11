"""
Some filters for plotting
"""
from typing import List

import numpy as np
from scipy import signal


def lowpass(x: List[float], order: int=2, cutoff: float=0.05) -> List[float]:
    b, a = signal.butter(order, cutoff)

    # estimate impulse response length of filter
    z, p, k = signal.tf2zpk(b, a)
    eps = 1e-9
    r = np.max(np.abs(p))
    approx_impulse_len = int(np.ceil(np.log(eps) / np.log(r)))

    # apply gustafson filter
    fgust = signal.filtfilt(b, a, x, method="gust", irlen=approx_impulse_len)

    return list(fgust)


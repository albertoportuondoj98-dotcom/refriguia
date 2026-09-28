# Genera pt.js: presión de saturación (vapor, psig) de -40 a 70 °C, paso 1 °C, con CoolProp.
import json
from CoolProp.CoolProp import PropsSI
ATM = 101325.0
GASES = [("R22", "R22"), ("R410A", "R410A"), ("R32", "R32"), ("R290", "Propane")]
out = {}
for nombre, cp in GASES:
    filas = []
    for c in range(-40, 71):
        p = PropsSI("P", "T", c + 273.15, "Q", 1, cp)
        filas.append(round((p - ATM) / 6894.757, 1))
    out[nombre] = {"tmin": -40, "psig": filas}
with open("pt.js", "w", encoding="utf-8") as f:
    f.write("// Tablas presión-temperatura (vapor saturado, psig) generadas con CoolProp (gen_pt.py). Índice 0 = -40 °C, paso 1 °C.\n")
    f.write("const PT=" + json.dumps(out, separators=(",", ":")) + ";\n")

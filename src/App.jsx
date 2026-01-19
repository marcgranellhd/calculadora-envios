import React, { useEffect, useMemo, useState } from "react";

// Calculadora volumétrica GLS — envío consolidado (UI completa)
// - Consolida cada fila como un SOLO envío con apilado restringido: SOLO crece el ANCHO por cantidad
// - Muestra dimensiones del bloque optimizado (L×A×H)
// - Selector de servicio (divisor), tarifa (nacional/internacional) y país/zona
// - Cálculo del mayor entre real total y volumétrico total del bloque
// - Incrementos: nacional desde 15.01 kg, internacional desde 40.01 kg
// - Totales y guía visual (SVG) al final

export default function GLSVolumetricCalculator() {
  // ======================
  // Tarifas (ejemplo parcial; puedes ampliarlas según el PDF)
  // ======================
  const TARIFAS = {
  // Nacional
  "EXPRESS 10:30": {
    PENINSULAR: {
      nombre: "PENINSULAR",
      brackets: [
        { hasta: 1, precio: 10.20 },
        { hasta: 3, precio: 10.29 },
        { hasta: 5, precio: 11.29 },
        { hasta: 10, precio: 12.85 },
        { hasta: 15, precio: 15.97 },
      ],
      overflow: { desde: 15, base: 15.97, pasoKg: 1, incPrecio: 0.74 },
    },
  },
  "EXPRESS 14:00": {
    PENINSULAR: {
      nombre: "PENINSULAR",
      brackets: [
        { hasta: 1, precio: 4.48 },
        { hasta: 3, precio: 4.63 },
        { hasta: 5, precio: 4.86 },
        { hasta: 10, precio: 5.80 },
        { hasta: 15, precio: 9.58 },
      ],
      overflow: { desde: 15, base: 9.58, pasoKg: 1, incPrecio: 0.54 },
    },
    PROVINCIAL: {
      nombre: "PROVINCIAL",
      brackets: [
        { hasta: 1, precio: 3.80 },
        { hasta: 3, precio: 4.11 },
        { hasta: 5, precio: 4.43 },
        { hasta: 10, precio: 5.17 },
        { hasta: 15, precio: 7.96 },
      ],
      overflow: { desde: 15, base: 7.96, pasoKg: 1, incPrecio: 0.33 },
    },
    REGIONAL: {
      nombre: "REGIONAL",
      brackets: [
        { hasta: 1, precio: 4.22 },
        { hasta: 3, precio: 4.48 },
        { hasta: 5, precio: 4.70 },
        { hasta: 10, precio: 5.38 },
        { hasta: 15, precio: 8.86 },
      ],
      overflow: { desde: 15, base: 8.86, pasoKg: 1, incPrecio: 0.48 },
    },
  },
  "EXPRESS 19:00": {
    PENINSULAR: {
      nombre: "PENINSULAR",
      brackets: [
        { hasta: 1, precio: 4.01 },
        { hasta: 3, precio: 4.04 },
        { hasta: 5, precio: 4.22 },
        { hasta: 10, precio: 4.66 },
        { hasta: 15, precio: 8.65 },
      ],
      overflow: { desde: 15, base: 8.65, pasoKg: 1, incPrecio: 0.43 },
    },
    PROVINCIAL: {
      nombre: "PROVINCIAL",
      brackets: [
        { hasta: 1, precio: 2.83 },
        { hasta: 3, precio: 3.08 },
        { hasta: 5, precio: 3.61 },
        { hasta: 10, precio: 4.09 },
        { hasta: 15, precio: 5.51 },
      ],
      overflow: { desde: 15, base: 5.51, pasoKg: 1, incPrecio: 0.28 },
    },
    REGIONAL: {
      nombre: "REGIONAL",
      brackets: [
        { hasta: 1, precio: 3.39 },
        { hasta: 3, precio: 3.50 },
        { hasta: 5, precio: 3.83 },
        { hasta: 10, precio: 4.54 },
        { hasta: 15, precio: 7.98 },
      ],
      overflow: { desde: 15, base: 7.98, pasoKg: 1, incPrecio: 0.39 },
    },
  },
  "ECONOMY PARCEL": {
    PENINSULAR: {
      nombre: "PENINSULAR",
      brackets: [
        { hasta: 1, precio: 3.93 },
        { hasta: 3, precio: 3.96 },
        { hasta: 5, precio: 4.14 },
        { hasta: 10, precio: 4.56 },
        { hasta: 15, precio: 8.48 },
      ],
      overflow: { desde: 15, base: 8.48, pasoKg: 1, incPrecio: 0.42 },
    },
    PROVINCIAL: {
      nombre: "PROVINCIAL",
      brackets: [
        { hasta: 1, precio: 2.78 },
        { hasta: 3, precio: 3.02 },
        { hasta: 5, precio: 3.53 },
        { hasta: 10, precio: 4.01 },
        { hasta: 15, precio: 5.40 },
      ],
      overflow: { desde: 15, base: 5.40, pasoKg: 1, incPrecio: 0.27 },
    },
    REGIONAL: {
      nombre: "REGIONAL",
      brackets: [
        { hasta: 1, precio: 3.32 },
        { hasta: 3, precio: 3.43 },
        { hasta: 5, precio: 3.75 },
        { hasta: 10, precio: 4.45 },
        { hasta: 15, precio: 7.82 },
      ],
      overflow: { desde: 15, base: 7.82, pasoKg: 1, incPrecio: 0.38 },
    },
  },

  // Internacional (0004 INTERNACIONAL)
  "INTERNACIONAL": {
    ALEMANIA: {
      nombre: "ALEMANIA",
      brackets: [
        { hasta: 1, precio: 6.00 },
        { hasta: 2, precio: 6.95 },
        { hasta: 3, precio: 7.87 },
        { hasta: 4, precio: 8.16 },
        { hasta: 5, precio: 8.46 },
        { hasta: 6, precio: 12.15 },
        { hasta: 7, precio: 12.26 },
        { hasta: 8, precio: 12.99 },
        { hasta: 9, precio: 13.30 },
        { hasta: 10, precio: 13.50 },
        { hasta: 15, precio: 15.66 },
        { hasta: 20, precio: 17.68 },
        { hasta: 30, precio: 24.20 },
        { hasta: 40, precio: 29.16 },
      ],
      overflow: { desde: 40, base: 29.16, pasoKg: 1, incPrecio: 0.97 },
    },
    AUSTRIA: {
      nombre: "AUSTRIA",
      brackets: [
        { hasta: 1, precio: 9.52 },
        { hasta: 3, precio: 12.37 },
        { hasta: 5, precio: 13.80 },
        { hasta: 7, precio: 14.37 },
        { hasta: 10, precio: 15.81 },
        { hasta: 15, precio: 17.29 },
        { hasta: 20, precio: 19.32 },
        { hasta: 30, precio: 22.44 },
        { hasta: 40, precio: 32.90 },
      ],
      overflow: { desde: 40, base: 32.90, pasoKg: 1, incPrecio: 1.09 },
    },
    BELGICA: {
      nombre: "BELGICA",
      brackets: [
        { hasta: 1, precio: 9.52 },
        { hasta: 3, precio: 11.41 },
        { hasta: 5, precio: 12.38 },
        { hasta: 7, precio: 12.67 },
        { hasta: 10, precio: 14.31 },
        { hasta: 15, precio: 16.11 },
        { hasta: 20, precio: 18.09 },
        { hasta: 30, precio: 21.35 },
        { hasta: 40, precio: 26.66 },
      ],
      overflow: { desde: 40, base: 26.66, pasoKg: 1, incPrecio: 0.89 },
    },
    BULGARIA: {
      nombre: "BULGARIA",
      brackets: [
        { hasta: 1, precio: 18.75 },
        { hasta: 3, precio: 22.70 },
        { hasta: 5, precio: 25.18 },
        { hasta: 7, precio: 26.61 },
        { hasta: 10, precio: 30.12 },
        { hasta: 15, precio: 33.09 },
        { hasta: 20, precio: 37.72 },
        { hasta: 30, precio: 47.08 },
        { hasta: 40, precio: 59.55 },
      ],
      overflow: { desde: 40, base: 59.55, pasoKg: 1, incPrecio: 1.99 },
    },
    DINAMARCA: {
      nombre: "DINAMARCA",
      brackets: [
        { hasta: 1, precio: 9.52 },
        { hasta: 3, precio: 12.37 },
        { hasta: 5, precio: 13.80 },
        { hasta: 7, precio: 14.37 },
        { hasta: 10, precio: 15.81 },
        { hasta: 15, precio: 17.29 },
        { hasta: 20, precio: 19.32 },
        { hasta: 30, precio: 22.44 },
        { hasta: 40, precio: 32.90 },
      ],
      overflow: { desde: 40, base: 32.90, pasoKg: 1, incPrecio: 1.09 },
    },
    FRANCIA: {
      nombre: "FRANCIA",
      brackets: [
        { hasta: 1, precio: 8.81 },
        { hasta: 3, precio: 10.73 },
        { hasta: 5, precio: 11.66 },
        { hasta: 7, precio: 12.67 },
        { hasta: 10, precio: 14.23 },
        { hasta: 15, precio: 16.55 },
        { hasta: 20, precio: 19.32 },
        { hasta: 30, precio: 21.99 },
        { hasta: 40, precio: 31.33 },
      ],
      overflow: { desde: 40, base: 31.33, pasoKg: 1, incPrecio: 1.04 },
    },
    GRECIA: {
      nombre: "GRECIA",
      brackets: [
        { hasta: 1, precio: 22.14 },
        { hasta: 2, precio: 22.87 },
        { hasta: 3, precio: 23.85 },
        { hasta: 4, precio: 31.44 },
        { hasta: 5, precio: 39.02 },
        { hasta: 7, precio: 44.76 },
        { hasta: 10, precio: 59.61 },
        { hasta: 15, precio: 74.05 },
        { hasta: 20, precio: 91.75 },
        { hasta: 30, precio: 129.65 },
        { hasta: 40, precio: 147.16 },
      ],
      overflow: { desde: 40, base: 147.16, pasoKg: 1, incPrecio: 3.68 },
    },
    HOLANDA: {
      nombre: "HOLANDA",
      brackets: [
        { hasta: 1, precio: 9.52 },
        { hasta: 3, precio: 12.37 },
        { hasta: 5, precio: 13.80 },
        { hasta: 7, precio: 14.37 },
        { hasta: 10, precio: 15.81 },
        { hasta: 15, precio: 17.29 },
        { hasta: 20, precio: 19.32 },
        { hasta: 30, precio: 22.44 },
        { hasta: 40, precio: 32.90 },
      ],
      overflow: { desde: 40, base: 32.90, pasoKg: 1, incPrecio: 1.09 },
    },
    HUNGRIA: {
      nombre: "HUNGRIA",
      brackets: [
        { hasta: 1, precio: 18.75 },
        { hasta: 3, precio: 30.17 },
        { hasta: 5, precio: 36.14 },
        { hasta: 7, precio: 36.71 },
        { hasta: 10, precio: 40.25 },
        { hasta: 15, precio: 41.00 },
        { hasta: 20, precio: 43.65 },
        { hasta: 30, precio: 53.63 },
        { hasta: 40, precio: 62.36 },
      ],
      overflow: { desde: 40, base: 62.36, pasoKg: 1, incPrecio: 2.08 },
    },
    IRLANDA: {
      nombre: "IRLANDA",
      brackets: [
        { hasta: 1, precio: 14.00 },
        { hasta: 3, precio: 17.34 },
        { hasta: 5, precio: 20.67 },
        { hasta: 7, precio: 24.01 },
        { hasta: 10, precio: 29.34 },
        { hasta: 15, precio: 38.01 },
        { hasta: 20, precio: 46.01 },
        { hasta: 30, precio: 62.02 },
        { hasta: 40, precio: 84.69 },
      ],
      overflow: { desde: 40, base: 84.69, pasoKg: 1, incPrecio: 2.12 },
    },
    ITALIA: {
      nombre: "ITALIA",
      brackets: [
        { hasta: 1, precio: 9.80 },
        { hasta: 3, precio: 12.37 },
        { hasta: 5, precio: 13.37 },
        { hasta: 7, precio: 14.37 },
        { hasta: 10, precio: 16.41 },
        { hasta: 15, precio: 17.89 },
        { hasta: 20, precio: 20.43 },
        { hasta: 30, precio: 23.39 },
        { hasta: 40, precio: 33.05 },
      ],
      overflow: { desde: 40, base: 33.05, pasoKg: 1, incPrecio: 1.10 },
    },
    LETONIA: {
      nombre: "LETONIA",
      brackets: [
        { hasta: 1, precio: 18.90 },
        { hasta: 3, precio: 20.35 },
        { hasta: 5, precio: 25.29 },
        { hasta: 7, precio: 26.71 },
        { hasta: 10, precio: 32.55 },
        { hasta: 15, precio: 36.87 },
        { hasta: 20, precio: 41.32 },
        { hasta: 30, precio: 57.95 },
        { hasta: 40, precio: 66.20 },
      ],
      overflow: { desde: 40, base: 66.20, pasoKg: 1, incPrecio: 1.66 },
    },
    LUXEMBURGO: {
      nombre: "LUXEMBURGO",
      brackets: [
        { hasta: 1, precio: 9.52 },
        { hasta: 3, precio: 12.37 },
        { hasta: 5, precio: 13.80 },
        { hasta: 7, precio: 14.37 },
        { hasta: 10, precio: 15.81 },
        { hasta: 15, precio: 17.29 },
        { hasta: 20, precio: 19.32 },
        { hasta: 30, precio: 22.44 },
        { hasta: 40, precio: 32.90 },
      ],
      overflow: { desde: 40, base: 32.90, pasoKg: 1, incPrecio: 1.09 },
    },
    POLONIA: {
      nombre: "POLONIA",
      brackets: [
        { hasta: 1, precio: 10.37 },
        { hasta: 2, precio: 10.70 },
        { hasta: 3, precio: 11.16 },
        { hasta: 4, precio: 13.25 },
        { hasta: 5, precio: 15.34 },
        { hasta: 7, precio: 16.76 },
        { hasta: 10, precio: 19.71 },
        { hasta: 15, precio: 21.32 },
        { hasta: 20, precio: 22.30 },
        { hasta: 25, precio: 24.69 },
        { hasta: 30, precio: 31.14 },
        { hasta: 35, precio: 37.60 },
        { hasta: 40, precio: 40.27 },
      ],
      overflow: { desde: 40, base: 40.27, pasoKg: 1, incPrecio: 1.00 },
    },
    "REPUBLICA CHECA": {
      nombre: "REPUBLICA CHECA",
      brackets: [
        { hasta: 1, precio: 9.65 },
        { hasta: 2, precio: 9.97 },
        { hasta: 3, precio: 10.40 },
        { hasta: 4, precio: 12.16 },
        { hasta: 5, precio: 13.92 },
        { hasta: 7, precio: 14.48 },
        { hasta: 10, precio: 17.14 },
        { hasta: 15, precio: 19.33 },
        { hasta: 20, precio: 20.92 },
        { hasta: 25, precio: 25.04 },
        { hasta: 30, precio: 29.50 },
        { hasta: 35, precio: 33.96 },
        { hasta: 40, precio: 36.62 },
      ],
      overflow: { desde: 40, base: 36.62, pasoKg: 1, incPrecio: 0.92 },
    },
    RUMANIA: {
      nombre: "RUMANIA",
      brackets: [
        { hasta: 1, precio: 18.75 },
        { hasta: 3, precio: 22.70 },
        { hasta: 5, precio: 25.18 },
        { hasta: 7, precio: 26.61 },
        { hasta: 10, precio: 30.12 },
        { hasta: 15, precio: 33.09 },
        { hasta: 20, precio: 37.72 },
        { hasta: 30, precio: 47.08 },
        { hasta: 40, precio: 59.55 },
      ],
      overflow: { desde: 40, base: 59.55, pasoKg: 1, incPrecio: 1.99 },
    },
    SUECIA: {
      nombre: "SUECIA",
      brackets: [
        { hasta: 1, precio: 18.75 },
        { hasta: 3, precio: 22.70 },
        { hasta: 5, precio: 25.18 },
        { hasta: 7, precio: 26.61 },
        { hasta: 10, precio: 30.12 },
        { hasta: 15, precio: 33.09 },
        { hasta: 20, precio: 37.72 },
        { hasta: 30, precio: 47.08 },
        { hasta: 40, precio: 59.55 },
      ],
      overflow: { desde: 40, base: 59.55, pasoKg: 1, incPrecio: 1.99 },
    },
    SUIZA: {
      nombre: "SUIZA",
      brackets: [
        { hasta: 1, precio: 12.08 },
        { hasta: 2, precio: 12.48 },
        { hasta: 3, precio: 13.00 },
        { hasta: 4, precio: 16.10 },
        { hasta: 5, precio: 19.18 },
        { hasta: 7, precio: 19.75 },
        { hasta: 10, precio: 23.24 },
        { hasta: 15, precio: 26.44 },
        { hasta: 20, precio: 28.70 },
        { hasta: 25, precio: 33.69 },
        { hasta: 30, precio: 38.92 },
        { hasta: 35, precio: 44.17 },
        { hasta: 40, precio: 46.84 },
      ],
      overflow: { desde: 40, base: 46.84, pasoKg: 1, incPrecio: 1.17 },
    },
  },
};

  // ======================
  // Presets de volumétrico
  // ======================
  const SERVICE_PRESETS = {
    "Nacional (según contrato)": { divisor: 4000, editable: true, note: "m³ = 250 kg ⇒ 1e6/250 = 4000 (según contrato)" },
    "Internacional Express (avión)": { divisor: 5000, editable: false, note: "m3→200 kg ⇒ 1e6/200 = 5000" },
    "Internacional Economy (carretera)": { divisor: 4000, editable: false, note: "m3→250 kg ⇒ 1e6/250 = 4000" },
    Personalizado: { divisor: 6000, editable: true },
  };

  // ======================
  // Estado
  // ======================
  const niceId = () => Math.random().toString(36).slice(2, 9);
  const [service, setService] = useState("Nacional (según contrato)");
  const [divisor, setDivisor] = useState(SERVICE_PRESETS["Nacional (según contrato)"].divisor);
  const [packages, setPackages] = useState([
    { id: niceId(), largo: "", ancho: "", alto: "", pesoReal: "", cantidad: 1 },
  ]);
  const [tarifario, setTarifario] = useState({ servicio: "INTERNACIONAL", trayecto: "ALEMANIA" });
  const [redondeoEntero, setRedondeoEntero] = useState(true);

  // ======================
  // Helpers
  // ======================
  const getTarifaActual = () => {
    const s = TARIFAS[tarifario.servicio];
    if (!s) return null;
    return s[tarifario.trayecto];
  };

  // Cálculo de precio: Internacional ≤ 40 kg usa tabla exacta (sin incremento), > 40 kg overflow por kg.
  // Nacional: usa redondeo opcional a entero y overflow desde 15.01 kg.
  const calcularPrecio = (peso, tarifa, round = redondeoEntero) => {
  if (!tarifa || !isFinite(peso)) return null;
  const isIntl = tarifario.servicio.toString().startsWith("INTERNACIONAL");

  if (isIntl) {
    const w = peso; // Internacional NO redondea antes de tabla
    if (w <= 40) {
      const need = Math.max(1, Math.ceil(w));
      const sorted = [...tarifa.brackets].sort((a, b) => a.hasta - b.hasta);
      const chosen = sorted.find((b) => need <= b.hasta) || sorted[sorted.length - 1];
      return chosen?.precio ?? null;
    }
    if (tarifa.overflow) {
      const { desde, base, pasoKg, incPrecio } = tarifa.overflow;
      const pasos = Math.ceil((w - desde) / pasoKg);
      return base + pasos * incPrecio;
    }
    return null;
  }

  // Nacional
  const w = round ? Math.ceil(peso) : peso;
  const bNat = tarifa.brackets.find((b) => w <= b.hasta + 1e-9);
  if (bNat) return bNat.precio;
  if (tarifa.overflow) {
    const { desde, base, pasoKg, incPrecio } = tarifa.overflow;
    const pasos = Math.ceil((w - desde) / pasoKg);
    return base + pasos * incPrecio;
  }
  return null;
};

  // Apilado RESTRINGIDO: solo crece el ANCHO con la cantidad
  const packPreferAncho = (
    l,
    a,
    h,
    q
  ) => {
    const Q = Math.max(1, Math.ceil(q));
    const nA = Q; // todo en profundidad
    const nL = 1; // largo fijo
    const nH = 1; // alto fijo
    const Lb = nL * l;
    const Ab = nA * a;
    const Hb = nH * h;
    return { vol: Lb * Ab * Hb, arrangement: [nL, nA, nH], dims: [Lb, Ab, Hb] };
  };

  const updatePkg = (id, field, v) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: v === "" ? "" : Number(v) } : p)));
  };
  const addRow = () => setPackages((prev) => [...prev, { id: niceId(), largo: "", ancho: "", alto: "", pesoReal: "", cantidad: 1 }]);
  const removeRow = (id) => setPackages((prev) => prev.filter((p) => p.id !== id));
  const clearAll = () => setPackages([{ id: niceId(), largo: "", ancho: "", alto: "", pesoReal: "", cantidad: 1 }]);

  const rows = useMemo(() => {
    const tarifa = getTarifaActual();
    return packages.map((p) => {
      const validDims = [p.largo, p.ancho, p.alto].every((n) => typeof n === "number" && n > 0);
      const validQty = typeof p.cantidad === "number" && p.cantidad > 0;
      const q = validQty ? p.cantidad : NaN;
      const realUnit = typeof p.pesoReal === "number" && p.pesoReal >= 0 ? p.pesoReal : NaN;

      let volKgTotal = NaN;
      let dimsOpt = null;
      let arr = null;
      if (validDims && divisor > 0 && validQty) {
        const L = p.largo, A = p.ancho, H = p.alto;
        const packed = packPreferAncho(L, A, H, q);
        volKgTotal = packed.vol / divisor;
        dimsOpt = packed.dims;
        arr = packed.arrangement;
      }

      const realTotal = (!isNaN(realUnit) && !isNaN(q)) ? realUnit * q : NaN;
      const facturableTotal = (isNaN(volKgTotal) && isNaN(realTotal)) ? NaN : Math.max(isNaN(realTotal) ? 0 : realTotal, isNaN(volKgTotal) ? 0 : volKgTotal);
      const precioLinea = calcularPrecio(facturableTotal, tarifa);
      const totalLinea = (precioLinea != null && !isNaN(facturableTotal)) ? precioLinea : NaN;

      return { ...p, volumetricTotal: volKgTotal, realTotal, facturableTotal, precioLinea, totalLinea, dimsOpt, arr };
    });
  }, [packages, divisor, tarifario, redondeoEntero]);

  const totals = useMemo(() => {
    const totalVol = rows.reduce((acc, r) => acc + (isNaN(r.volumetricTotal) ? 0 : r.volumetricTotal), 0);
    const totalReal = rows.reduce((acc, r) => acc + (isNaN(r.realTotal) ? 0 : r.realTotal), 0);
    const totalFact = rows.reduce((acc, r) => acc + (isNaN(r.totalLinea) ? 0 : r.totalLinea), 0);
    return { totalVol, totalReal, totalFact };
  }, [rows]);

  const servicioKeys = Object.keys(TARIFAS);
  const trayectoKeys = useMemo(() => {
    const s = TARIFAS[tarifario.servicio];
    if (!s) return [];
    return Object.keys(s).filter((k) => {
      const t = s[k];
      return Array.isArray(t?.brackets) && t.brackets.length > 0;
    });
  }, [tarifario.servicio]);

  // ======================
  // Tests rápidos (consola)
  // ======================
  useEffect(() => {
  const eq = (a, b, eps = 1e-6) => a != null && Math.abs(a - b) < eps;
  // Nacional
  console.assert(eq(calcularPrecio(14, TARIFAS["EXPRESS 19:00"].PENINSULAR, true), 8.65), "EXPRESS 19:00 14 kg = 8.65");
  console.assert(eq(calcularPrecio(16, TARIFAS["EXPRESS 19:00"].PENINSULAR, true), 9.08), "EXPRESS 19:00 16 kg = 9.08");
  console.assert(eq(calcularPrecio(12, TARIFAS["EXPRESS 14:00"].REGIONAL, true), 5.38), "EXPRESS 14:00 REGIONAL 12 kg = 5.38");
  // Internacional (≤40 usa tabla por HASTA; >40 overflow)
  const de = TARIFAS["INTERNACIONAL"].ALEMANIA;
  console.assert(eq(calcularPrecio(33.6, de, false), 29.16), "INTL DE 33.6 kg → banda hasta 40 kg (29.16)");
  console.assert(eq(calcularPrecio(40, de, false), 29.16), "INTL DE 40 kg = 29.16");
  console.assert(eq(calcularPrecio(41, de, false), 29.16 + 1*0.97), "INTL DE 41 kg → 29.16 + 1*0.97");
  const fr = TARIFAS["INTERNACIONAL"].FRANCIA;
  console.assert(eq(calcularPrecio(14.2, fr, false), 16.55), "INTL FR 14.2 kg → hasta 15 = 16.55");
}, []);

  // ======================
  // Render (UI completa)
  // ======================
  // Dimensiones para el diagrama: usar el BLOQUE OPTIMIZADO de la primera fila
  const first = rows[0] || {};
  const dimsBlock = first?.dimsOpt || null; // [Lopt, Aopt, Hopt]
  const Lnum = dimsBlock ? dimsBlock[0] : (Number(first.largo) > 0 ? Number(first.largo) : 30);
  const Anum = dimsBlock ? dimsBlock[1] : (Number(first.ancho) > 0 ? Number(first.ancho) : 20);
  const Hnum = dimsBlock ? dimsBlock[2] : (Number(first.alto)  > 0 ? Number(first.alto)  : 15);
  const maxBase = Math.max(Lnum, Hnum, Anum);
  const scale = 180 / (maxBase || 1);
  const w = Lnum * scale; // frente (largo)
  const h = Hnum * scale; // frente (alto)
  const dx = Anum * scale * 0.7; // desplazamiento oblicuo X para 'ancho'
  const dy = -Anum * scale * 0.4; // desplazamiento oblicuo Y para 'ancho'
  const x0 = 80, y0 = 190;

  // Construir cadenas de puntos para el SVG (evita literales con backticks dentro del JSX)
  const pointsFront = `${x0},${y0} ${x0 + w},${y0} ${x0 + w},${y0 - h} ${x0},${y0 - h}`;
  const pointsTop = `${x0},${y0 - h} ${x0 + w},${y0 - h} ${x0 + w + dx},${y0 - h + dy} ${x0 + dx},${y0 - h + dy}`;
  const pointsSide = `${x0 + w},${y0} ${x0 + w + dx},${y0 + dy} ${x0 + w + dx},${y0 - h + dy} ${x0 + w},${y0 - h}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Calculadora volumétrica · GLS</h1>
            <p className="text-sm text-slate-500">Dimensiones en centímetros (cm). Pesa el mayor entre peso real y peso volumétrico.</p>
          </div>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600">Servicio (volumétrico)</label>
              <select
                className="appearance-none rounded-xl border px-3 py-2 shadow-sm bg-white"
                value={service}
                onChange={(e) => {
                  const key = e.target.value;
                  setService(key);
                  const preset = SERVICE_PRESETS[key];
                  if (typeof preset.divisor === "number") setDivisor(preset.divisor);
                }}
              >
                {Object.keys(SERVICE_PRESETS).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600">Divisor (cm³/kg)</label>
              <input
                type="number"
                inputMode="numeric"
                className={`rounded-xl border px-3 py-2 shadow-sm bg-white ${SERVICE_PRESETS[service].editable ? '' : 'opacity-50 cursor-not-allowed'}`}
                value={divisor}
                onChange={(e) => setDivisor(Number(e.target.value))}
                disabled={!SERVICE_PRESETS[service].editable}
                min={1}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600">Tarifa (precios)</label>
              <select
                className="appearance-none rounded-xl border px-3 py-2 shadow-sm bg-white"
                value={tarifario.servicio}
                onChange={(e) => {
                  const key = e.target.value;
                  const s = (key in TARIFAS) ? TARIFAS[key] : undefined;
                  const firstAvailable = s ? Object.keys(s).find((k) => s[k]?.brackets?.length > 0) : "";
                  setTarifario({ servicio: key, trayecto: firstAvailable || "" });
                }}
              >
                {servicioKeys.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
                <option value="(sin precio)">(sin precio)</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600">{tarifario.servicio.startsWith('INTERNACIONAL') ? 'País' : 'Trayecto / Zona'}</label>
              <select
                className="appearance-none rounded-xl border px-3 py-2 shadow-sm bg-white"
                value={tarifario.trayecto}
                onChange={(e) => setTarifario((t) => ({ ...t, trayecto: e.target.value }))}
              >
                {trayectoKeys.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <label className="inline-flex items-center gap-2 text-xs ml-auto">
              <input type="checkbox" checked={redondeoEntero} onChange={(e) => setRedondeoEntero(e.target.checked)} />
              Redondear peso facturable a kg entero (Nacional). Internacional ≤ 40 kg usa tabla exacta.
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="mb-4 text-sm text-slate-500">
          {SERVICE_PRESETS[service].note && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3">{SERVICE_PRESETS[service].note}</div>
          )}
          <div className="mt-2 text-slate-600">
            <strong>Incrementos:</strong> Nacional desde <strong>15.01 kg</strong> (columna <em>Precio inc.</em>). Internacional desde <strong>40.01 kg</strong> (columna <em>Precio inc.</em> por país).
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-700 text-sm">
              <tr>
                <th className="py-3 px-4">Largo (cm)</th>
                <th className="py-3 px-4">Ancho (cm)</th>
                <th className="py-3 px-4">Alto (cm)</th>
                <th className="py-3 px-4">Peso real (kg)</th>
                <th className="py-3 px-4">Cantidad</th>
                <th className="py-3 px-4">Volumétrico total (kg)</th>
                <th className="py-3 px-4">Real total (kg)</th>
                <th className="py-3 px-4">Facturable total (kg)</th>
                <th className="py-3 px-4">Bloque optimizado (cm)</th>
                <th className="py-3 px-4">Precio línea (€)</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p, i) => {
                const row = rows[i] || {};
                return (
                <tr key={p.id} className="odd:bg-white even:bg-slate-50">
                  <td className="py-2 px-4"><input type="number" inputMode="decimal" value={p.largo} onChange={(e) => updatePkg(p.id, 'largo', e.target.value)} className="w-full border rounded-lg px-2 py-1" placeholder="0" min={0} /></td>
                  <td className="py-2 px-4"><input type="number" inputMode="decimal" value={p.ancho} onChange={(e) => updatePkg(p.id, 'ancho', e.target.value)} className="w-full border rounded-lg px-2 py-1" placeholder="0" min={0} /></td>
                  <td className="py-2 px-4"><input type="number" inputMode="decimal" value={p.alto} onChange={(e) => updatePkg(p.id, 'alto', e.target.value)} className="w-full border rounded-lg px-2 py-1" placeholder="0" min={0} /></td>
                  <td className="py-2 px-4"><input type="number" inputMode="decimal" value={p.pesoReal} onChange={(e) => updatePkg(p.id, 'pesoReal', e.target.value)} className="w-full border rounded-lg px-2 py-1" placeholder="0" min={0} /></td>
                  <td className="py-2 px-4"><input type="number" inputMode="numeric" value={p.cantidad} onChange={(e) => updatePkg(p.id, 'cantidad', e.target.value)} className="w-24 border rounded-lg px-2 py-1" placeholder="1" min={1} /></td>
                  <td className="py-2 px-4 tabular-nums">{isNaN(row.volumetricTotal) ? "–" : row.volumetricTotal.toFixed(2)}</td>
                  <td className="py-2 px-4 tabular-nums">{isNaN(row.realTotal) ? "–" : row.realTotal.toFixed(2)}</td>
                  <td className="py-2 px-4 tabular-nums">{isNaN(row.facturableTotal) ? "–" : row.facturableTotal.toFixed(2)}</td>
                  <td className="py-2 px-4 tabular-nums">{row.dimsOpt ? `${row.dimsOpt[0]}×${row.dimsOpt[1]}×${row.dimsOpt[2]}` : "–"}</td>
                  <td className="py-2 px-4 font-medium tabular-nums">{row.precioLinea == null || isNaN(row.precioLinea) ? "–" : row.precioLinea.toFixed(2)}</td>
                  <td className="py-2 px-4 text-right"><button onClick={() => removeRow(p.id)} className="text-sm text-rose-600 hover:underline">Eliminar</button></td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 items-center">
          <button onClick={addRow} className="px-4 py-2 rounded-xl bg-slate-900 text-white shadow hover:opacity-90">Añadir fila</button>
          <button onClick={clearAll} className="px-4 py-2 rounded-xl border bg-white shadow-sm hover:bg-slate-50">Limpiar</button>

          <div className="ml-auto flex flex-wrap gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600">Resumen tarifa</label>
              <div className="text-sm text-slate-700 bg-slate-50 border rounded-xl px-3 py-2">{tarifario.servicio} · {tarifario.trayecto}</div>
            </div>
          </div>
        </div>

        <section className="grid sm:grid-cols-3 gap-4 mt-6">
          <div className="rounded-2xl border p-4 bg-white shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Total volumétrico</div>
            <div className="text-2xl font-semibold tabular-nums">{totals.totalVol.toFixed(2)} kg</div>
          </div>
          <div className="rounded-2xl border p-4 bg-white shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Total real</div>
            <div className="text-2xl font-semibold tabular-nums">{totals.totalReal.toFixed(2)} kg</div>
          </div>
          <div className="rounded-2xl border p-4 bg-white shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Total a cobrar</div>
            <div className="text-2xl font-semibold tabular-nums">{totals.totalFact.toFixed(2)} €</div>
          </div>
        </section>

        {/* Guía visual de dimensiones (Largo, Ancho, Alto) */}
        <section className="mt-8 p-4 border rounded-xl bg-white">
          <h2 className="font-semibold mb-2">Guía visual de dimensiones</h2>
          <p className="text-sm text-slate-600 mb-3">Se muestran las medidas del <strong>bloque optimizado</strong> de la primera fila. Al aumentar la cantidad, solo crece el <strong>Ancho</strong>.</p>
          <svg viewBox="0 0 400 240" className="w-full max-w-xl">
            {/* Cara frontal */}
            <polygon points={pointsFront} fill="#e2e8f0" stroke="#334155" />
            {/* Cara superior */}
            <polygon points={pointsTop} fill="#cbd5e1" stroke="#334155" />
            {/* Cara lateral */}
            <polygon points={pointsSide} fill="#94a3b8" stroke="#334155" />

            {/* Flecha LARGO */}
            <line x1={x0} y1={y0 + 16} x2={x0 + w} y2={y0 + 16} stroke="#0f172a" markerEnd={'url(#arrow)'} markerStart={'url(#arrow)'} />
            <text x={x0 + w / 2} y={y0 + 28} textAnchor="middle" fontSize="12" fill="#0f172a">Largo (L)</text>

            {/* Flecha ALTO */}
            <line x1={x0 - 16} y1={y0} x2={x0 - 16} y2={y0 - h} stroke="#0f172a" markerEnd={'url(#arrow)'} markerStart={'url(#arrow)'} />
            <text x={x0 - 20} y={y0 - h / 2} textAnchor="end" dominantBaseline="middle" fontSize="12" fill="#0f172a">Alto (H)</text>

            {/* Flecha ANCHO */}
            <line x1={x0 + w + 10} y1={y0} x2={x0 + w + dx + 10} y2={y0 + dy} stroke="#0f172a" markerEnd={'url(#arrow)'} markerStart={'url(#arrow)'} />
            <text x={x0 + w + dx + 16} y={y0 + dy - 4} fontSize="12" fill="#0f172a">Ancho (A)</text>

            <defs>
              <marker id="arrow" orient="auto" markerWidth={6} markerHeight={6} refX={5} refY={3}>
                <path d="M0,0 L6,3 L0,6 Z" fill="#0f172a" />
              </marker>
            </defs>
          </svg>
          <div className="mt-3 text-sm text-slate-600">
            <span className="inline-block mr-4">Largo ≈ {Lnum}{typeof first.largo === 'number' ? ' cm' : ''}</span>
            <span className="inline-block mr-4">Ancho ≈ {Anum}{typeof first.ancho === 'number' ? ' cm' : ''}</span>
            <span className="inline-block">Alto ≈ {Hnum}{typeof first.alto === 'number' ? ' cm' : ''}</span>
          </div>
        </section>
      </main>
    </div>
  );
}

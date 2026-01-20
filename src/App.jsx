import React, { useEffect, useMemo, useState } from "react";

// Calculadora volumétrica — envío consolidado (UI completa)
// - Consolida cada fila como un SOLO envío con apilado restringido: SOLO crece el ANCHO por cantidad
// - Muestra dimensiones del bloque optimizado (L×A×H)
// - Selector de servicio (divisor), tarifa (nacional/internacional) y país/zona
// - Cálculo del mayor entre real total y volumétrico total del bloque
// - Incrementos: nacional desde 15.01 kg, internacional desde 40.01 kg
// - Totales y guía visual (SVG) al final

export default function VolumetricCalculator() {
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
  const [tarifario, setTarifario] = useState(
  { servicio: "INTERNACIONAL", trayecto: "ALEMANIA" }
);
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
  const packPreferAncho = (l, a, h, q) => {
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

  const combined = useMemo(() => {
    const tarifa = getTarifaActual();
    const valid = rows.filter((r) => Array.isArray(r.dimsOpt));
    if (valid.length === 0) {
      return { dims: null, volKg: NaN, realTotal: NaN, facturable: NaN, precio: NaN };
    }

    const totalWidth = valid.reduce((acc, r) => acc + (r.dimsOpt?.[1] || 0), 0);
    const maxLength = Math.max(...valid.map((r) => r.dimsOpt?.[0] || 0));
    const maxHeight = Math.max(...valid.map((r) => r.dimsOpt?.[2] || 0));

    const volKg = divisor > 0 ? (maxLength * totalWidth * maxHeight) / divisor : NaN;
    const realTotal = valid.reduce((acc, r) => acc + (isNaN(r.realTotal) ? 0 : r.realTotal), 0);
    const facturable = (isNaN(volKg) && isNaN(realTotal)) ? NaN : Math.max(isNaN(realTotal) ? 0 : realTotal, isNaN(volKg) ? 0 : volKg);
    const precio = calcularPrecio(facturable, tarifa);

    return {
      dims: [maxLength, totalWidth, maxHeight],
      volKg,
      realTotal,
      facturable,
      precio: precio == null ? NaN : precio,
    };
  }, [rows, divisor, tarifario, redondeoEntero]);

  const totals = useMemo(() => {
    return {
      totalVol: combined.volKg,
      totalReal: combined.realTotal,
      totalFact: combined.precio,
    };
  }, [combined]);

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
  // Dimensiones para el diagrama: usar el BLOQUE COMBINADO (suma de anchos entre filas)
  const first = rows[0] || {};
  const dimsBlock = combined.dims || first?.dimsOpt || null; // [Lopt, Aopt, Hopt]
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/90 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                Calculadora de envíos
              </h1>
              <p className="text-sm text-slate-600 mt-1">Cálculo de peso volumétrico y tarifas de envío</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-xs font-medium text-blue-700">Tarifa actual:</span>
              <span className="text-sm font-semibold text-blue-900">{tarifario.servicio} · {tarifario.trayecto}</span>
            </div>
          </div>

          {/* Configuración en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Servicio volumétrico</label>
              <select
                className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm font-medium bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Divisor (cm³/kg)</label>
              <input
                type="number"
                inputMode="numeric"
                className={`w-full rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                  SERVICE_PRESETS[service].editable 
                    ? 'bg-white border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                    : 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
                }`}
                value={divisor}
                onChange={(e) => setDivisor(Number(e.target.value))}
                disabled={!SERVICE_PRESETS[service].editable}
                min={1}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Tarifa / Servicio</label>
              <select
                className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm font-medium bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                {tarifario.servicio.startsWith('INTERNACIONAL') ? 'País destino' : 'Zona / Trayecto'}
              </label>
              <select
                className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm font-medium bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={tarifario.trayecto}
                onChange={(e) => setTarifario((t) => ({ ...t, trayecto: e.target.value }))}
              >
                {trayectoKeys.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="mt-3 flex items-center gap-2">
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input 
                type="checkbox" 
                checked={redondeoEntero} 
                onChange={(e) => setRedondeoEntero(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
              />
              <span className="text-xs text-slate-700">Redondear a kg entero (Nacional)</span>
            </label>
            {SERVICE_PRESETS[service].note && (
              <div className="ml-auto text-xs text-slate-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <span className="font-medium">ℹ️</span> {SERVICE_PRESETS[service].note}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Resumen de totales - Primero para mejor visibilidad */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative overflow-hidden rounded-2xl border-2 border-blue-100 p-5 bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Peso Volumétrico</div>
                <div className="text-3xl font-bold text-blue-900 tabular-nums">{totals.totalVol.toFixed(2)}</div>
                <div className="text-sm text-blue-600 font-medium">kg</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-100 p-5 bg-gradient-to-br from-slate-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Peso Real</div>
                <div className="text-3xl font-bold text-slate-900 tabular-nums">{totals.totalReal.toFixed(2)}</div>
                <div className="text-sm text-slate-600 font-medium">kg</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border-2 border-green-100 p-5 bg-gradient-to-br from-green-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Total a Cobrar</div>
                <div className="text-3xl font-bold text-green-900 tabular-nums">{totals.totalFact.toFixed(2)}</div>
                <div className="text-sm text-green-600 font-medium">€</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Información de ayuda */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Instrucciones de uso:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Introduce las dimensiones en <strong>centímetros (cm)</strong> y peso en <strong>kilogramos (kg)</strong></li>
                <li>• El sistema calcula automáticamente el <strong>mayor valor</strong> entre peso real y volumétrico</li>
                <li>• Incrementos: Nacional desde <strong>15.01 kg</strong>, Internacional desde <strong>40.01 kg</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabla de paquetes */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Paquetes y dimensiones</h2>
            <p className="text-sm text-slate-600 mt-1">Añade las medidas de tus paquetes</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Largo (cm)</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Ancho (cm)</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Alto (cm)</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Peso real (kg)</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Cantidad</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50">Vol. total (kg)</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Real total (kg)</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50">Facturable (kg)</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Bloque (cm)</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50">Precio (€)</th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <input 
                        type="number" 
                        inputMode="decimal" 
                        value={p.largo} 
                        onChange={(e) => updatePkg(p.id, 'largo', e.target.value)} 
                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="0" 
                        min={0} 
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="number" 
                        inputMode="decimal" 
                        value={p.ancho} 
                        onChange={(e) => updatePkg(p.id, 'ancho', e.target.value)} 
                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="0" 
                        min={0} 
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="number" 
                        inputMode="decimal" 
                        value={p.alto} 
                        onChange={(e) => updatePkg(p.id, 'alto', e.target.value)} 
                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="0" 
                        min={0} 
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="number" 
                        inputMode="decimal" 
                        value={p.pesoReal} 
                        onChange={(e) => updatePkg(p.id, 'pesoReal', e.target.value)} 
                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="0" 
                        min={0} 
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="number" 
                        inputMode="numeric" 
                        value={p.cantidad} 
                        onChange={(e) => updatePkg(p.id, 'cantidad', e.target.value)} 
                        className="w-20 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="1" 
                        min={1} 
                      />
                    </td>
                    <td className="py-3 px-4 tabular-nums font-semibold text-blue-700 bg-blue-50">
                      {isNaN(rows[i].volumetricTotal) ? "–" : rows[i].volumetricTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-medium text-slate-700">
                      {isNaN(rows[i].realTotal) ? "–" : rows[i].realTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-bold text-green-700 bg-green-50">
                      {isNaN(rows[i].facturableTotal) ? "–" : rows[i].facturableTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 tabular-nums text-xs text-slate-600">
                      {rows[i].dimsOpt ? `${rows[i].dimsOpt[0]}×${rows[i].dimsOpt[1]}×${rows[i].dimsOpt[2]}` : "–"}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-bold text-lg text-green-700 bg-green-50">
                      {rows[i].precioLinea == null || isNaN(rows[i].precioLinea) ? "–" : rows[i].precioLinea.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => removeRow(p.id)} 
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-600 rounded-lg transition-all"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Acciones de la tabla */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <button 
                onClick={addRow} 
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir fila
              </button>
              <button 
                onClick={clearAll} 
                className="px-5 py-2.5 rounded-lg border-2 border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpiar todo
              </button>
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-semibold">{packages.length}</span> paquete{packages.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Guía visual de dimensiones */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Guía visual de dimensiones</h2>
            <p className="text-sm text-slate-600 mt-1">Representación del bloque combinado (suma de anchos de todas las filas)</p>
          </div>
          
          <div className="p-6">
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-700">
                Cada fila representa un tipo de paquete. El <strong className="text-blue-600">Ancho</strong> total se suma entre filas,
                y las dimensiones mostradas corresponden al bloque consolidado.
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 max-w-md">
                <svg viewBox="0 0 400 240" className="w-full">
                  <polygon points={pointsFront} fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
                  <polygon points={pointsTop} fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
                  <polygon points={pointsSide} fill="#94a3b8" stroke="#334155" strokeWidth="2" />

                  <line x1={x0} y1={y0 + 16} x2={x0 + w} y2={y0 + 16} stroke="#0f172a" strokeWidth="2" markerEnd={'url(#arrow)'} markerStart={'url(#arrow)'} />
                  <text x={x0 + w / 2} y={y0 + 32} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0f172a">Largo (L)</text>

                  <line x1={x0 - 16} y1={y0} x2={x0 - 16} y2={y0 - h} stroke="#0f172a" strokeWidth="2" markerEnd={'url(#arrow)'} markerStart={'url(#arrow)'} />
                  <text x={x0 - 24} y={y0 - h / 2} textAnchor="end" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill="#0f172a">Alto (H)</text>

                  <line x1={x0 + w + 10} y1={y0} x2={x0 + w + dx + 10} y2={y0 + dy} stroke="#0f172a" strokeWidth="2" markerEnd={'url(#arrow)'} markerStart={'url(#arrow)'} />
                  <text x={x0 + w + dx + 20} y={y0 + dy - 4} fontSize="14" fontWeight="bold" fill="#0f172a">Ancho (A)</text>

                  <defs>
                    <marker id="arrow" orient="auto" markerWidth={8} markerHeight={8} refX={6} refY={4}>
                      <path d="M0,0 L8,4 L0,8 Z" fill="#0f172a" />
                    </marker>
                  </defs>
                </svg>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">L</div>
                  <div>
                    <div className="text-xs font-semibold text-blue-600 uppercase">Largo</div>
                    <div className="text-2xl font-bold text-blue-900 tabular-nums">{Lnum.toFixed(1)} cm</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">A</div>
                  <div>
                    <div className="text-xs font-semibold text-purple-600 uppercase">Ancho</div>
                    <div className="text-2xl font-bold text-purple-900 tabular-nums">{Anum.toFixed(1)} cm</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">H</div>
                  <div>
                    <div className="text-xs font-semibold text-orange-600 uppercase">Alto</div>
                    <div className="text-2xl font-bold text-orange-900 tabular-nums">{Hnum.toFixed(1)} cm</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <div className="text-xs font-semibold text-slate-600 uppercase mb-1">Volumen total</div>
                  <div className="text-xl font-bold text-slate-900 tabular-nums">
                    {(Lnum * Anum * Hnum / 1000000).toFixed(6)} m³
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* Veraglo ERP — global typography & font standardization system. */
(function (VG) {
  const SIZE_SCALE = {
    small: { base: 13, table: 12, form: 13, heading: 18, subheading: 15, label: 11 },
    medium: { base: 14, table: 13, form: 14, heading: 20, subheading: 16, label: 12 },
    large: { base: 15, table: 14, form: 15, heading: 22, subheading: 17, label: 13 },
  };

  const LINE_SPACING = { compact: 1.4, comfortable: 1.5, relaxed: 1.65 };

  const FONT_WEIGHT = {
    normal: { normal: 400, medium: 500, semibold: 600, heading: 600 },
    medium: { normal: 400, medium: 500, semibold: 600, heading: 650 },
  };

  VG.FONT_PRESETS = {
    inter: {
      id: "inter",
      label: "Inter (recommended)",
      css: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      pdf: "Inter, 'Segoe UI', Arial, sans-serif",
      google: "Inter:wght@300;400;500;600;700;800",
    },
    poppins: {
      id: "poppins",
      label: "Poppins",
      css: "Poppins, ui-sans-serif, system-ui, sans-serif",
      pdf: "Poppins, Arial, sans-serif",
      google: "Poppins:wght@300;400;500;600;700",
    },
    manrope: {
      id: "manrope",
      label: "Manrope",
      css: "Manrope, ui-sans-serif, system-ui, sans-serif",
      pdf: "Manrope, Arial, sans-serif",
      google: "Manrope:wght@400;500;600;700;800",
    },
    sourceSans: {
      id: "sourceSans",
      label: "Source Sans Pro",
      css: "'Source Sans 3', 'Source Sans Pro', ui-sans-serif, system-ui, sans-serif",
      pdf: "'Source Sans 3', Arial, sans-serif",
      google: "Source+Sans+3:wght@400;500;600;700",
    },
    segoe: {
      id: "segoe",
      label: "Segoe UI",
      css: "'Segoe UI', Inter, ui-sans-serif, system-ui, sans-serif",
      pdf: "'Segoe UI', Arial, sans-serif",
      google: null,
    },
    roboto: {
      id: "roboto",
      label: "Roboto",
      css: "Roboto, ui-sans-serif, system-ui, sans-serif",
      pdf: "Roboto, Arial, sans-serif",
      google: "Roboto:wght@300;400;500;700",
    },
  };

  VG.TYPOGRAPHY_DEFAULTS = {
    fontFamily: "inter",
    headingSize: "medium",
    tableSize: "medium",
    formSize: "medium",
    pdfFontFamily: "inter",
    fontWeight: "medium",
    lineSpacing: "comfortable",
    density: "comfortable",
  };

  function defaultTypography(theme) {
    const legacy = theme && theme.fontSize;
    const density = legacy === "small" ? "compact" : legacy === "large" ? "relaxed" : "comfortable";
    const size = legacy === "small" ? "small" : legacy === "large" ? "large" : "medium";
    return {
      ...VG.TYPOGRAPHY_DEFAULTS,
      headingSize: size,
      tableSize: size,
      formSize: size,
      lineSpacing: density === "compact" ? "compact" : density === "relaxed" ? "relaxed" : "comfortable",
      density: density === "compact" ? "compact" : "comfortable",
    };
  }

  function normalizeTypography(raw, theme) {
    const base = defaultTypography(theme);
    const t = { ...base, ...(raw || {}) };
    if (!VG.FONT_PRESETS[t.fontFamily]) t.fontFamily = "inter";
    if (!VG.FONT_PRESETS[t.pdfFontFamily]) t.pdfFontFamily = t.fontFamily;
    ["headingSize", "tableSize", "formSize"].forEach((k) => {
      if (!SIZE_SCALE[t[k]]) t[k] = "medium";
    });
    if (!LINE_SPACING[t.lineSpacing]) t.lineSpacing = "comfortable";
    if (!FONT_WEIGHT[t.fontWeight]) t.fontWeight = "medium";
    if (t.density !== "compact") t.density = "comfortable";
    return t;
  }

  function getTypography() {
    const settings = typeof VG.store !== "undefined" && VG.store.settings ? VG.store.settings() : {};
    return normalizeTypography(settings.typography, settings.theme);
  }

  function presetFor(key) {
    return VG.FONT_PRESETS[key] || VG.FONT_PRESETS.inter;
  }

  function applyTypography(typography, theme) {
    if (typeof document === "undefined") return;
    const t = normalizeTypography(typography, theme);
    const preset = presetFor(t.fontFamily);
    const pdfPreset = presetFor(t.pdfFontFamily);
    const heading = SIZE_SCALE[t.headingSize] || SIZE_SCALE.medium;
    const table = SIZE_SCALE[t.tableSize] || SIZE_SCALE.medium;
    const form = SIZE_SCALE[t.formSize] || SIZE_SCALE.medium;
    const lh = LINE_SPACING[t.lineSpacing] || 1.5;
    const fw = FONT_WEIGHT[t.fontWeight] || FONT_WEIGHT.medium;
    const root = document.documentElement;

    root.style.setProperty("--vg-font-family", preset.css);
    root.style.setProperty("--vg-font-pdf", pdfPreset.pdf);
    root.style.setProperty("--vg-fs-base", heading.base + "px");
    root.style.setProperty("--vg-fs-heading", heading.heading + "px");
    root.style.setProperty("--vg-fs-subheading", heading.subheading + "px");
    root.style.setProperty("--vg-fs-table", table.table + "px");
    root.style.setProperty("--vg-fs-form", form.form + "px");
    root.style.setProperty("--vg-fs-label", form.label + "px");
    root.style.setProperty("--vg-lh", String(lh));
    root.style.setProperty("--vg-lh-tight", String(Math.max(1.25, lh - 0.15)));
    root.style.setProperty("--vg-fw-normal", String(fw.normal));
    root.style.setProperty("--vg-fw-medium", String(fw.medium));
    root.style.setProperty("--vg-fw-semibold", String(fw.semibold));
    root.style.setProperty("--vg-fw-heading", String(fw.heading));
    root.style.setProperty("--vg-letter-spacing", t.density === "compact" ? "-0.01em" : "-0.015em");

    root.classList.toggle("vg-typo-compact", t.density === "compact");
    root.classList.toggle("vg-typo-comfortable", t.density !== "compact");
    root.dataset.vgFont = t.fontFamily;
    root.dataset.vgPdfFont = t.pdfFontFamily;
  }

  function resolvePdfFontFamily(typography, templateFont) {
    const t = normalizeTypography(typography);
    if (templateFont && String(templateFont).trim() && !/inherit/i.test(templateFont)) {
      return templateFont;
    }
    return presetFor(t.pdfFontFamily).pdf;
  }

  function printBaseCSS() {
    const t = getTypography();
    const pdfFont = presetFor(t.pdfFontFamily).pdf;
    const tablePt = (SIZE_SCALE[t.tableSize] || SIZE_SCALE.medium).table * 0.75;
    const formPt = (SIZE_SCALE[t.formSize] || SIZE_SCALE.medium).form * 0.75;
    const lh = LINE_SPACING[t.lineSpacing] || 1.5;
    return `
    *{box-sizing:border-box;font-family:${pdfFont};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
    body{margin:0;color:#0f172a;font-size:${formPt}pt;line-height:${lh}}
    .vg-mono,.vg-doc-no,table .sku,table .mono{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1}
    table.vg-tbl{font-size:${tablePt}pt;line-height:${lh}}
    `;
  }

  function fontOptions() {
    return Object.values(VG.FONT_PRESETS).map((p) => ({ value: p.id, label: p.label }));
  }

  VG.defaultTypography = defaultTypography;
  VG.normalizeTypography = normalizeTypography;
  VG.getTypography = getTypography;
  VG.applyTypography = applyTypography;
  VG.resolvePdfFontFamily = resolvePdfFontFamily;
  VG.printBaseCSS = printBaseCSS;
  VG.typographyFontOptions = fontOptions;
})(window.VG);

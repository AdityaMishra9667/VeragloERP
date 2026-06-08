/* Veraglo ERP — Item manufacturer identity helpers (normalization, labels, part search). */
(function (VG) {
  const { useState, useMemo, useEffect, useRef } = React;
  const store = VG.store;

  const DUP_MSG = "This manufacturer and part number already exist in Item Master. Duplicate item cannot be created.";
  VG.ITEM_MFR_DUP_MSG = DUP_MSG;

  function normalizeMfrName(name) {
    return String(name || "").trim().replace(/\s+/g, " ").toUpperCase();
  }

  function normalizeMfrPart(part) {
    return String(part || "").trim().toUpperCase().replace(/[\s\-_./]+/g, "");
  }

  function mfrKey(name, part) {
    const n = normalizeMfrName(name);
    const p = normalizeMfrPart(part);
    if (!n || !p) return "";
    return n + "|" + p;
  }

  function getItem(itemOrId) {
    if (!itemOrId) return null;
    if (typeof itemOrId === "object") return itemOrId;
    return store.get("items", itemOrId);
  }

  function manufacturerName(itemOrId) {
    const it = getItem(itemOrId);
    if (!it) return "";
    if (it.manufacturerName) return it.manufacturerName;
    if (it.manufacturerId) return (store.get("manufacturers", it.manufacturerId) || {}).name || "";
    return "";
  }

  function partNumber(itemOrId) {
    const it = getItem(itemOrId);
    return it && it.manufacturerPartNumber ? String(it.manufacturerPartNumber).trim() : "";
  }

  function mfrLine(itemOrId) {
    const m = manufacturerName(itemOrId);
    const p = partNumber(itemOrId);
    if (m && p) return m + " · " + p;
    if (m) return m;
    if (p) return p;
    return "";
  }

  function label(itemOrId, opts) {
    const it = getItem(itemOrId);
    if (!it) return "—";
    const id = VG.itemDisplay;
    const base = id ? id.tableLabel(it) : (it.sku + " — " + (it.name || "—"));
    const line = mfrLine(it);
    if (opts && opts.mfrOnly) return line || base;
    if (opts && opts.baseOnly) return base;
    if (opts && opts.nameOnly) return id ? id.itemName(it) || "—" : (it.name || "—");
    return line ? base + " · " + line : base;
  }

  function searchByPartNumber(query, manufacturerId, limit, excludeItemId) {
    const q = normalizeMfrPart(query);
    if (!q || q.length < 2) return [];
    const out = [];
    (store.list("items") || []).forEach((it) => {
      if (excludeItemId && it.id === excludeItemId) return;
      if (manufacturerId && it.manufacturerId !== manufacturerId) return;
      const pn = it.manufacturerPartNumber || "";
      if (!pn) return;
      const norm = normalizeMfrPart(pn);
      if (norm.includes(q) || pn.toUpperCase().includes(String(query).trim().toUpperCase())) {
        out.push(it);
      }
    });
    return out.slice(0, limit || 8);
  }

  function tableColumns() {
    return [
      {
        key: "manufacturerName",
        label: "Manufacturer",
        render: (r) => <span className="text-xs">{manufacturerName(r) || "—"}</span>,
        csv: (r) => manufacturerName(r),
      },
      {
        key: "manufacturerPartNumber",
        label: "Mfr part no.",
        render: (r) => <span className="font-mono text-[11px]">{partNumber(r) || "—"}</span>,
        csv: (r) => partNumber(r),
      },
    ];
  }

  function readDatasheet(file, done) {
    if (!file) return done(null, null);
    const okType = file.type === "application/pdf" || file.type.startsWith("image/");
    if (!okType) return done(null, "Upload PDF or image (JPG, PNG)");
    if (file.size > 3 * 1024 * 1024) return done(null, "File must be under 3 MB");
    const reader = new FileReader();
    reader.onload = () => done({ name: file.name, data: reader.result }, null);
    reader.onerror = () => done(null, "Could not read file");
    reader.readAsDataURL(file);
  }

  function PartNumberSuggest({ value, onChange, manufacturerId, excludeItemId, disabled }) {
    VG.useDB();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const tick = VG.useDB();
    const matches = useMemo(
      () => searchByPartNumber(value, manufacturerId, 8, excludeItemId),
      [value, manufacturerId, excludeItemId, tick]
    );
    const dup = useMemo(() => {
      if (!manufacturerId || !String(value || "").trim()) return null;
      return store.findDuplicateItemMfr({ manufacturerId, manufacturerPartNumber: value }, excludeItemId);
    }, [value, manufacturerId, excludeItemId, tick]);

    useEffect(() => {
      const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
      <div className="relative" ref={ref}>
        <input
          type="text"
          value={value || ""}
          disabled={disabled}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Type part number — matching items appear"
          className="w-full rounded-xl glass px-3 py-2 text-sm bg-transparent outline-none"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }}
        />
        {dup && (
          <p className="text-xs text-rose-400 mt-1.5">{DUP_MSG}</p>
        )}
        {open && matches.length > 0 && !dup && (
          <div className="absolute z-50 mt-1 w-full glass-dark rounded-xl shadow-glass p-2 max-h-48 overflow-auto">
            <div className="text-[10px] uppercase tracking-wider opacity-45 px-2 py-1">Existing items with similar part number</div>
            {matches.map((it) => (
              <div key={it.id} className="px-2.5 py-2 text-sm rounded-lg chrome-hover">
                <span className="font-mono text-[11px] opacity-70">{it.sku}</span>
                <span className="mx-1 opacity-40">·</span>
                <span>{manufacturerName(it)}</span>
                <span className="font-mono text-[11px] ml-1 opacity-80">{partNumber(it)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  VG.itemMfr = {
    DUP_MSG,
    normalizeMfrName,
    normalizeMfrPart,
    mfrKey,
    manufacturerName,
    partNumber,
    mfrLine,
    label,
    searchByPartNumber,
    tableColumns,
    readDatasheet,
    PartNumberSuggest,
  };
})(window.VG);

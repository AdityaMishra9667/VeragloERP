/* Veraglo ERP — internal screen navigation: full-page detail views, list state, back nav. */
(function (VG) {
  const { useState, useEffect, useRef, useCallback, useMemo } = React;
  const ui = VG.ui;
  const { Icon, Button } = ui;

  /* ---------- table / list state persistence (search, filters, page, scroll) ---------- */
  const _tableStates = {};
  const _openRecords = {};

  function getTableState(tableId) {
    if (!tableId) return {};
    if (_tableStates[tableId]) return { ..._tableStates[tableId] };
    try {
      const raw = sessionStorage.getItem("vg-tbl:" + tableId);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveTableState(tableId, patch) {
    if (!tableId) return;
    const next = { ...getTableState(tableId), ...patch, ts: Date.now() };
    _tableStates[tableId] = next;
    try {
      sessionStorage.setItem("vg-tbl:" + tableId, JSON.stringify(next));
    } catch (e) { /* quota */ }
  }

  function registerOpenRecord(screenKey, recordId) {
    if (!screenKey) return;
    _openRecords[screenKey] = recordId || null;
  }

  function getOpenRecord(screenKey) {
    return screenKey ? _openRecords[screenKey] : null;
  }

  /* ---------- list ↔ detail navigation hook ---------- */
  function useListDetail(screenKey, resolveRecord) {
    const [viewId, setViewId] = useState(null);
    const [tick, setTick] = useState(0);

    const openView = useCallback((recordOrId) => {
      const id = recordOrId && typeof recordOrId === "object" ? recordOrId.id : recordOrId;
      if (!id) return;
      registerOpenRecord(screenKey, id);
      setViewId((prev) => {
        if (prev === id) {
          setTick((t) => t + 1);
          return prev;
        }
        return id;
      });
    }, [screenKey]);

    const closeView = useCallback(() => {
      registerOpenRecord(screenKey, null);
      setViewId(null);
    }, [screenKey]);

    const refreshView = useCallback(() => setTick((t) => t + 1), []);

    const viewRecord = useMemo(() => {
      if (!viewId) return null;
      if (typeof resolveRecord === "function") return resolveRecord(viewId);
      return null;
    }, [viewId, tick, resolveRecord]);

    return { viewId, viewRecord, openView, closeView, refreshView, isOpen: !!viewId };
  }

  /* ---------- full-page internal screen (replaces detail modals) ---------- */
  function InternalScreen({
    onBack,
    backLabel = "Back",
    title,
    subtitle,
    children,
    footer,
    dirty = false,
    className = "",
    bodyClassName = "",
  }) {
    const [guard, setGuard] = useState(false);
    useEffect(() => { setGuard(false); }, [title]);

    useEffect(() => {
      const h = (e) => {
        if (e.key !== "Escape" || !onBack) return;
        e.preventDefault();
        if (!dirty) onBack();
        else setGuard((g) => { if (g) { onBack(); return false; } return true; });
      };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, [dirty, onBack]);

    const requestBack = () => {
      if (dirty) setGuard(true);
      else onBack && onBack();
    };

    return (
      <div className={"vg-internal-screen flex flex-col w-full min-h-0 animate-fade-up " + className}>
        <div className="vg-internal-screen-head flex flex-wrap items-start gap-3 mb-3 pb-3 border-b border-white/10 shrink-0">
          {onBack && (
            <Button variant="soft" icon="chevronLeft" onClick={requestBack} className="shrink-0">
              {backLabel}
            </Button>
          )}
          <div className="flex-1 min-w-0">
            {title && <h2 className="text-base sm:text-lg font-semibold font-display leading-tight truncate">{title}</h2>}
            {subtitle && <p className="text-xs opacity-60 mt-0.5 leading-snug">{subtitle}</p>}
          </div>
        </div>
        <div className={"vg-internal-screen-body flex-1 min-h-0 overflow-y-auto overflow-x-hidden " + bodyClassName}>
          {children}
        </div>
        {footer && (
          <div className="vg-internal-screen-foot flex flex-wrap justify-end gap-2 pt-3 mt-3 border-t border-white/10 shrink-0">
            {footer}
          </div>
        )}
        {guard && (
          <div className="fixed inset-0 z-[85] grid place-items-center bg-black/60 p-4" onMouseDown={() => setGuard(false)}>
            <div className="glass-dark rounded-2xl shadow-glass p-5 w-[min(92%,420px)] animate-scale-in" onMouseDown={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="alert" size={18} style={{ color: "#f59e0b" }} />
                <h4 className="font-semibold">Unsaved changes</h4>
              </div>
              <p className="text-sm opacity-70">Go back without saving?</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="soft" onClick={() => setGuard(false)}>Keep editing</Button>
                <button
                  onClick={() => { setGuard(false); onBack && onBack(); }}
                  className="inline-flex items-center gap-2 rounded-xl text-sm font-medium px-3.5 py-2 text-white"
                  style={{ background: "#ef4444" }}
                >
                  Discard & go back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  VG.getTableState = getTableState;
  VG.saveTableState = saveTableState;
  VG.registerOpenRecord = registerOpenRecord;
  VG.getOpenRecord = getOpenRecord;
  VG.useListDetail = useListDetail;
  VG.InternalScreen = InternalScreen;

  if (VG.fx) {
    VG.fx.InternalScreen = InternalScreen;
    VG.fx.useListDetail = useListDetail;
  }
})(window.VG);

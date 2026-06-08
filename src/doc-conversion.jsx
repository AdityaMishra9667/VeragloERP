/* Veraglo ERP — Document conversion / status-forward confirmation & success popups. */
(function (VG) {
  const { useState, useEffect } = React;
  const { Icon, Button } = VG.ui;

  const FORWARD_LABELS = {
    "quotation:proforma": {
      confirm: (no) => "Are you sure you want to convert this Quotation" + (no ? " (" + no + ")" : "") + " to Proforma Invoice?",
      success: (no) => "Proforma Invoice " + no + " generated successfully.",
    },
    "quotation:sales_order": {
      confirm: (no) => "Are you sure you want to convert this Quotation" + (no ? " (" + no + ")" : "") + " to Sales Order?",
      success: (no) => "Sales Order " + no + " generated successfully.",
    },
    "quotation:invoice": {
      confirm: (no) => "Are you sure you want to convert this Quotation" + (no ? " (" + no + ")" : "") + " to Tax Invoice?",
      success: (no) => "Tax Invoice " + no + " generated successfully.",
    },
    "quotation:dispatch": {
      confirm: (no) => "Are you sure you want to create Dispatch for this Quotation" + (no ? " (" + no + ")" : "") + "?",
      success: (no) => "Dispatch " + no + " created successfully.",
    },
    "proforma:sales_order": {
      confirm: (no) => "Are you sure you want to convert this Proforma Invoice" + (no ? " (" + no + ")" : "") + " to Sales Order?",
      success: (no) => "Sales Order " + no + " generated successfully.",
    },
    "sales_order:proforma": {
      confirm: (no) => "Are you sure you want to generate a Proforma Invoice from Sales Order" + (no ? " (" + no + ")" : "") + "?",
      success: (no) => "Proforma Invoice " + no + " generated successfully.",
    },
    "sales_order:production": {
      confirm: (no) => "Are you sure you want to send Sales Order" + (no ? " (" + no + ")" : "") + " to Production?",
      success: (no) => "Document sent to Production successfully." + (no ? " Work order linked to " + no + "." : ""),
    },
    "sales_order:invoice": {
      confirm: (no) => "Are you sure you want to generate Tax Invoice from Sales Order" + (no ? " (" + no + ")" : "") + "?",
      success: (no) => "Tax Invoice " + no + " generated successfully.",
    },
    "sales_order:dispatch": {
      confirm: (no) => "Are you sure you want to create Dispatch / Shipment for Sales Order" + (no ? " (" + no + ")" : "") + "?",
      success: (no) => "Dispatch " + no + " created successfully.",
    },
    "sales_order:stage": {
      confirm: (no, extra) => "Are you sure you want to advance Sales Order" + (no ? " (" + no + ")" : "") + (extra ? " to \"" + extra + "\"?" : "?"),
      success: () => "Status updated successfully.",
    },
    "enquiry:sales_order": {
      confirm: (no) => "Are you sure you want to convert this Enquiry" + (no ? " (" + no + ")" : "") + " to Sales Order?",
      success: (no) => "Sales Order " + no + " generated successfully.",
    },
    "shipment:dispatch": {
      confirm: (no) => "Are you sure you want to mark Shipment" + (no ? " (" + no + ")" : "") + " as dispatched?",
      success: (no) => "Shipment " + no + " dispatched successfully.",
    },
    "shipment:deliver": {
      confirm: (no) => "Are you sure you want to confirm delivery for Shipment" + (no ? " (" + no + ")" : "") + "?",
      success: (no) => "Shipment " + no + " marked as delivered.",
    },
  };

  let successState = null;
  const successSubs = new Set();

  VG.DOC_FORWARD_LABELS = FORWARD_LABELS;

  VG.confirmForward = function (opts) {
    return VG.confirm({
      title: opts.title || "Confirm",
      message: opts.message || "",
      confirmLabel: opts.confirmLabel || "Yes, Continue",
      cancelLabel: opts.cancelLabel || "Cancel",
      danger: !!opts.danger,
    });
  };

  VG.showSuccess = function (opts) {
    return new Promise((resolve) => {
      successState = {
        title: opts.title || "Success",
        message: opts.message || "Operation completed successfully.",
        resolve,
      };
      successSubs.forEach((f) => { try { f(); } catch (e) {} });
    });
  };

  function SuccessPopup() {
    const [, setTick] = useState(0);
    useEffect(() => {
      const bump = () => setTick((t) => t + 1);
      successSubs.add(bump);
      return () => successSubs.delete(bump);
    }, []);
    if (!successState) return null;
    const s = successState;
    const done = () => {
      const r = s.resolve;
      successState = null;
      setTick((t) => t + 1);
      r(true);
    };
    return (
      <div className="fixed inset-0 z-[115] grid place-items-center p-4 bg-black/55 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && done()}>
        <div className="glass-dark rounded-2xl shadow-glass p-6 w-[min(92vw,440px)] animate-scale-in text-center border border-white/10" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <div className="mx-auto mb-4 grid place-items-center w-14 h-14 rounded-full" style={{ background: "rgba(52, 211, 153, 0.15)" }}>
            <Icon name="check" size={28} style={{ color: "#34d399" }} />
          </div>
          <h3 className="text-lg font-semibold font-display">{s.title}</h3>
          <p className="text-sm opacity-80 mt-3 leading-relaxed px-1">{s.message}</p>
          <div className="mt-6 flex justify-center">
            <Button icon="check" onClick={done}>OK</Button>
          </div>
        </div>
      </div>
    );
  }

  VG.DocSuccessPopup = SuccessPopup;

  /**
   * Standard workflow: confirm → run conversion → audit → success popup.
   * opts.duplicate: { exists, no, label, message } — blocks conversion if already linked.
   */
  VG.forwardDocument = async function (opts) {
    if (!opts || typeof opts.run !== "function") return null;
    const dup = opts.duplicate;
    if (dup && dup.exists) {
      VG.toast(dup.message || (dup.label || "Document") + " " + (dup.no || "") + " already exists for this record.", "warn");
      return dup.linked || null;
    }
    const labels = opts.action && FORWARD_LABELS[opts.action];
    const confirmMsg = opts.confirmMessage
      || (labels && labels.confirm(opts.fromNo, opts.confirmExtra))
      || ("Are you sure you want to proceed with this " + (opts.toType || "conversion") + "?");
    const ok = await VG.confirmForward({
      title: opts.confirmTitle || "Confirm conversion",
      message: confirmMsg,
    });
    if (!ok) return null;
    let result = null;
    try {
      result = opts.run();
      if (result && typeof result.then === "function") result = await result;
    } catch (e) {
      VG.toast((e && e.message) || "Conversion failed", "error");
      return null;
    }
    if (!result) {
      if (opts.failMessage) VG.toast(opts.failMessage, "error");
      return null;
    }
    const docNo = result.no || result.docNo || result.salesOrderNo || "";
    const successMsg = typeof opts.successMessage === "function"
      ? opts.successMessage(result)
      : (opts.successMessage
        || (labels && labels.success(docNo, opts.successExtra))
        || ((opts.toType || "Document") + " " + docNo + " generated successfully."));
    const store = VG.store;
    if (store && store.recordDocumentConversion) {
      store.recordDocumentConversion({
        fromType: opts.fromType,
        fromNo: opts.fromNo,
        fromId: opts.fromId,
        toType: opts.toType,
        toNo: docNo,
        toId: result.id,
        actor: opts.actor,
        statusChange: opts.statusChange,
        confirmed: true,
      });
    }
    await VG.showSuccess({ message: successMsg });
    if (opts.onDone) opts.onDone(result);
    return result;
  };

  /** Status-only forward (no new document) with confirm + success. */
  VG.forwardStatus = async function (opts) {
    if (!opts || typeof opts.run !== "function") return null;
    const ok = await VG.confirmForward({
      title: opts.confirmTitle || "Confirm",
      message: opts.confirmMessage || "Are you sure you want to update this status?",
    });
    if (!ok) return null;
    let result = null;
    try {
      result = opts.run();
      if (result && typeof result.then === "function") result = await result;
    } catch (e) {
      VG.toast((e && e.message) || "Update failed", "error");
      return null;
    }
    if (VG.store && VG.store.recordDocumentConversion) {
      VG.store.recordDocumentConversion({
        fromType: opts.fromType,
        fromNo: opts.fromNo,
        fromId: opts.fromId,
        toType: opts.toType || "Status",
        toNo: opts.toNo || opts.statusChange || "",
        toId: opts.toId || "",
        actor: opts.actor,
        statusChange: opts.statusChange,
        confirmed: true,
      });
    }
    await VG.showSuccess({ message: opts.successMessage || "Status updated successfully." });
    if (opts.onDone) opts.onDone(result);
    return result;
  };
})(window.VG = window.VG || {});

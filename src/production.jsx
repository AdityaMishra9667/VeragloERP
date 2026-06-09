/* Veraglo ERP — Production Planning (functional, SO → WO → QC). */
(function (VG) {
  const { useState } = React;
  const ui = VG.ui, fx = VG.fx, store = VG.store, inr = VG.fmt.inr, today = VG.fmt.todayISO;
  const { Icon, Button, Pill, Card } = ui;
  const { Field, Text, Area, Num, DateF, Select, MasterSelect, Modal, InternalScreen, RecordTable, PageHead, StatusTag, printDocument, DocActions, exportCSV } = fx;

  const custName = (id) => (store.get("customers", id) || {}).name || "—";
  const canSeeCustomer = (roleKey) => store.canViewCustomerForRole ? store.canViewCustomerForRole(roleKey) : (roleKey === "admin");
  const WO_STATUS = {
    "Received from Sales": "#60a5fa", "BOM Pending": "#f59e0b", "BOM Under Review": "#a78bfa", "BOM Approved": "#22d3ee",
    "Material Requirement Generated": "#8b5cf6", "Material Availability Checked": "#0ea5e9", "Material Partially Issued": "#f97316",
    "Material Fully Issued": "#22c55e", "Production Planned": "#6366f1", "Production In Progress": "#f59e0b", "Production Completed": "#34d399",
    "Material Returned": "#14b8a6", "Sent to Finished Goods Store": "#10b981", Closed: "#64748b", Planned: "#a78bfa", Released: "#22d3ee", Running: "#f59e0b", Completed: "#34d399"
  };

  const fmtTs = (ts) => ts ? new Date(ts).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
  const fmtDate = (d) => d || "—";
  const priorityColor = (p) => (p === "Critical" ? "#ef4444" : p === "High Priority" ? "#f59e0b" : p === "Urgent" ? "#a855f7" : "#6366f1");

  function woItem(wo) {
    return wo.finishedItemId ? store.get("items", wo.finishedItemId) : (store.findItemBySku ? store.findItemBySku(wo.sku) : null);
  }

  function woBundle(wo, roleKey) {
    const raw = store.get("workOrders", wo.id) || wo;
    const view = store.workOrderViewForRole ? store.workOrderViewForRole(raw, roleKey) : raw;
    const so = view.salesOrderId ? (store.salesOrderProductionView ? store.salesOrderProductionView(store.get("salesOrders", view.salesOrderId), roleKey) : store.get("salesOrders", view.salesOrderId)) : null;
    const bom = view.bomId ? store.get("boms", view.bomId) : (store.getDefaultBom && store.getDefaultBom(view.finishedItemId || (woItem(view) || {}).id));
    const mr = view.materialRequirementId ? store.get("materialRequirements", view.materialRequirementId) : null;
    const item = woItem(view);
    const timeline = store.workOrderTimeline ? store.workOrderTimeline(view.id) : [];
    const reqs = bom && store.explodeBom ? store.explodeBom(bom.id, view.qtyPlanned || 1) : [];
    return { wo: view, so, bom, mr, item, timeline, reqs };
  }

  function DetailField({ label, value, mono, full, className }) {
    return (
      <div className={(full ? "sm:col-span-2 lg:col-span-3 " : "") + (className || "")}>
        <div className="text-[11px] uppercase tracking-wide text-[var(--vg-text-muted)] mb-1">{label}</div>
        <div className={"text-sm whitespace-pre-wrap break-words " + (mono ? "vg-doc-no" : "")}>{value != null && value !== "" ? value : "—"}</div>
      </div>
    );
  }

  function WorkOrderTimeline({ steps }) {
    if (!steps || !steps.length) return null;
    return (
      <Card className="p-4 mt-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--vg-text-muted)] mb-4">Production timeline</div>
        <div className="relative">
          <div className="hidden lg:block absolute left-[11px] top-2 bottom-2 w-px bg-white/10" aria-hidden="true" />
          <div className="space-y-3">
            {steps.map((s) => (
              <div key={s.id} className="flex gap-3 items-start">
                <span className={"relative z-[1] mt-0.5 grid place-items-center w-6 h-6 rounded-full shrink-0 text-[10px] font-bold "
                  + (s.state === "done" ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                    : s.state === "current" ? "bg-amber-500/20 text-amber-400 ring-2 ring-amber-400/50"
                      : "bg-white/5 text-[var(--vg-text-muted)] ring-1 ring-white/10")}>
                  {s.state === "done" ? "✓" : s.state === "current" ? "●" : ""}
                </span>
                <div className="flex-1 min-w-0 pb-1">
                  <div className={"text-sm font-medium " + (s.state === "pending" ? "opacity-55" : "")}>{s.label}</div>
                  <div className="text-xs text-[var(--vg-text-muted)] mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    {s.at && <span>{typeof s.at === "number" ? fmtTs(s.at) : fmtDate(s.at)}</span>}
                    {s.by && <span>By {s.by}</span>}
                    {s.note && <span>{s.note}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  function buildWoDoc(wo, roleKey) {
    const { wo: w, so, bom, mr, item, timeline, reqs } = woBundle(wo, roleKey);
    const co = store.company();
    const matRows = (mr && mr.lines && mr.lines.length ? mr.lines : reqs).map((ln, i) => {
      const sku = ln.sku || (store.get("items", ln.itemId) || {}).sku || "";
      const name = ln.itemName || ln.name || (store.get("items", ln.itemId) || {}).name || "";
      const req = Number(ln.requiredQty ?? ln.qty) || 0;
      const issued = Number(ln.issuedQty) || 0;
      const pending = Math.max(0, req - issued);
      return `<tr><td>${i + 1}</td><td><span class="vg-doc-no">${sku}</span><br>${name}</td><td class="vg-right">${req} ${ln.unit || ""}</td><td class="vg-right">${issued}</td><td class="vg-right">${pending}</td><td>${ln.issueStatus || ln.issueMethod || "—"}</td></tr>`;
    }).join("");
    const tlRows = (timeline || []).map((s) => `<tr><td>${s.label}</td><td>${s.state === "done" ? "Complete" : s.state === "current" ? "In progress" : "Pending"}</td><td>${s.at ? (typeof s.at === "number" ? fmtTs(s.at) : fmtDate(s.at)) : "—"}</td><td>${s.by || "—"}</td></tr>`).join("");
    const revRows = (w.revisionHistory || so && so.revisionHistory || []).slice().reverse().map((h) =>
      `<tr><td>${h.woRevisionNo || h.revisionNo || h.revision || "—"}</td><td>SO Rev ${h.soRevisionNo != null ? h.soRevisionNo : (h.revisionNo != null ? h.revisionNo : "—")}</td><td>${h.reason || "—"}</td><td>${h.revisedAt ? fmtTs(h.revisedAt) : "—"}</td><td>${h.revisedBy || h.approvedBy || "—"}</td></tr>`
    ).join("");
    const inner = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px">
        <div><img src="${co.logo || "assets/veraglo-logo.png"}" alt="" style="height:48px;max-width:180px;object-fit:contain" onerror="this.style.display='none'"/>
        <div style="font-size:16pt;font-weight:700;margin-top:8px">${co.tradeName || co.name || "Veraglo ERP"}</div></div>
        <div style="text-align:right;font-size:9pt;line-height:1.5">
          <div style="font-size:14pt;font-weight:800">WORK ORDER</div>
          <div><b>No:</b> ${w.no}</div>
          <div><b>Date:</b> ${w.date || "—"}</div>
          <div><b>Print:</b> ${new Date().toLocaleString("en-IN")}</div>
        </div>
      </div>
      <div class="vg-cols">
        <div class="vg-card"><b>Linked sales order</b>SO: ${w.salesOrderNo || "—"}<br>SO revision: ${w.soRevisionNo != null ? w.soRevisionNo : (so && so.revisionNo != null ? so.revisionNo : "—")}<br>WO revision: ${w.revisionNo || "Rev-00"}</div>
        <div class="vg-card"><b>Product</b>SKU: ${w.sku || "—"}<br>${w.product || item && item.name || "—"}<br>Qty: ${w.qtyPlanned || 0} ${w.unit || item && item.unit || "Nos"}</div>
        <div class="vg-card"><b>Schedule</b>Priority: ${w.priority || "Normal"}<br>Required: ${fmtDate(w.requiredDate)}<br>Dispatch: ${fmtDate(w.expectedDispatchDate || w.targetDate)}<br>Status: ${w.status}</div>
      </div>
      <div class="vg-terms"><b>Description</b><br>${(item && item.description) || w.product || "—"}</div>
      <div class="vg-terms"><b>Technical specifications</b><br>${w.technicalSpec || "—"}</div>
      <div class="vg-terms"><b>Special manufacturing instructions</b><br>${w.productionInstructions || "—"}</div>
      <div class="vg-terms"><b>Internal remarks</b><br>${w.internalRemarks || w.remarks || "—"}</div>
      <div class="vg-terms"><b>BOM reference</b> ${w.bomNo || "—"} · ${w.bomRevisionNo || "—"} · Drawing: ${w.drawingRef || "—"} · Docs: ${w.documentRef || "—"}</div>
      ${revRows ? `<div style="margin-top:14px"><b>Revision history</b><table class="vg-tbl"><thead><tr><th>WO Rev</th><th>SO Rev</th><th>Reason</th><th>Date</th><th>By</th></tr></thead><tbody>${revRows}</tbody></table></div>` : ""}
      <div style="margin-top:14px"><b>Material requirement summary</b><table class="vg-tbl"><thead><tr><th>#</th><th>Material</th><th class="vg-right">Required</th><th class="vg-right">Issued</th><th class="vg-right">Pending</th><th>Issue</th></tr></thead><tbody>${matRows || "<tr><td colspan=6>No materials</td></tr>"}</tbody></table></div>
      <div style="margin-top:14px"><b>Production timeline</b><table class="vg-tbl"><thead><tr><th>Stage</th><th>Status</th><th>Date</th><th>By</th></tr></thead><tbody>${tlRows || "<tr><td colspan=4>No timeline</td></tr>"}</tbody></table></div>
      <div class="vg-sign"><div>Prepared by: <b>${w.preparedBy || "—"}</b></div><div>Approved by: <b>${w.revisionApprovedBy || w.acceptedBy || "—"}</b></div><div>Production sign-off: <b>________________</b></div><div>For ${co.name || co.tradeName || "Company"}</div></div>`;
    return { title: "Work Order", subtitle: w.no + (w.salesOrderNo ? " · SO " + w.salesOrderNo : ""), inner, docType: "Work Order" };
  }

  function exportWoExcel(bundle) {
    const { wo: w, mr, reqs } = bundle;
    const rows = (mr && mr.lines && mr.lines.length ? mr.lines : reqs).map((ln) => {
      const item = store.get("items", ln.itemId) || {};
      const req = Number(ln.requiredQty ?? ln.qty) || 0;
      const issued = Number(ln.issuedQty) || 0;
      return {
        sku: ln.sku || item.sku || "",
        name: ln.itemName || ln.name || item.name || "",
        required: req,
        issued,
        pending: Math.max(0, req - issued),
        unit: ln.unit || item.unit || "Nos",
        availability: ln.issueStatus || (store.onHand(ln.itemId) >= req ? "Available" : "Short"),
        alternate: ln.alternateItemId ? ((store.get("items", ln.alternateItemId) || {}).sku || ln.alternateItemId) : "",
      };
    });
    exportCSV("Work-Order-" + w.no.replace(/\//g, "-"), [
      { key: "sku", label: "SKU" }, { key: "name", label: "Material" }, { key: "required", label: "Required" },
      { key: "issued", label: "Issued" }, { key: "pending", label: "Pending" }, { key: "unit", label: "Unit" },
      { key: "availability", label: "Availability" }, { key: "alternate", label: "Alternate" },
    ], rows);
  }

  function WorkOrderDetailPage({ wo, roleKey, can, onBack, onComplete, onRefresh }) {
    const bundle = woBundle(wo, roleKey);
    const { wo: w, so, bom, mr, item, timeline, reqs } = bundle;
    const showCust = canSeeCustomer(roleKey);
    const matLines = mr && mr.lines && mr.lines.length ? mr.lines : reqs.map((r) => {
      const it = store.get("items", r.itemId) || {};
      const req = Number(r.qty) || 0;
      const avail = store.onHand(r.itemId);
      return {
        itemId: r.itemId, sku: r.sku || it.sku, itemName: r.name || it.name, description: it.description,
        requiredQty: req, issuedQty: 0, pendingQty: req, unit: r.unit || it.unit || "Nos",
        availableStock: avail, issueStatus: avail >= req ? "Ready" : "Shortage", issueMethod: r.issueMethod || "Manual",
        alternateItemId: r.altItemId || "", alternateApproved: false, expectedAvailabilityDate: "",
      };
    });
    const shortages = (matLines || []).filter((ln) => (Number(ln.pendingQty ?? (Number(ln.requiredQty) - Number(ln.issuedQty))) || 0) > 0 || ln.issueStatus === "Shortage" || (Number(ln.availableStock) || 0) < (Number(ln.requiredQty) || 0));

    return (
      <InternalScreen
        onBack={onBack}
        backLabel="Back to work orders"
        breadcrumbs={[
          { label: "Production Planning", onClick: onBack },
          { label: "Work Orders", onClick: onBack },
          { label: w.no },
        ]}
        title={"Work Order " + w.no}
        subtitle={[w.product, w.salesOrderNo ? "SO " + w.salesOrderNo : null, showCust && w.customerId ? custName(w.customerId) : null].filter(Boolean).join(" · ")}
        footer={<>
          {can("print") && <DocActions docType="Work Order" build={() => buildWoDoc(w, roleKey)} onEmail={() => {
            const subject = encodeURIComponent("Work Order " + w.no);
            const body = encodeURIComponent("Work order " + w.no + " — please refer to the attached PDF/print copy from Veraglo ERP for manufacturing record.");
            window.location.href = "mailto:?subject=" + subject + "&body=" + body;
          }} />}
          {can("export") && <Button variant="soft" icon="download" onClick={() => exportWoExcel(bundle)}>Export Excel</Button>}
          {can("edit") && bom && (
            <Button variant="soft" icon="check" onClick={() => { store.useExistingBomForWorkOrder(w.id, bom.id, roleKey); VG.toast("BOM attached to WO"); onRefresh(); }}>Use this BOM</Button>
          )}
          {!bom && can("edit") && (
            <Button variant="soft" icon="plus" onClick={() => {
              const created = store.createWorkOrderSpecificBom(w.id, { name: "WO " + w.no + " BOM", qtyOutput: 1, lines: [] }, roleKey);
              if (created) VG.toast("WO-specific BOM created: " + created.no);
              onRefresh();
            }}>Create WO BOM</Button>
          )}
          {w.bomId && can("approve") && (
            <Button variant="soft" icon="shield" onClick={() => { store.approveBomForWorkOrder(w.id, roleKey); VG.toast("BOM approved for WO"); onRefresh(); }}>Approve BOM</Button>
          )}
          {w.bomId && can("edit") && (
            <Button variant="soft" icon="edit" onClick={() => { const reason = window.prompt("Revision reason (mandatory):", ""); if (!reason) return; store.reviseWorkOrderBom(w.id, { reason }, roleKey); VG.toast("BOM revision raised"); onRefresh(); }}>Revise BOM</Button>
          )}
          {bom && (w.status === "Production Planned" || w.status === "Production In Progress" || w.status === "Released" || w.status === "Running") && can("edit") && (
            <Button variant="soft" icon="logout" onClick={() => {
              const res = store.issueBomForWorkOrder(w.id, roleKey, { allowPartial: true });
              if (!res.ok) VG.toast(res.reason || "Issue failed", "error");
              else { VG.toast("Issued " + res.issued.length + " component(s)" + (res.skipped.length ? " · " + res.skipped.length + " short" : ""), res.skipped.length ? "warn" : "success"); onRefresh(); }
            }}>Issue BOM materials</Button>
          )}
          {w.revisionPendingAck && can("edit") && (
            <Button variant="soft" onClick={() => { store.acknowledgeWorkOrderRevision(w.id, roleKey); VG.toast("Revision acknowledged"); onRefresh(); }}>Acknowledge revision</Button>
          )}
          {w.status !== "Completed" && w.status !== "Production Completed" && can("edit") && (
            <Button icon="check" onClick={() => onComplete(w)}>Mark complete</Button>
          )}
        </>}
      >
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <StatusTag value={w.status} map={WO_STATUS} />
          <Pill color={priorityColor(w.priority)}>{w.priority || "Normal"}</Pill>
          {w.revisionPendingAck && <Pill color="#f59e0b">Revision pending acknowledgement</Pill>}
          {w.productionStatus && <Pill color="#6366f1">{w.productionStatus}</Pill>}
          {w.issueStatus && w.issueStatus !== "Not Issued" && <Pill color="#8b5cf6">{w.issueStatus}</Pill>}
        </div>

        <Card className="p-4 mb-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--vg-text-muted)] mb-3">Work order details</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <DetailField label="Work order number" value={w.no} mono />
            <DetailField label="Work order date" value={w.date} />
            <DetailField label="Current status" value={w.status} />
            <DetailField label="Linked sales order" value={w.salesOrderNo} mono />
            <DetailField label="Sales order revision" value={w.soRevisionNo != null ? w.soRevisionNo : (so && so.revisionNo)} />
            <DetailField label="Work order revision" value={w.revisionNo || "Rev-00"} />
            <DetailField label="Product / item SKU" value={w.sku} mono />
            <DetailField label="Product / item name" value={w.product || (item && item.name)} />
            <DetailField label="Quantity to manufacture" value={(w.qtyPlanned || 0) + " " + (w.unit || (item && item.unit) || "Nos")} />
            <DetailField label="Qty produced" value={(w.qtyProduced || 0) + " / " + (w.qtyPlanned || 0)} />
            <DetailField label="Priority" value={w.priority || "Normal"} />
            <DetailField label="Required delivery date" value={w.requiredDate || w.targetDate} />
            <DetailField label="Production planned start" value={mr && mr.productionStartDate ? mr.productionStartDate : (w.acceptedAt ? fmtTs(w.acceptedAt) : "—")} />
            <DetailField label="Production planned completion" value={mr && mr.expectedProductionDate ? mr.expectedProductionDate : "—"} />
            <DetailField label="Expected dispatch date" value={w.expectedDispatchDate || w.targetDate || w.requiredDate} />
            <DetailField label="BOM number" value={w.bomNo || (bom && bom.no)} mono />
            <DetailField label="BOM revision" value={w.bomRevisionNo || (bom && bom.revision)} />
            <DetailField label="Drawing / document reference" value={[w.drawingRef, w.documentRef].filter(Boolean).join(" · ")} />
            <DetailField label="Prepared by" value={w.preparedBy} />
            <DetailField label="Accepted by" value={w.acceptedBy} />
            <DetailField label="Complete item description" value={(item && item.description) || w.product} full />
            <DetailField label="Technical specifications" value={w.technicalSpec} full />
            <DetailField label="Special manufacturing instructions" value={w.productionInstructions} full />
            <DetailField label="Internal remarks" value={w.internalRemarks || w.remarks} full />
          </div>
        </Card>

        {(so || (w.revisionHistory || []).length > 0) && (
          <Card className="p-4 mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--vg-text-muted)] mb-3">Sales order → work order revision tracking</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <DetailField label="Linked SO number" value={w.salesOrderNo} mono />
              <DetailField label="SO revision (latest approved)" value={w.soRevisionNo != null ? w.soRevisionNo : (so && so.revisionNo)} />
              <DetailField label="WO revision" value={w.revisionNo || "Rev-00"} />
              <DetailField label="Latest approved" value={w.revisionApprovedAt ? fmtTs(w.revisionApprovedAt) + (w.revisionApprovedBy ? " · " + w.revisionApprovedBy : "") : (so && so.revisionApprovedAt ? fmtTs(so.revisionApprovedAt) : "—")} />
            </div>
            {(w.revisionHistory || so && so.revisionHistory || []).length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm vg-tbl">
                  <thead><tr><th>WO Rev</th><th>SO Rev</th><th>Reason</th><th>Revision date</th><th>Revised / approved by</th></tr></thead>
                  <tbody>
                    {(w.revisionHistory && w.revisionHistory.length ? w.revisionHistory : (so && so.revisionHistory) || []).slice().reverse().map((h, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-3 py-2 vg-doc-no">{h.woRevisionNo || h.revision || ("Rev-" + String(h.revisionNo || 0).padStart(2, "0"))}</td>
                        <td className="px-3 py-2">{h.soRevisionNo != null ? h.soRevisionNo : h.revisionNo}</td>
                        <td className="px-3 py-2">{h.reason || "—"}</td>
                        <td className="px-3 py-2">{h.revisedAt ? fmtTs(h.revisedAt) : (h.approvedAt ? fmtTs(h.approvedAt) : "—")}</td>
                        <td className="px-3 py-2">{h.revisedBy || h.approvedBy || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--vg-text-muted)]">No revision history recorded yet.</p>
            )}
            {!showCust && <p className="text-xs text-[var(--vg-text-muted)] mt-3">Customer commercial details are hidden for your role. Contact Admin if you need access.</p>}
          </Card>
        )}

        <Card className="p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--vg-text-muted)]">Material &amp; BOM information</div>
            {mr && <Pill color="#8b5cf6">{mr.no}</Pill>}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <DetailField label="BOM selected" value={w.bomNo || (bom && bom.no) || "None"} mono />
            <DetailField label="BOM revision" value={w.bomRevisionNo || (bom && bom.revision) || "—"} />
            <DetailField label="Material issue status" value={w.issueStatus || "Not Issued"} />
            <DetailField label="Issue method" value="Manual / backflush (per BOM line)" />
          </div>
          {matLines.length === 0 ? (
            <p className="text-sm text-[var(--vg-text-muted)]">No BOM or material requirement linked yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm vg-record-table">
                <thead><tr>
                  <th>Material</th><th className="text-right">Required</th><th className="text-right">Issued</th><th className="text-right">Pending</th>
                  <th>Availability</th><th>Expected date</th><th>Issue</th><th>Alternate</th>
                </tr></thead>
                <tbody>
                  {matLines.map((ln, i) => {
                    const itemRow = store.get("items", ln.itemId) || {};
                    const req = Number(ln.requiredQty ?? ln.qty) || 0;
                    const issued = Number(ln.issuedQty) || 0;
                    const pending = Number(ln.pendingQty) || Math.max(0, req - issued);
                    const avail = Number(ln.availableStock != null ? ln.availableStock : store.onHand(ln.itemId));
                    const short = pending > 0 || avail < req;
                    return (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-3 py-2">
                          <div className="vg-doc-no text-xs">{ln.sku || itemRow.sku}</div>
                          <div>{ln.itemName || ln.name || itemRow.name}</div>
                        </td>
                        <td className="px-3 py-2 text-right">{req} {ln.unit || itemRow.unit || "Nos"}</td>
                        <td className="px-3 py-2 text-right">{issued}</td>
                        <td className={"px-3 py-2 text-right " + (pending > 0 ? "text-amber-400" : "")}>{pending}</td>
                        <td className="px-3 py-2">{ln.issueStatus || (short ? "Shortage" : "Available")}</td>
                        <td className="px-3 py-2">{ln.expectedAvailabilityDate || ln.expectedReceiptDate || "—"}</td>
                        <td className="px-3 py-2">{ln.issueMethod || "Manual"}</td>
                        <td className="px-3 py-2">
                          {ln.alternateItemId ? (
                            <span>{(store.get("items", ln.alternateItemId) || {}).sku || ln.alternateItemId}{ln.alternateApproved ? " ✓" : ""}</span>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {shortages.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="text-sm font-semibold text-amber-200 mb-2">Shortage list ({shortages.length})</div>
              <ul className="text-sm space-y-1 opacity-90">
                {shortages.map((ln, i) => (
                  <li key={i}>{ln.sku || (store.get("items", ln.itemId) || {}).sku} — pending {Number(ln.pendingQty) || Math.max(0, (Number(ln.requiredQty) || 0) - (Number(ln.issuedQty) || 0))} {ln.unit || "Nos"}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <WorkOrderTimeline steps={timeline} />
      </InternalScreen>
    );
  }

  function CompleteModal({ wo, onClose, roleKey }) {
    const [qty, setQty] = useState(wo.qtyPlanned || 0);
    const [rejectQty, setRejectQty] = useState(0);
    const [remarks, setRemarks] = useState("");
    const [batchNo, setBatchNo] = useState(wo.batchNo || "");
    const [operatorName, setOperatorName] = useState("");
    const [supervisorName, setSupervisorName] = useState("");
    const [documents, setDocuments] = useState("");
    function submit() {
      store.completeWorkOrder(wo.id, { qtyProduced: qty, rejectQty, remarks, batchNo, operatorName, supervisorName, productionDocuments: documents }, roleKey);
      VG.toast("WO " + wo.no + " completed · sent to Quality & Dispatch queue", "success");
      onClose(true);
    }
    return (
      <Modal open onClose={() => onClose(false)} size="md" title={"Complete " + wo.no} subtitle="Posts production output and creates QC inspection"
        footer={<><Button variant="soft" onClick={() => onClose(false)}>Cancel</Button><Button icon="check" onClick={submit}>Complete WO</Button></>}>
        <div className="grid gap-3">
          <Field label="Quantity produced" required><Num value={qty} onChange={setQty} /></Field>
          <Field label="Rejected during production"><Num value={rejectQty} onChange={setRejectQty} /></Field>
          <Field label="Batch / lot number"><Text value={batchNo} onChange={setBatchNo} /></Field>
          <Field label="Operator name"><Text value={operatorName} onChange={setOperatorName} /></Field>
          <Field label="Supervisor name"><Text value={supervisorName} onChange={setSupervisorName} /></Field>
          <Field label="Production docs"><Text value={documents} onChange={setDocuments} placeholder="prod-report.pdf" /></Field>
          <Field label="Remarks"><Area value={remarks} onChange={setRemarks} rows={2} /></Field>
          <p className="text-xs opacity-60">Sales order moves through Production Completed → Sent to QC. Final dispatch starts only after QC acceptance.</p>
        </div>
      </Modal>
    );
  }

  function Dashboard(props) {
    return VG.ModuleDashboard ? <VG.ModuleDashboard modId="production" {...props} /> : null;
  }

  function WorkOrdersPage({ roleKey, can }) {
    VG.useDB();
    const [view, setView] = useState(null);
    const [complete, setComplete] = useState(null);
    const rows = store.list("workOrders").slice().reverse().map((w) => store.workOrderViewForRole ? store.workOrderViewForRole(w, roleKey) : w);
    const showCust = canSeeCustomer(roleKey);
    const cols = [
      { key: "no", label: "WO #", render: (r) => <span className="font-mono text-xs">{r.no}</span> },
      { key: "date", label: "Date" },
      { key: "salesOrderNo", label: "Sales order", render: (r) => r.salesOrderNo || "—" },
      ...(showCust ? [{ key: "customerId", label: "Customer", render: (r) => custName(r.customerId), csv: (r) => custName(r.customerId) }] : []),
      { key: "product", label: "Product" },
      { key: "bomNo", label: "BOM", render: (r) => r.bomNo || "—" },
      { key: "priority", label: "Priority", render: (r) => <Pill color={r.priority === "Critical" ? "#ef4444" : r.priority === "High Priority" ? "#f59e0b" : r.priority === "Urgent" ? "#a855f7" : "#6366f1"}>{r.priority || "Normal"}</Pill> },
      { key: "qtyPlanned", label: "Planned", render: (r) => r.qtyPlanned + " / " + (r.qtyProduced || 0) },
      { key: "status", label: "Status", render: (r) => <StatusTag value={r.status} map={WO_STATUS} /> },
      { key: "rev", label: "Revision", render: (r) => r.revisionPendingAck ? <Pill color="#f59e0b">Rev {r.revisionNo || 0} pending</Pill> : (r.revisionNo ? <Pill color="#22d3ee">Rev {r.revisionNo}</Pill> : "—") },
      { key: "act", label: "Action", render: (r) => (
        <div className="flex gap-1 flex-wrap">
          {r.revisionPendingAck && can("edit") && <Button variant="soft" className="!py-1" onClick={() => { store.acknowledgeWorkOrderRevision(r.id, roleKey); VG.toast("Revision acknowledged"); }}>Acknowledge revision</Button>}
          {(r.status === "Received from Sales" || r.status === "BOM Pending" || r.status === "Planned") && can("edit") && <Button variant="soft" className="!py-1" onClick={() => { store.acceptWorkOrder(r.id, roleKey); VG.toast("WO accepted for planning"); }}>Accept</Button>}
          {!r.bomId && can("edit") && <Button variant="soft" className="!py-1" onClick={() => { VG.goTo("production", "bom"); VG.toast("Select or create BOM, then attach in WO details"); }}>BOM</Button>}
          {!r.materialRequirementId && can("edit") && <Button variant="soft" className="!py-1" onClick={() => {
            const mr = store.planMaterialRequirement(r.id, { priority: r.priority, requiredByDate: r.requiredDate }, roleKey);
            if (mr) VG.toast("Material requirement " + mr.no + " generated");
          }}>Plan material</Button>}
          {(r.status === "Material Fully Issued" || r.status === "Production Planned" || r.status === "Released" || r.status === "Running") && can("edit") && <Button variant="soft" className="!py-1" onClick={() => { store.update("workOrders", r.id, { status: "Production In Progress", productionStatus: "In Progress" }, roleKey); if (r.salesOrderId) store._setSOStage(r.salesOrderId, "Production In Progress", roleKey, "WO running"); VG.toast("WO running"); }}>Start</Button>}
          {(r.status === "Production In Progress" || r.status === "Released" || r.status === "Running") && can("edit") && <Button variant="soft" className="!py-1" onClick={() => setComplete(r)}>Complete</Button>}
          {r.status === "Completed" && <Button variant="soft" className="!py-1" onClick={() => VG.goTo("dispatch", "shipments")}>Dispatch</Button>}
        </div>
      ) },
    ];
    if (complete) {
      return <CompleteModal wo={complete} onClose={(ok) => { setComplete(null); if (ok) setView(null); }} roleKey={roleKey} />;
    }
    if (view) {
      return (
        <WorkOrderDetailPage
          wo={view}
          roleKey={roleKey}
          can={can}
          onBack={() => setView(null)}
          onComplete={setComplete}
          onRefresh={() => setView(store.get("workOrders", view.id) || view)}
        />
      );
    }
    return (
      <div>
        <PageHead title="Work Orders" desc="Release → material planning → production completion → QC handoff" />
        <RecordTable tableId="production-work-orders" title="Work orders" columns={cols} rows={rows} can={can} printTitle="Work Orders" searchKeys={["no", "salesOrderNo", "product"]}
          filters={[{ key: "status", label: "All status", options: Object.keys(WO_STATUS) }]}
          onView={(r) => setView(r)} empty="No work orders — release from a confirmed sales order on the dashboard" />
      </div>
    );
  }

  function ShopFloorPage({ roleKey, can }) {
    VG.useDB();
    const lines = ["Line 1 — Drivers", "Line 2 — Assembly", "Line 3 — Packing"];
    const wos = store.list("workOrders").filter((w) => w.status === "Released" || w.status === "Running");
    return (
      <div className="space-y-4">
        <PageHead title="Shop Floor" desc="Live work order status by production line" />
        <div className="grid lg:grid-cols-3 gap-4">
          {lines.map((line) => {
            const onLine = wos.filter((w) => (w.line || "Line 1") === line.split(" — ")[0]);
            const pct = onLine.length ? Math.min(100, Math.round(onLine.reduce((s, w) => s + ((w.qtyProduced || 0) / (w.qtyPlanned || 1)) * 100, 0) / onLine.length)) : 0;
            return (
              <Card key={line} className="p-4">
                <div className="flex justify-between text-sm font-medium mb-2"><span>{line}</span><Pill color={pct > 80 ? "#34d399" : "#f59e0b"}>{onLine.length ? "Running" : "Idle"}</Pill></div>
                <div className="h-2 rounded-full bg-white/10 mb-3"><div className="h-full rounded-full" style={{ width: pct + "%", background: "var(--accent)" }} /></div>
                {onLine.length === 0 ? <div className="text-xs opacity-50">No active WO</div> : onLine.map((w) => (
                  <div key={w.id} className="text-xs glass rounded-lg p-2 mb-1.5">{w.no} · {w.product} · {w.qtyProduced || 0}/{w.qtyPlanned}</div>
                ))}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  function ReportsPage() {
    VG.useDB();
    const wos = store.list("workOrders");
    const run = (title, rows) => printDocument({ title, subtitle: store.company().name, inner: `<table class="vg-tbl"><thead><tr><th>WO</th><th>SO</th><th>Customer</th><th>Status</th><th>Qty</th></tr></thead><tbody>${rows.map((w) => `<tr><td>${w.no}</td><td>${w.salesOrderNo || ""}</td><td>${custName(w.customerId)}</td><td>${w.status}</td><td>${w.qtyProduced || 0}/${w.qtyPlanned}</td></tr>`).join("") || "<tr><td colspan=5>No data</td></tr>"}</tbody></table>` }, "preview");
    return (
      <div>
        <PageHead title="Production Reports" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-4 flex items-center gap-4"><Icon name="chart" size={22} /><div className="flex-1"><div className="font-medium text-sm">Work Order Register</div><div className="text-xs opacity-55">{wos.length} records</div></div><Button variant="soft" onClick={() => run("WO Register", wos)}>Open</Button></Card>
          <Card className="p-4 flex items-center gap-4"><Icon name="factory" size={22} /><div className="flex-1"><div className="font-medium text-sm">Active WOs</div><div className="text-xs opacity-55">{wos.filter((w) => w.status === "Released").length} active</div></div><Button variant="soft" onClick={() => run("Active WOs", wos.filter((w) => w.status === "Released"))}>Open</Button></Card>
        </div>
      </div>
    );
  }

  function MaterialControlPage({ roleKey, can }) {
    VG.useDB();
    const [woId, setWoId] = useState("");
    const [refresh, setRefresh] = useState(0);
    const [consumedEdit, setConsumedEdit] = useState({});
    const [scrapEdit, setScrapEdit] = useState({});
    const [returnQtyEdit, setReturnQtyEdit] = useState({});
    const wos = store.list("workOrders").filter((w) => !!w.materialRequirementId);
    const wo = woId ? store.get("workOrders", woId) : null;
    const mr = wo && wo.materialRequirementId ? store.get("materialRequirements", wo.materialRequirementId) : null;
    const returns = store.list("returns").filter((r) => r.workOrderId === woId && r.kind === "Production Return");
    const scraps = store.list("scrap").filter((s) => s.workOrderId === woId);

    function sumByItem(rows, key) {
      const out = {};
      rows.forEach((r) => { out[r.itemId] = (out[r.itemId] || 0) + (Number(r[key]) || 0); });
      return out;
    }
    const returnedMap = sumByItem(returns, "qty");
    const scrapMap = sumByItem(scraps, "qty");

    function saveConsumption() {
      if (!mr || !can("edit")) return;
      const consume = {};
      const scrap = {};
      (mr.lines || []).forEach((ln) => {
        const baseConsumed = Number(ln.consumedQty ?? ln.issuedQty ?? 0);
        const baseScrap = Number(ln.scrapQty ?? scrapMap[ln.itemId] ?? 0);
        consume[ln.itemId] = Number(consumedEdit[ln.itemId] ?? baseConsumed);
        scrap[ln.itemId] = Number(scrapEdit[ln.itemId] ?? baseScrap);
      });
      store.recordWorkOrderMaterialConsumption(wo.id, { consume, scrap }, roleKey);
      VG.toast("Material consumption updated");
      setConsumedEdit({});
      setScrapEdit({});
      setRefresh((x) => x + 1);
    }
    function createReturnLine(itemId) {
      if (!wo || !mr || !can("edit")) return;
      const qty = Number(returnQtyEdit[itemId] || 0);
      if (qty <= 0) return VG.toast("Enter return quantity", "error");
      store.returnMaterialFromProduction(wo.id, { lines: [{ itemId, qtyReturned: qty, condition: "Good", remarks: "Return from WO Material Control" }], acceptedBy: roleKey }, roleKey);
      VG.toast("Production return created");
      setReturnQtyEdit((p) => ({ ...p, [itemId]: 0 }));
      setRefresh((x) => x + 1);
    }

    return (
      <div key={refresh} className="space-y-4">
        <PageHead title="WO Material Control" desc="Planned vs issued vs consumed vs returned vs scrap with alternate approval and shortage classification" />
        <Card className="p-3">
          <Field label="Work order">
            <Select value={woId} onChange={setWoId} options={[{ value: "", label: "Select work order" }].concat(wos.map((w) => ({ value: w.id, label: w.no + " · " + (w.product || "") })))} />
          </Field>
        </Card>
        {!mr && <Card className="p-6 text-center opacity-60">Select a work order with generated material requirement.</Card>}
        {mr && (
          <>
            <Card className="p-3">
              <div className="text-sm font-medium mb-2">Shortage Classification Panel</div>
              <div className="text-xs opacity-65">Classify each shortage as Critical / Non-critical / Substitute Available with vendor status tracking.</div>
            </Card>
            <div className="overflow-x-auto rounded-xl glass">
              <table className="w-full text-xs">
                <thead><tr className="opacity-60 text-[10px] uppercase border-b border-white/10">
                  <th className="text-left px-2 py-2">Item</th>
                  <th className="text-right px-2 py-2">Planned</th>
                  <th className="text-right px-2 py-2">Issued</th>
                  <th className="text-right px-2 py-2">Consumed</th>
                  <th className="text-right px-2 py-2">Returned</th>
                  <th className="text-right px-2 py-2">Scrap</th>
                  <th className="text-right px-2 py-2">Variance</th>
                  <th className="text-left px-2 py-2">Alternate</th>
                  <th className="text-left px-2 py-2">Shortage</th>
                  <th className="text-left px-2 py-2">Production Return</th>
                </tr></thead>
                <tbody>
                  {(mr.lines || []).map((ln, i) => {
                    const item = store.get("items", ln.itemId) || {};
                    const planned = Number(ln.requiredQty) || 0;
                    const issued = Number(ln.issuedQty) || 0;
                    const consumed = Number(consumedEdit[ln.itemId] ?? (ln.consumedQty ?? issued)) || 0;
                    const returned = Number(ln.returnedQty || returnedMap[ln.itemId] || 0);
                    const scrap = Number(scrapEdit[ln.itemId] ?? (ln.scrapQty || scrapMap[ln.itemId] || 0));
                    const variance = Math.round((planned - consumed - scrap + returned) * 1000) / 1000;
                    return (
                      <tr key={i} className="border-b border-white/5 align-top">
                        <td className="px-2 py-2">
                          <div className="font-mono">{item.sku || ln.sku || ln.itemId}</div>
                          <div className="opacity-65">{item.name || ln.description}</div>
                        </td>
                        <td className="px-2 py-2 text-right">{planned}</td>
                        <td className="px-2 py-2 text-right">{issued}</td>
                        <td className="px-2 py-2 text-right">
                          {can("edit")
                            ? <Num value={consumed} onChange={(v) => setConsumedEdit((p) => ({ ...p, [ln.itemId]: Number(v || 0) }))} />
                            : consumed}
                        </td>
                        <td className="px-2 py-2 text-right">{returned}</td>
                        <td className="px-2 py-2 text-right">
                          {can("edit")
                            ? <Num value={scrap} onChange={(v) => setScrapEdit((p) => ({ ...p, [ln.itemId]: Number(v || 0) }))} />
                            : scrap}
                        </td>
                        <td className={"px-2 py-2 text-right " + (Math.abs(variance) > 0.001 ? "text-amber-400" : "")}>{variance}</td>
                        <td className="px-2 py-2">
                          {ln.alternateItemId ? (
                            <div className="space-y-1">
                              <div className="opacity-70">Alt: {(store.get("items", ln.alternateItemId) || {}).sku || ln.alternateItemId}</div>
                              {ln.alternateApproved
                                ? <Pill color="#22c55e">Approved</Pill>
                                : (can("approve") ? <Button variant="soft" className="!py-1" onClick={() => { store.approveAlternateForMrLine(mr.id, ln.itemId, { alternateItemId: ln.alternateItemId }, roleKey); setRefresh((x) => x + 1); }}>Approve alt</Button> : <Pill color="#f59e0b">Pending</Pill>)}
                            </div>
                          ) : <span className="opacity-50">—</span>}
                        </td>
                        <td className="px-2 py-2">
                          <div className="space-y-1">
                            <Select value={ln.shortageClass || ""} onChange={(v) => { store.classifyShortageForMrLine(mr.id, ln.itemId, { shortageClass: v }, roleKey); setRefresh((x) => x + 1); }}
                              options={[{ value: "", label: "Classify" }, { value: "Critical", label: "Critical shortage" }, { value: "Non-critical", label: "Non-critical shortage" }, { value: "Substitute available", label: "Substitute available" }]} />
                            <Select value={ln.vendorStatus || ""} onChange={(v) => { store.classifyShortageForMrLine(mr.id, ln.itemId, { vendorStatus: v }, roleKey); setRefresh((x) => x + 1); }}
                              options={[{ value: "", label: "Vendor status" }, { value: "Purchase pending", label: "Purchase pending" }, { value: "Vendor delivery pending", label: "Vendor delivery pending" }]} />
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          {can("edit") ? (
                            <div className="flex items-center gap-1">
                              <Num value={returnQtyEdit[ln.itemId] || 0} onChange={(v) => setReturnQtyEdit((p) => ({ ...p, [ln.itemId]: Number(v || 0) }))} />
                              <Button variant="soft" className="!py-1" onClick={() => createReturnLine(ln.itemId)}>Create</Button>
                            </div>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {can("edit") && <div className="flex justify-end"><Button icon="check" onClick={saveConsumption}>Save variance baseline</Button></div>}
          </>
        )}
      </div>
    );
  }

  function BomPage(props) {
    return VG.BomListPage ? <VG.BomListPage {...props} mode="production" /> : null;
  }
  function MrpPage(props) {
    return VG.BomRequirementsPage ? <VG.BomRequirementsPage {...props} /> : null;
  }

  const SECTIONS = [
    { id: "dashboard", label: "Dashboard", icon: "chart", group: "Overview" },
    { id: "orders", label: "Work Orders", icon: "factory", group: "Shop Floor" },
    { id: "shop", label: "Shop Floor", icon: "grid", group: "Shop Floor" },
    { id: "bom", label: "BOM Register", icon: "flow", group: "Planning" },
    { id: "mrp", label: "Material Requirements", icon: "box", group: "Planning" },
    { id: "material-control", label: "WO Material Control", icon: "settings", group: "Planning" },
    { id: "reports", label: "Reports", icon: "chart", group: "Reports" },
  ];
  if (VG.registerModuleSections) VG.registerModuleSections("production", SECTIONS);
  const PAGES = { dashboard: Dashboard, orders: WorkOrdersPage, bom: BomPage, mrp: MrpPage, "material-control": MaterialControlPage, shop: ShopFloorPage, reports: ReportsPage };

  VG.modules = VG.modules || {};
  VG.modules.production = function ProductionModule({ mod, roleKey }) {
    const can = (a) => VG.can(roleKey, a);
    const [section, setSection] = useState(() => VG.consumeSection("production", "dashboard"));
    const Page = PAGES[section] || Dashboard;
    const actions = [
      { label: "Release work order", icon: "factory", primary: true, onClick: () => setSection("orders") },
      { label: "Issue materials", icon: "logout", onClick: () => setSection("mrp") },
      { label: "Material control", icon: "settings", onClick: () => setSection("material-control") },
      { label: "BOM register", icon: "flow", onClick: () => setSection("bom") },
      { label: "Shop floor", icon: "grid", onClick: () => setSection("shop") },
    ];
    return (
      <VG.ModuleScaffold mod={mod} sections={SECTIONS} section={section} setSection={setSection} actions={actions} roleKey={roleKey}>
        <Page roleKey={roleKey} can={can} go={setSection} mod={mod} />
      </VG.ModuleScaffold>
    );
  };
})(window.VG);

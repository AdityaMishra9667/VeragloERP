/* Veraglo ERP — Document Template Designer (admin module). */
(function (VG) {
  const { useState, useEffect, useMemo, useRef } = React;
  const store = VG.store;
  if (!VG.fx) throw new Error("doc-template-designer.jsx must load after forms.jsx (VG.fx is not defined yet)");
  const ui = VG.ui;
  const fx = VG.fx;
  const { Icon, Button, Pill, Card } = ui;
  const { Field, Text, Num, Select, Area, Modal, RecordTable, PageHead, StatusTag, Checkbox } = fx;

  const FONT_OPTIONS = (VG.FONT_PRESETS ? Object.values(VG.FONT_PRESETS).map((p) => ({ value: p.pdf, label: p.label })) : [
    { value: "Inter, 'Segoe UI', Arial, sans-serif", label: "Inter (recommended)" },
    { value: "'Segoe UI', system-ui, Arial, sans-serif", label: "Segoe UI" },
    { value: "Roboto, Arial, sans-serif", label: "Roboto" },
    { value: "Georgia, 'Times New Roman', serif", label: "Georgia (classic)" },
  ]).concat([{ value: "", label: "Use global PDF font (Admin → UI Settings)" }]);

  VG.DOC_TEMPLATE_VARIANTS = [
    { id: "premium_offer", name: "Premium Commercial Offer", docType: "Quotation", patch: { name: "Premium Commercial Offer", themeId: "industrial", docVariant: "quotation-international", docTitleOverride: "Commercial Offer", showLogoOnly: true, showDocSubtitle: false, showCompanyTagline: false, logoSize: 72, marginMm: 9, accentColor: "#c8102e", showColoredTableHeader: false, showQr: true, warrantyDefault: "Warranty: 12 months from the date of invoice.", roundOffEnabled: true, roundOffMode: "auto", titleLetterSpacing: "0.02em" } },
    { id: "compact_qtn", name: "Compact Quotation", docType: "Quotation", patch: { name: "Compact Quotation", themeId: "industrial", fontSize: 9, logoSize: 48, marginMm: 8, docTitleOverride: "Commercial Offer" } },
    { id: "export_qtn", name: "Export Quotation", docType: "Quotation", patch: { name: "Export Quotation", themeId: "industrial", showAmountInWords: true, showQr: true } },
    { id: "gov_tender", name: "Government Tender Quotation", docType: "Quotation", patch: { name: "Government Tender Quotation", themeId: "classic", tableStyle: "bordered", showSignatures: true, showStamp: true } },
    { id: "simple_price", name: "Simple Price Offer", docType: "Quotation", patch: { name: "Simple Price Offer", themeId: "minimal", showSignatures: false, showBankBlock: false } },
  ];

  function initTemplate(record) {
    const layout = VG.defaultDocLayout ? VG.defaultDocLayout() : {};
    const fc = (record && record.fieldConfig) || (VG.DOC_CUSTOMER_FIELDS || []).reduce((o, f) => { o[f.key] = f.default !== false; return o; }, {});
    const tc = (record && record.tableColumns && record.tableColumns.length) ? record.tableColumns : (VG.DOC_TABLE_COLUMNS || []).map((c) => ({ ...c, visible: c.default !== false }));
    return {
      name: "", docType: "Quotation", active: true, isDefault: false, variant: "",
      fieldConfig: fc, tableColumns: tc, footerConfig: record && record.footerConfig || {}, signatureConfig: record && record.signatureConfig || {},
      ...layout, ...record,
    };
  }

  function DocumentFormatDesigner({ open, onClose, record, roleKey, can }) {
    const [isNewCopy, setIsNewCopy] = useState(false);
    const [tab, setTab] = useState("general");
    const [f, setF] = useState(() => initTemplate(record));
    const previewRef = useRef(null);
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
    const setField = (key, on) => setF((p) => ({ ...p, fieldConfig: { ...(p.fieldConfig || {}), [key]: on } }));
    const setCol = (key, patch) => setF((p) => ({
      ...p,
      tableColumns: (p.tableColumns || []).map((c) => (c.key === key ? { ...c, ...patch } : c)),
    }));

    useEffect(() => {
      if (open) {
        setTab("general");
        setIsNewCopy(false);
        setF(initTemplate(record));
      }
    }, [open, record && record.id]);

    const isEdit = !!(f.id && !isNewCopy);
    const types = VG.ADMIN_DOC_TYPES || [];
    const themes = VG.DOC_THEME_PRESETS || [];
    const canSave = can("edit") || can("settings");

    function applyTheme(presetId) {
      const patch = VG.applyDocThemePreset ? VG.applyDocThemePreset(presetId) : {};
      setF((p) => ({ ...p, ...patch, themeId: presetId }));
      VG.toast("Theme applied", "info");
    }

    function applyVariant(vid) {
      const v = (VG.DOC_TEMPLATE_VARIANTS || []).find((x) => x.id === vid);
      if (!v) return;
      setF((p) => ({ ...p, ...v.patch, variant: vid, docType: v.docType || p.docType }));
      VG.toast("Variant applied: " + v.name, "info");
    }

    function preview(mode) {
      if (VG.renderTemplatePreview) VG.renderTemplatePreview(f, f.docType, mode || "preview");
      else if (VG.printStyledDocument) {
        const inner = VG.sampleDocInner ? VG.sampleDocInner(f.docType, VG.mergeTemplateDraft ? VG.mergeTemplateDraft(f) : f) : "";
        VG.printStyledDocument({ title: f.docType, subtitle: f.name, inner, docType: f.docType, useIntlLayout: true }, mode);
      }
    }

    function refreshInlinePreview() {
      if (!previewRef.current || !VG.sampleDocInner) return;
      const tpl = VG.mergeTemplateDraft ? VG.mergeTemplateDraft(f) : f;
      const inner = VG.sampleDocInner(f.docType, tpl);
      const css = VG.templatePrintCSS ? VG.templatePrintCSS(tpl) : "";
      previewRef.current.innerHTML = `<style>${css}</style><div class="vg-page vg-quotation-intl">${inner}</div>`;
    }

    useEffect(() => {
      if (open && tab === "preview") refreshInlinePreview();
    }, [open, tab, f]);

    function save() {
      if (!canSave) return VG.toast("You do not have permission to edit templates", "error");
      if (!f.name || !f.docType) return VG.toast("Name and document type required", "error");
      const payload = {
        ...f,
        active: f.active !== false,
        isDefault: !!f.isDefault,
        showQr: !!f.showQr,
        showSignatures: f.showSignatures !== false,
        showStamp: f.showStamp !== false,
        showLogoOnly: f.showLogoOnly !== false,
        showCompanyTagline: !!f.showCompanyTagline,
        fieldConfig: f.fieldConfig || {},
        tableColumns: f.tableColumns || [],
      };
      let id = f.id;
      if (isEdit) {
        store.update("documentTemplates", f.id, payload, roleKey);
        if (VG.auditTemplateChange) VG.auditTemplateChange("update", payload, roleKey, "Template layout/fonts/colors updated");
      } else {
        const rec = store.create("documentTemplates", payload, roleKey);
        id = rec.id;
        if (VG.auditTemplateChange) VG.auditTemplateChange("create", { ...payload, id }, roleKey, "New document template created");
      }
      if (payload.isDefault && store.setDefaultDocumentTemplate) {
        store.setDefaultDocumentTemplate(id, roleKey);
        if (VG.auditTemplateChange) VG.auditTemplateChange("default", payload, roleKey, "Set as default for " + payload.docType);
      }
      VG.toast("Template saved");
      onClose();
    }

    function duplicate() {
      setIsNewCopy(true);
      setF({ ...f, id: undefined, name: (f.name || "Template") + " (copy)", isDefault: false });
      VG.toast("Save to create the duplicate", "info");
    }

    function onLogoFile(ev) {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => set("logoDataUrl", reader.result);
      reader.readAsDataURL(file);
    }

    const tabs = [
      { id: "general", label: "General" },
      { id: "logo", label: "Logo" },
      { id: "typography", label: "Text" },
      { id: "layout", label: "Layout & color" },
      { id: "fields", label: "Customer fields" },
      { id: "table", label: "Table" },
      { id: "footer", label: "Footer & sign" },
      { id: "preview", label: "Live preview" },
    ];

    return (
      <Modal open={open} onClose={onClose} size="xl" title={isEdit ? "Document Template Designer" : "New Document Template"}
        subtitle="Control logo, fonts, colors, fields, tables, footer, and signatures — no developer required"
        footer={<>
          {isEdit && canSave && <Button variant="soft" icon="plus" onClick={duplicate}>Duplicate</Button>}
          <Button variant="soft" icon="eye" onClick={() => preview("preview")}>PDF preview</Button>
          <Button variant="soft" onClick={onClose}>Close</Button>
          {canSave && <Button icon="check" onClick={save}>Save template</Button>}
        </>}>
        {!canSave && <div className="text-xs text-amber-400/90 mb-3">View only — admin edit/settings permission required to save.</div>}
        <div className="flex flex-wrap gap-1 mb-4 border-b border-white/10 pb-2">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={"px-3 py-1.5 rounded-lg text-xs font-medium transition " + (tab === t.id ? "bg-white/15 text-white" : "opacity-55 hover:opacity-90")}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "general" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Document type" required><Select value={f.docType} onChange={(v) => set("docType", v)} options={types.map((t) => ({ value: t, label: t }))} /></Field>
              <Field label="Template name" required><Text value={f.name} onChange={(v) => set("name", v)} placeholder="e.g. Premium Commercial Offer" /></Field>
              <Field label="Variant preset"><Select value={f.variant || ""} onChange={applyVariant} options={[{ value: "", label: "— None —" }].concat((VG.DOC_TEMPLATE_VARIANTS || []).filter((v) => !v.docType || v.docType === f.docType).map((v) => ({ value: v.id, label: v.name })))} /></Field>
              <Field label="Page size"><Select value={f.pageSize} onChange={(v) => set("pageSize", v)} options={["A4", "A5", "Letter"].map((x) => ({ value: x, label: x }))} /></Field>
              <Field label="Assign module (optional)"><Text value={f.assignModule || ""} onChange={(v) => set("assignModule", v)} placeholder="sales, accounts…" /></Field>
              <Field label="Customer category (optional)"><Text value={f.assignCustomerCategory || ""} onChange={(v) => set("assignCustomerCategory", v)} /></Field>
            </div>
            <div className="flex flex-wrap gap-4">
              <Checkbox checked={!!f.isDefault} onChange={(v) => set("isDefault", v)} label="Default for this document type" />
              <Checkbox checked={f.active !== false} onChange={(v) => set("active", v)} label="Active" />
            </div>
            <div>
              <div className="text-xs opacity-55 mb-2">Quick theme</div>
              <div className="flex flex-wrap gap-2">
                {themes.map((th) => (
                  <button key={th.id} type="button" onClick={() => applyTheme(th.id)}
                    className={"px-2.5 py-1.5 rounded-lg text-xs border " + (f.themeId === th.id ? "border-[var(--accent)]" : "border-white/15 chrome-hover")}>
                    {th.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "logo" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Logo height (px)"><Num value={f.logoSize} onChange={(v) => set("logoSize", v)} /></Field>
            <Field label="Logo placement"><Select value={f.logoPlacement} onChange={(v) => set("logoPlacement", v)} options={["left", "center", "right"].map((x) => ({ value: x, label: x }))} /></Field>
            <Field label="Logo margin (mm)"><Num value={f.logoMarginMm} onChange={(v) => set("logoMarginMm", v)} /></Field>
            <Field label="Template logo override" className="sm:col-span-2 lg:col-span-3">
              <input type="file" accept="image/*" className="text-xs" onChange={onLogoFile} />
              <div className="text-[11px] opacity-50 mt-1">Leave empty to use company profile logo. High-resolution PNG/SVG recommended.</div>
            </Field>
            <Checkbox checked={f.showLogo !== false} onChange={(v) => set("showLogo", v)} label="Show logo" />
            <Checkbox checked={f.showLogoOnly !== false} onChange={(v) => set("showLogoOnly", v)} label="Logo only in header (no company text)" />
            <Checkbox checked={!!f.showCompanyTagline} onChange={(v) => set("showCompanyTagline", v)} label="Show tagline beside logo (not recommended)" />
          </div>
        )}

        {tab === "typography" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Body font"><Select value={f.fontFamily} onChange={(v) => set("fontFamily", v)} options={FONT_OPTIONS} /></Field>
            <Field label="Body size (pt)"><Num value={f.fontSize} onChange={(v) => set("fontSize", v)} /></Field>
            <Field label="Line height"><Num value={f.lineHeight} onChange={(v) => set("lineHeight", v)} /></Field>
            <Field label="Body letter spacing"><Text value={f.letterSpacing || "0"} onChange={(v) => set("letterSpacing", v)} placeholder="0 or 0.02em" /></Field>
            <Field label="Text color"><Text value={f.textColor} onChange={(v) => set("textColor", v)} hint="#1a1a1a" /></Field>
            <Field label="Muted / label color"><Text value={f.mutedColor} onChange={(v) => set("mutedColor", v)} hint="#6b7280" /></Field>
            <Field label="Document title" hint="e.g. Commercial Offer"><Text value={f.docTitleOverride || ""} onChange={(v) => set("docTitleOverride", v)} /></Field>
            <Field label="Title font"><Select value={f.titleFontFamily} onChange={(v) => set("titleFontFamily", v)} options={FONT_OPTIONS} /></Field>
            <Field label="Title size (pt)"><Num value={f.titleFontSize} onChange={(v) => set("titleFontSize", v)} /></Field>
            <Field label="Title letter spacing"><Text value={f.titleLetterSpacing || "0.04em"} onChange={(v) => set("titleLetterSpacing", v)} hint="Compact: 0.03–0.05em" /></Field>
            <Field label="Title weight"><Num value={f.titleFontWeight || 700} onChange={(v) => set("titleFontWeight", v)} /></Field>
            <Field label="Title transform"><Select value={f.titleTransform} onChange={(v) => set("titleTransform", v)} options={["uppercase", "none", "capitalize"].map((x) => ({ value: x, label: x }))} /></Field>
            <Checkbox checked={!!f.showDocSubtitle} onChange={(v) => set("showDocSubtitle", v)} label="Show subtitle under title" />
          </div>
        )}

        {tab === "layout" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Page margins (mm)"><Num value={f.marginMm} onChange={(v) => set("marginMm", v)} /></Field>
            <Field label="Accent color (minimal use)"><Text value={f.accentColor} onChange={(v) => set("accentColor", v)} /></Field>
            <Field label="Separator color"><Text value={f.separatorColor} onChange={(v) => set("separatorColor", v)} /></Field>
            <Field label="Table header background"><Text value={f.tableHeaderBg} onChange={(v) => set("tableHeaderBg", v)} /></Field>
            <Field label="Table style"><Select value={f.tableStyle} onChange={(v) => set("tableStyle", v)} options={[{ value: "professional", label: "Professional" }, { value: "minimal", label: "Minimal" }, { value: "zebra", label: "Zebra" }, { value: "bordered", label: "Bordered" }]} /></Field>
            <Field label="Watermark"><Text value={f.watermark} onChange={(v) => set("watermark", v)} /></Field>
            <Checkbox checked={f.showColoredTableHeader !== true} onChange={(v) => set("showColoredTableHeader", !v)} label="Neutral table header (recommended)" />
            <Checkbox checked={f.lineItemStriped !== false} onChange={(v) => set("lineItemStriped", v)} label="Alternating row shading" />
            <Checkbox checked={f.showAmountInWords !== false} onChange={(v) => set("showAmountInWords", v)} label="Amount in words" />
          </div>
        )}

        {tab === "fields" && (
          <div>
            <p className="text-xs opacity-55 mb-3">Quotation documents hide billing/shipping by policy. Toggle customer block fields below.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {(VG.DOC_CUSTOMER_FIELDS || []).map((fld) => (
                <Checkbox key={fld.key} checked={f.fieldConfig && f.fieldConfig[fld.key] !== false} onChange={(v) => setField(fld.key, v)} label={fld.label} />
              ))}
            </div>
          </div>
        )}

        {tab === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left opacity-55 border-b border-white/10">
                <th className="py-2 pr-2">Column</th><th className="py-2">Label</th><th className="py-2">Width</th><th className="py-2">Align</th><th className="py-2">Show</th>
              </tr></thead>
              <tbody>
                {(f.tableColumns || []).map((c) => (
                  <tr key={c.key} className="border-b border-white/5">
                    <td className="py-2 font-mono opacity-70">{c.key}</td>
                    <td className="py-2"><Text value={c.label} onChange={(v) => setCol(c.key, { label: v })} /></td>
                    <td className="py-2 w-24"><Text value={c.width || ""} onChange={(v) => setCol(c.key, { width: v })} /></td>
                    <td className="py-2 w-28">
                      <Select value={c.align || "left"} onChange={(v) => setCol(c.key, { align: v })} options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
                    </td>
                    <td className="py-2"><Checkbox checked={c.visible !== false} onChange={(v) => setCol(c.key, { visible: v })} label="" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "footer" && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Footer override"><Area rows={2} value={f.footerOverride} onChange={(v) => set("footerOverride", v)} /></Field>
            <Field label="Terms override" hint="Replaces default T&C when set"><Area rows={3} value={f.termsOverride} onChange={(v) => set("termsOverride", v)} /></Field>
            <Field label="Default warranty text" hint="Used when quotation has no warranty"><Text value={f.warrantyDefault || ""} onChange={(v) => set("warrantyDefault", v)} placeholder="Warranty: 12 months from the date of invoice." /></Field>
            <Field label="Round-off mode"><Select value={f.roundOffMode || "auto"} onChange={(v) => set("roundOffMode", v)} options={[{ value: "auto", label: "Automatic" }, { value: "manual", label: "Manual only" }]} /></Field>
            <div className="sm:col-span-2 flex flex-wrap gap-4">
              <Checkbox checked={f.roundOffEnabled !== false} onChange={(v) => set("roundOffEnabled", v)} label="Enable round-off on PDF totals" />
              <Checkbox checked={!!f.showQr} onChange={(v) => set("showQr", v)} label="QR verification block" />
              <Checkbox checked={f.showSignatures !== false} onChange={(v) => set("showSignatures", v)} label="Signature row" />
              <Checkbox checked={f.showStamp !== false} onChange={(v) => set("showStamp", v)} label="Company stamp" />
              <Checkbox checked={f.showBankBlock !== false} onChange={(v) => set("showBankBlock", v)} label="Bank details in footer" />
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="soft" icon="refresh" onClick={refreshInlinePreview}>Refresh preview</Button>
              <Button icon="eye" onClick={() => preview("preview")}>Open A4 print preview</Button>
              <Button variant="soft" icon="printer" onClick={() => preview("print")}>Print / Save PDF</Button>
            </div>
            <Card className="p-0 overflow-hidden bg-white text-black" style={{ minHeight: 420 }}>
              <div ref={previewRef} className="transform origin-top-left scale-[0.72] w-[138%] p-2" style={{ minHeight: 560 }} />
            </Card>
            <p className="text-[11px] opacity-50">Inline preview uses sample quotation data. Full window preview matches print/PDF output.</p>
          </div>
        )}
      </Modal>
    );
  }

  function DocumentTemplatesPage({ roleKey, can }) {
    VG.useDB();
    const [edit, setEdit] = useState(null);
    const rows = store.list("documentTemplates");
    const audit = useMemo(() => (store.list("auditLog") || []).filter((a) => a.entity === "documentTemplates").slice(-8).reverse(), [rows.length]);
    const byType = useMemo(() => {
      const m = {};
      rows.forEach((r) => { m[r.docType] = (m[r.docType] || 0) + 1; });
      return m;
    }, [rows.length]);
    const cols = [
      { key: "docType", label: "Document", render: (r) => <Pill color={r.accentColor || "#1a1a1a"}>{r.docType}</Pill> },
      { key: "name", label: "Template" },
      { key: "variant", label: "Variant", render: (r) => r.variant || "—" },
      { key: "themeId", label: "Theme", render: (r) => <span className="text-xs opacity-70">{(VG.DOC_THEME_PRESETS || []).find((x) => x.id === r.themeId)?.name || r.themeId || "—"}</span> },
      { key: "isDefault", label: "Default", render: (r) => r.isDefault ? <Pill color="#34d399">Default</Pill> : "—" },
      { key: "active", label: "Status", render: (r) => <StatusTag value={r.active !== false ? "Active" : "Inactive"} map={{ Active: "#34d399", Inactive: "#94a3b8" }} /> },
    ];
    if (can("edit") || can("settings")) {
      cols.push({
        key: "_act",
        label: "",
        render: (r) => (
          <div className="flex flex-wrap gap-1 justify-end">
            {!r.isDefault && (
              <button type="button" className="text-[11px] px-2 py-1 rounded-lg chrome-hover" onClick={() => {
                store.setDefaultDocumentTemplate(r.id, roleKey);
                if (VG.auditTemplateChange) VG.auditTemplateChange("default", r, roleKey, "Default template changed");
                VG.toast("Set as default");
              }}>Default</button>
            )}
            <button type="button" className="p-1 rounded chrome-hover" title="Preview" onClick={() => {
              if (VG.renderTemplatePreview) VG.renderTemplatePreview(r, r.docType, "preview");
            }}><Icon name="eye" size={15} /></button>
          </div>
        ),
      });
    }
    const canManage = can("add") && (can("edit") || can("settings"));
    if (edit) {
      return <DocumentFormatDesigner open onClose={() => setEdit(null)} record={edit.id ? edit : null} roleKey={roleKey} can={can} />;
    }
    return (
      <div>
        <PageHead title="Document Template Designer" desc="Design quotation, invoice, challan, and HR print layouts — logo, fonts, fields, tables, footer" />
        <div className="flex flex-wrap gap-2 mb-4">
          {(VG.ADMIN_DOC_TYPES || []).map((dt) => (
            <Pill key={dt} color="#64748b">{dt}: {byType[dt] || 0}</Pill>
          ))}
        </div>
        <RecordTable title="Templates" columns={cols} rows={rows} can={can} printTitle="Document Templates" searchKeys={["name", "docType", "variant"]}
          onNew={canManage ? () => setEdit({}) : null} newLabel="New template"
          onEdit={(can("edit") || can("settings")) ? (r) => setEdit(r) : null}
          onDelete={can("delete") ? async (r) => {
            if (await VG.confirm({ title: "Deactivate template?", message: "Prefer deactivating over delete for audit trail.", danger: true, confirmLabel: "Deactivate" })) {
              store.update("documentTemplates", r.id, { active: false }, roleKey);
              if (VG.auditTemplateChange) VG.auditTemplateChange("deactivate", r, roleKey, "Template deactivated");
              VG.toast("Template deactivated");
            }
          } : null}
          empty="No templates — create Premium Commercial Offer or other variants" />
        {audit.length > 0 && (
          <Card className="p-4 mt-4">
            <div className="text-sm font-semibold mb-2">Recent template audit</div>
            <ul className="space-y-1 text-xs opacity-75">
              {audit.map((a) => (
                <li key={a.id}>{new Date(a.ts).toLocaleString()} · {a.actor} · {a.action} · {a.refId} — {a.summary}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  }

  VG.DocumentFormatDesigner = DocumentFormatDesigner;
  VG.DocumentTemplatesPage = DocumentTemplatesPage;
})(window.VG);

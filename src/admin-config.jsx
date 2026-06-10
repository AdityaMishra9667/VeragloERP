/* Veraglo ERP — Admin panel constants (permission matrix, modules, document types). */
(function (VG) {
  VG.ADMIN_PERM_COLS = [
    { key: "view", label: "View" },
    { key: "add", label: "Add" },
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
    { key: "approve", label: "Approve" },
    { key: "reject", label: "Reject" },
    { key: "print", label: "Print" },
    { key: "export", label: "Export / Download" },
    { key: "import", label: "Import" },
    { key: "email", label: "Email" },
    { key: "settings", label: "Settings" },
  ];

  VG.ADMIN_MODULES = [
    { id: "sales", label: "Sales & CRM", group: "Sales" },
    { id: "enquiry", label: "Enquiry", group: "Sales" },
    { id: "quotation", label: "Quotation", group: "Sales" },
    { id: "proforma", label: "Proforma Invoice", group: "Sales" },
    { id: "salesOrder", label: "Sales Order", group: "Sales" },
    { id: "customer", label: "Customer Master", group: "Sales" },
    { id: "purchase", label: "Purchase", group: "Procurement" },
    { id: "purchaseRequest", label: "Purchase Request", group: "Procurement" },
    { id: "purchaseOrder", label: "Purchase Order", group: "Procurement" },
    { id: "supplier", label: "Supplier Master", group: "Procurement" },
    { id: "inventory", label: "Inventory", group: "Inventory" },
    { id: "item", label: "Item Master", group: "Inventory" },
    { id: "materialReceipt", label: "Material Receipt", group: "Inventory" },
    { id: "materialIssue", label: "Material Issue", group: "Inventory" },
    { id: "returnableChallan", label: "Returnable Challan", group: "Inventory" },
    { id: "nonReturnableChallan", label: "Non-Returnable Challan", group: "Inventory" },
    { id: "stockTransfer", label: "Stock Transfer", group: "Inventory" },
    { id: "production", label: "Production", group: "Manufacturing" },
    { id: "workOrder", label: "Work Order", group: "Manufacturing" },
    { id: "bom", label: "BOM", group: "Manufacturing" },
    { id: "quality", label: "Quality Control", group: "Manufacturing" },
    { id: "qcInspection", label: "QC Inspection", group: "Manufacturing" },
    { id: "dispatch", label: "Dispatch", group: "Operations" },
    { id: "deliveryChallan", label: "Delivery Challan", group: "Operations" },
    { id: "invoice", label: "Tax Invoice", group: "Finance" },
    { id: "accounts", label: "Accounts", group: "Finance" },
    { id: "payments", label: "Payments", group: "Finance" },
    { id: "hr", label: "HR & Payroll", group: "People" },
    { id: "employee", label: "Employee Master", group: "People" },
    { id: "attendance", label: "Attendance", group: "People" },
    { id: "leave", label: "Leave", group: "People" },
    { id: "salarySlip", label: "Salary Slip", group: "People" },
    { id: "reports", label: "Reports", group: "System" },
    { id: "admin", label: "Admin Control Panel", group: "System" },
    { id: "masterData", label: "Master Data", group: "System" },
    { id: "templates", label: "Document Templates", group: "System" },
    { id: "backup", label: "Backup & Restore", group: "System" },
  ];

  VG.DOCUMENT_TEMPLATE_DOC_TYPES = [
    { label: "Quotation", docType: "Quotation" },
    { label: "Proforma Invoice", docType: "Proforma Invoice" },
    { label: "Tax Invoice", docType: "Tax Invoice" },
    { label: "Export Invoice", docType: "Export Invoice" },
    { label: "Sales Order", docType: "Sales Order" },
    { label: "Purchase Order", docType: "Purchase Order" },
    { label: "Delivery Challan", docType: "Delivery Challan" },
    { label: "Material Receipt", docType: "Material Receipt Note" },
    { label: "Material Issue", docType: "Material Issue Slip" },
    { label: "Returnable Challan", docType: "Returnable Challan" },
    { label: "Non-Returnable Challan", docType: "Non-Returnable Challan" },
    { label: "QC Report", docType: "QC Report" },
    { label: "Salary Slip", docType: "Salary Slip" },
  ];

  VG.ADMIN_DOC_TYPES = [
    "Quotation", "Proforma Invoice", "Tax Invoice", "Purchase Order", "Sales Order",
    "Material Receipt Note", "Material Issue Slip", "Returnable Challan", "Non-Returnable Challan",
    "Delivery Challan", "QC Report", "Salary Slip", "Offer Letter", "Appointment Letter",
    "Gate Pass", "Stock Report", "Ledger Statement",
  ];

  VG.ADMIN_APPROVAL_TYPES = [
    "Quotation discount", "Sales order", "Purchase request", "Purchase order", "Material issue",
    "Stock adjustment", "Returnable challan", "Non-returnable challan", "QC rejection",
    "Salary processing", "Leave", "Expense", "Vendor payment",
  ];

  VG.ADMIN_MASTER_LINKS = [
    { label: "Customers", module: "sales", section: "customers", collection: "customers" },
    { label: "Suppliers", module: "inventory", section: "suppliers", collection: "suppliers" },
    { label: "Items", module: "inventory", section: "items", collection: "items" },
    { label: "Categories", module: "inventory", section: "categories", collection: "categories" },
    { label: "Locations", module: "admin", section: "locations", collection: "locations" },
    { label: "Units", module: "inventory", section: "units", collection: "units" },
    { label: "Taxes", module: "inventory", section: "taxes", collection: "taxes" },
    { label: "Payment terms", module: "sales", section: "paymentTerms", collection: "paymentTerms" },
    { label: "Delivery terms", module: "sales", section: "deliveryTerms", collection: "deliveryTerms" },
    { label: "Currencies", module: "sales", section: "currencies", collection: "currencies" },
    { label: "Employees", module: "hr", section: "employees", collection: "employees" },
  ];
})(window.VG);

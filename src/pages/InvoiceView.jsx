import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInvoiceById } from "../hooks/useInvoiceById";
import { useSettings } from "../hooks/useSettings";

const STATUS_CONFIG = {
  Paid:    { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-500" },
  Unpaid:  { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200",    dot: "bg-rose-500"    },
  Partial: { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200",   dot: "bg-amber-500"   },
};

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const { data: invoice, isLoading, error } = useInvoiceById(id);
  const { data: settings } = useSettings();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>${invoice?.invoiceNumber || "Invoice"}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
            @page { 
              margin: 12mm; 
              size: A4; 
              orphans: 3;
              widows: 3;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .break-avoid { page-break-inside: avoid; }
              table { page-break-inside: avoid; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
            }
          </style>
        </head>
        <body>${content}</body>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </html>
    `);
    win.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading invoice…</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/invoices")} className="text-sm text-blue-600 hover:text-blue-700">← Back</button>
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm">
          {error ? `Error: ${error.message}` : "Invoice not found"}
        </div>
      </div>
    );
  }

  const cfg      = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.Unpaid;
  const currency = settings?.currency || "AED";
  const fmt      = (n) => `${currency} ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="font-[inter] space-y-4 animate-fadeIn">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/invoices")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-normal rounded-xl hover:bg-slate-50 transition-all duration-150 active:scale-95 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-normal rounded-xl transition-all duration-150 active:scale-95 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Invoice
        </button>
      </div>

      {/* ── Invoice Document ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.08)] overflow-hidden">
        <div ref={printRef} className="p-10 break-avoid print:p-0">

          {/* ══ HEADER ══ */}
          <div className="flex items-start justify-between pb-8 border-b-2 border-slate-100 break-avoid">

            {/* Left — logo + company */}
            <div className="space-y-2">
              {settings?.logoUrl && (
                <img src={settings.logoUrl} alt="Logo" className="h-14 w-auto object-contain mb-2" />
              )}
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {settings?.companyName || "Your Company"}
              </h2>
              {settings?.address && (
                <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] whitespace-pre-line">{settings.address}</p>
              )}
              {settings?.phone && <p className="text-sm text-slate-500">{settings.phone}</p>}
              {settings?.email && <p className="text-sm text-slate-500">{settings.email}</p>}
              {settings?.taxNumber && (
                <p className="text-xs text-slate-400 mt-1">TRN: {settings.taxNumber}</p>
              )}
            </div>

            {/* Right — INVOICE title + meta */}
            <div className="text-right space-y-3">
              <div>
                <h1 className="text-5xl font-bold text-blue-600 tracking-tight leading-none">INVOICE</h1>
                <p className="text-base font-semibold text-slate-600 mt-1">{invoice.invoiceNumber}</p>
              </div>

              {/* Status */}
              <div className="flex justify-end">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {invoice.status}
                </span>
              </div>

              {/* Date table */}
              <table className="ml-auto text-sm border-collapse">
                <tbody>
                  <tr className="border border-slate-200">
                    <td className="px-3 py-1.5 text-slate-500 bg-slate-50 border-r border-slate-200 font-medium text-xs uppercase tracking-wide whitespace-nowrap">Issue Date</td>
                    <td className="px-3 py-1.5 text-slate-700 font-medium">{invoice.issueDate}</td>
                  </tr>
                  <tr className="border border-slate-200">
                    <td className="px-3 py-1.5 text-slate-500 bg-slate-50 border-r border-slate-200 font-medium text-xs uppercase tracking-wide whitespace-nowrap">Due Date</td>
                    <td className="px-3 py-1.5 text-slate-700 font-medium">{invoice.dueDate}</td>
                  </tr>
                  {invoice.billingMethod && (
                    <tr className="border border-slate-200">
                      <td className="px-3 py-1.5 text-slate-500 bg-slate-50 border-r border-slate-200 font-medium text-xs uppercase tracking-wide whitespace-nowrap">Payment</td>
                      <td className="px-3 py-1.5 text-slate-700 font-medium">{invoice.billingMethod}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ══ FROM / BILL TO ══ */}
          <div className="grid grid-cols-2 gap-0 my-8 border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-5 border-r border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">From</p>
              <p className="text-sm font-semibold text-slate-800">{settings?.companyName || "Your Company"}</p>
              {settings?.address && (
                <p className="text-sm text-slate-500 mt-1 leading-relaxed whitespace-pre-line">{settings.address}</p>
              )}
              {settings?.email && <p className="text-sm text-slate-500 mt-0.5">{settings.email}</p>}
              {settings?.phone && <p className="text-sm text-slate-500">{settings.phone}</p>}
            </div>
            <div className="p-5 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</p>
              <p className="text-sm font-semibold text-slate-800">{invoice.client?.name}</p>
              {invoice.client?.company && <p className="text-sm text-slate-500">{invoice.client.company}</p>}
              {invoice.client?.address && (
                <p className="text-sm text-slate-500 mt-1 leading-relaxed whitespace-pre-line">{invoice.client.address}</p>
              )}
              {invoice.client?.email && <p className="text-sm text-slate-500 mt-0.5">{invoice.client.email}</p>}
              {invoice.client?.phone && <p className="text-sm text-slate-500">{invoice.client.phone}</p>}
            </div>
          </div>

          {/* ══ ITEMS TABLE ══ */}
          <table className="w-full border-collapse mb-8 break-avoid print:break-inside-auto">
            <thead>
              <tr className="bg-blue-600 print:bg-blue-600">
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-1/2">Items Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, i) => (
                <tr key={i} className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/40" : "bg-white"} print:break-inside-avoid`}>
                  <td className="px-4 py-3.5 border-l border-r border-slate-100">
                    <p className="text-sm font-medium text-slate-800">{item.description}</p>
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm text-slate-600 border-r border-slate-100">{fmt(item.rate)}</td>
                  <td className="px-4 py-3.5 text-center text-sm text-slate-600 border-r border-slate-100">{item.quantity}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-semibold text-slate-800 border-r border-slate-100">{fmt(item.quantity * item.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ NOTE + TOTALS ══ */}
          <div className="flex justify-between items-start gap-10 mb-10 break-avoid print:break-inside-avoid">

            {/* Note */}
            <div className="flex-1 max-w-xs">
              {invoice.notes && (
                <>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Note</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{invoice.notes}</p>
                </>
              )}
            </div>

            {/* Totals */}
            <div className="w-72">
              <table className="w-full border-collapse break-avoid print:break-inside-avoid">
                <tbody>
                  <tr className="border border-slate-200">
                    <td className="px-4 py-2.5 text-sm text-slate-500 bg-slate-50 border-r border-slate-200">Subtotal</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-700 text-right">{fmt(invoice.subtotal)}</td>
                  </tr>
                  {invoice.tax > 0 && (
                    <tr className="border border-slate-200">
                      <td className="px-4 py-2.5 text-sm text-slate-500 bg-slate-50 border-r border-slate-200">
                        Tax {invoice.taxRate ? `(${invoice.taxRate}%)` : ""}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-700 text-right">{fmt(invoice.tax)}</td>
                    </tr>
                  )}
                  {invoice.discount > 0 && (
                    <tr className="border border-slate-200">
                      <td className="px-4 py-2.5 text-sm text-slate-500 bg-slate-50 border-r border-slate-200">Discount</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-rose-500 text-right">− {fmt(invoice.discount)}</td>
                    </tr>
                  )}
                  {invoice.status === "Partial" && (
                    <>
                      <tr className="border border-slate-200">
                        <td className="px-4 py-2.5 text-sm text-slate-500 bg-slate-50 border-r border-slate-200">Amount Paid</td>
                        <td className="px-4 py-2.5 text-sm font-medium text-emerald-600 text-right">{fmt(invoice.paidAmount)}</td>
                      </tr>
                      <tr className="border border-slate-200">
                        <td className="px-4 py-2.5 text-sm text-slate-500 bg-slate-50 border-r border-slate-200">Remaining</td>
                        <td className="px-4 py-2.5 text-sm font-medium text-rose-500 text-right">{fmt(invoice.dueAmount)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {/* Total due */}
              <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-3.5 mt-0 border border-blue-600 break-avoid print:break-inside-avoid">
                <span className="text-sm font-bold uppercase tracking-widest">Total Due</span>
                <span className="text-base font-bold">{fmt(invoice.dueAmount ?? invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* ══ THANK YOU ══ */}
          <div className="border-t-2 border-slate-100 pt-5 mb-6 break-avoid print:break-inside-avoid">
            <p className="text-sm font-semibold text-blue-600">Thank you for your business</p>
          </div>

          {/* ══ FOOTER ══ */}
          <div className="grid grid-cols-3 border border-slate-200 rounded-lg overflow-hidden text-xs break-avoid print:break-inside-avoid">
            <div className="p-4 border-r border-slate-200">
              <p className="font-bold text-slate-700 mb-2">Questions?</p>
              {settings?.email && (
                <p className="text-slate-500 mt-0.5">
                  <span className="text-slate-400">Email  · </span>{settings.email}
                </p>
              )}
              {settings?.phone && (
                <p className="text-slate-500 mt-0.5">
                  <span className="text-slate-400">Call    · </span>{settings.phone}
                </p>
              )}
            </div>

            <div className="p-4 border-r border-slate-200 bg-slate-50/50">
              <p className="font-bold text-slate-700 mb-2">Payment Info</p>
              {invoice.billingMethod && (
                <p className="text-slate-500 mt-0.5">
                  <span className="text-slate-400">Method · </span>{invoice.billingMethod}
                </p>
              )}
              {settings?.taxNumber && (
                <p className="text-slate-500 mt-0.5">
                  <span className="text-slate-400">TRN    · </span>{settings.taxNumber}
                </p>
              )}
            </div>

            <div className="p-4">
              <p className="font-bold text-slate-700 mb-2">Terms & Conditions</p>
              <p className="text-slate-500 leading-relaxed">
                {settings?.termsAndConditions || "Payment is due within the agreed period."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
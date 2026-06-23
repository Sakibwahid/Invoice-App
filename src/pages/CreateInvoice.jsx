import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createInvoice } from "../services/invoiceService";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [items, setItems] = useState([{ description: "", quantity: 1, rate: 0 }]);
  const [status, setStatus] = useState("Unpaid");
  const [paidAmount, setPaidAmount] = useState(0);
  const [billingMethod, setBillingMethod] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Calculations ──
  const subtotal = useMemo(() =>
    items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.rate || 0), 0),
  [items]);

  const taxAmount     = useMemo(() => subtotal * (Number(taxRate) / 100), [subtotal, taxRate]);
  const total         = useMemo(() => subtotal + taxAmount - Number(discountAmount), [subtotal, taxAmount, discountAmount]);
  const dueAmount     = useMemo(() => Math.max(0, total - Number(paidAmount)), [total, paidAmount]);

  // Auto-set status based on paid amount
  const derivedStatus = useMemo(() => {
    const paid = Number(paidAmount);
    if (paid <= 0)       return "Unpaid";
    if (paid >= total)   return "Paid";
    return "Partial";
  }, [paidAmount, total]);

  // Keep status in sync unless user manually overrides
  const [manualStatus, setManualStatus] = useState(false);
  const effectiveStatus = manualStatus ? status : derivedStatus;

  // ── Item handlers ──
  const addItem    = () => setItems([...items, { description: "", quantity: 1, rate: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const form = e.target;
      const invoiceData = {
        issueDate: form.issueDate.value,
        dueDate:   form.dueDate.value,
        status:    effectiveStatus,
        client: {
          name:    form.clientName.value,
          company: form.companyName.value,
          email:   form.email.value,
          phone:   form.phone.value,
          address: form.address.value,
        },
        items,
        subtotal,
        taxRate:    Number(taxRate),
        tax:        taxAmount,
        discount:   Number(discountAmount),
        total,
        paidAmount: Number(paidAmount),
        dueAmount,
        notes:  form.notes.value,
        billingMethod,
        month:  new Date().getMonth() + 1,
        year:   new Date().getFullYear(),
      };
      await createInvoice(invoiceData);
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      navigate("/invoices");
    } catch (err) {
      setError(err.message || "Failed to create invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-300 transition";
  const labelClass = "block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5";

  const STATUS_DOT = { Paid: "bg-emerald-400", Unpaid: "bg-rose-400", Partial: "bg-amber-400" };

  return (
    <div className="font-[inter] space-y-3 animate-fadeIn max-w-5xl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <p className="text-[11px] font-medium tracking-wider text-slate-500 uppercase mb-1">Finance</p>
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight">New Invoice</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the details to generate a new invoice.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/invoices")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-normal rounded-xl hover:bg-slate-50 transition-all duration-150 active:scale-95 shadow-sm self-start sm:self-auto"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* ── Invoice Info ── */}
        <div className="bg-white/90 border border-white/60 rounded-2xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <h2 className="text-sm font-medium text-slate-800 tracking-tight">Invoice Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Invoice Number</label>
              <input
                type="text"
                placeholder="Auto-generated"
                disabled
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className={labelClass}>Issue Date <span className="text-rose-400">*</span></label>
              <input name="issueDate" type="date" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Due Date <span className="text-rose-400">*</span></label>
              <input name="dueDate" type="date" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Billing Method</label>
              <select
                value={billingMethod}
                onChange={(e) => setBillingMethod(e.target.value)}
                className={inputClass}
              >
                <option value="">Select method</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Online Payment">Online Payment</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Client Info ── */}
        <div className="bg-white/90 border border-white/60 rounded-2xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <h2 className="text-sm font-medium text-slate-800 tracking-tight">Client Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Client Name <span className="text-rose-400">*</span></label>
              <input name="clientName" type="text" placeholder="John Smith" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Company Name</label>
              <input name="companyName" type="text" placeholder="Acme Corp" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" placeholder="john@acmecorp.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" type="text" placeholder="+971 50 000 0000" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <textarea name="address" rows={2} placeholder="Street, City, Country" className={`${inputClass} resize-none`} />
            </div>
          </div>
        </div>

        {/* ── Items ── */}
        <div className="bg-white/90 border border-white/60 rounded-2xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-medium text-slate-800 tracking-tight">Line Items</h2>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-normal rounded-xl transition-all duration-150 active:scale-95 shadow-sm"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add item
            </button>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-3 mb-2 px-1">
            <p className="col-span-5 text-xs font-medium text-slate-600">Description</p>
            <p className="col-span-2 text-xs font-medium text-slate-600 text-center">Qty</p>
            <p className="col-span-2 text-xs font-medium text-slate-600 text-right">Rate (AED)</p>
            <p className="col-span-2 text-xs font-medium text-slate-600 text-right">Amount</p>
            <p className="col-span-1" />
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50/60 border border-slate-100 rounded-2xl hover:border-slate-200 transition">
                <div className="col-span-12 md:col-span-5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="Item description"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(index, "rate", e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 text-right focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
                  />
                </div>
                <div className="col-span-3 md:col-span-2 text-right">
                  <p className="text-sm font-medium text-slate-800">
                    <span className="text-[10px] text-slate-500 mr-0.5">AED</span>
                    {(Number(item.quantity) * Number(item.rate)).toFixed(2)}
                  </p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-1.5 text-slate-300 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Totals + Payment ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Tax & Discount */}
          <div className="bg-white/90 border border-white/60 rounded-2xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-medium text-slate-800 tracking-tight">Adjustments</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Tax Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    min="0" max="100" step="0.1"
                    placeholder="0"
                    className={inputClass}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                </div>
                {taxRate > 0 && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    = <span className="text-slate-600">AED {taxAmount.toFixed(2)}</span> added
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Discount (AED)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">AED</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    min="0" step="0.01"
                    placeholder="0.00"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment + Summary */}
          <div className="bg-white/90 border border-white/60 rounded-2xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-medium text-slate-800 tracking-tight">Payment Summary</h2>
            </div>

            {/* Totals breakdown */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-600">Subtotal</span>
                <span className="text-sm text-slate-700">
                  <span className="text-[10px] text-slate-500 mr-0.5">AED</span>{subtotal.toFixed(2)}
                </span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-600">Tax ({taxRate}%)</span>
                  <span className="text-sm text-slate-700">
                    <span className="text-[10px] text-slate-500 mr-0.5">AED</span>{taxAmount.toFixed(2)}
                  </span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-600">Discount</span>
                  <span className="text-sm text-rose-500">
                    − <span className="text-[10px] mr-0.5">AED</span>{Number(discountAmount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-[11px] font-medium text-slate-700">Total</span>
                <span className="text-lg font-medium text-slate-900">
                  <span className="text-[10px] text-slate-500 mr-0.5">AED</span>{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Paid amount input */}
            <div className="mb-4">
              <label className={labelClass}>Amount Paid (AED)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">AED</span>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => { setPaidAmount(e.target.value); setManualStatus(false); }}
                  min="0"
                  step="0.01"
                  max={total}
                  placeholder="0.00"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Due amount + status — auto calculated */}
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-600">Amount Due</span>
                <span className={`text-sm font-medium ${dueAmount > 0 ? "text-rose-500" : "text-emerald-600"}`}>
                  <span className="text-[10px] mr-0.5 text-slate-400">AED</span>{dueAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-600">Status</span>
                <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md border
                  ${effectiveStatus === "Paid"    ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    effectiveStatus === "Partial" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-rose-50 text-rose-500 border-rose-100"}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[effectiveStatus]}`} />
                  {effectiveStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                Status is automatically set based on the paid amount.
              </p>
            </div>
          </div>
        </div>

        {/* ── Notes ── */}
        <div className="bg-white/90 border border-white/60 rounded-2xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <h2 className="text-sm font-medium text-slate-800 tracking-tight">Notes</h2>
          </div>
          <textarea
            name="notes"
            rows={3}
            placeholder="Add any additional notes, payment terms, or instructions for the client…"
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-sm font-normal rounded-xl hover:bg-slate-50 transition-all duration-150 active:scale-95 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-normal rounded-xl transition-all duration-150 active:scale-95 shadow-sm shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving…" : "Save Invoice"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateInvoice;
import { useState, useEffect } from "react";
import { useSettings, useSettingsRefetch } from "../hooks/useSettings";
import { saveSettings } from "../services/settingsService";

const Settings = () => {
  const { data: settings, isLoading } = useSettings();
  const refetchSettings = useSettingsRefetch();

  const [form, setForm] = useState({
    companyName:  "",
    email:        "",
    phone:        "",
    address:      "",
    logoUrl:      "",
    website:      "",
    taxNumber:    "",
    currency:            "AED",
    paymentTerms:        "30",
    invoiceNotes:        "",
    termsAndConditions:  "",
  });

  const [isSaving,    setIsSaving]    = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [errorMsg,    setErrorMsg]    = useState("");
  const [logoError,   setLogoError]   = useState(false);
  const [activeTab,   setActiveTab]   = useState("company");

  useEffect(() => {
    if (settings) {
      setForm({
        companyName:  settings.companyName  || "",
        email:        settings.email        || "",
        phone:        settings.phone        || "",
        address:      settings.address      || "",
        logoUrl:      settings.logoUrl      || "",
        website:      settings.website      || "",
        taxNumber:    settings.taxNumber    || "",
        currency:            settings.currency            || "AED",
        paymentTerms:        settings.paymentTerms        || "30",
        invoiceNotes:        settings.invoiceNotes        || "",
        termsAndConditions:  settings.termsAndConditions  || "",
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "logoUrl") setLogoError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await saveSettings(form);
      await refetchSettings();
      setSuccessMsg("Settings saved successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-300 transition";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1";

  const tabs = [
    { id: "company",  label: "Company"          },
    { id: "invoice",  label: "Invoice Defaults" },
    { id: "branding", label: "Branding"         },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-[inter] space-y-4 animate-fadeIn max-w-2xl">

      {/* ── Header ── */}
      <div>
        <p className="text-[11px] font-medium tracking-wider text-slate-500 uppercase mb-1">Configuration</p>
        <h1 className="text-2xl font-medium text-slate-900 tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your company profile, invoice defaults, and branding.</p>
      </div>

      {/* ── Alerts ── */}
      {successMsg && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl text-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMsg}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-100/70 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all duration-150
              ${activeTab === tab.id
                ? "bg-white text-slate-800 shadow-sm font-medium"
                : "text-slate-500 hover:text-slate-700 font-normal"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Company Tab ── */}
        {activeTab === "company" && (
          <div className="bg-white/90 border border-white/60 rounded-2xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-medium text-slate-800">Company Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={labelClass}>Company Name <span className="text-rose-400">*</span></label>
                <input name="companyName" type="text" value={form.companyName} onChange={handleChange} placeholder="Acme Corp" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="hello@acmecorp.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input name="phone" type="text" value={form.phone} onChange={handleChange} placeholder="+971 50 000 0000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input name="website" type="url" value={form.website} onChange={handleChange} placeholder="https://acmecorp.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tax / VAT Number</label>
                <input name="taxNumber" type="text" value={form.taxNumber} onChange={handleChange} placeholder="TRN-100000000000003" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} placeholder="Street, City, Country" rows={2} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>
        )}

        {/* ── Invoice Defaults Tab ── */}
        {activeTab === "invoice" && (
          <div className="bg-white/90 border border-white/60 rounded-2xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-medium text-slate-800">Invoice Defaults</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Default Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                  <option value="AED">AED — UAE Dirham</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="SAR">SAR — Saudi Riyal</option>
                  <option value="BDT">BDT — Bangladeshi Taka</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Default Payment Terms</label>
                <select name="paymentTerms" value={form.paymentTerms} onChange={handleChange} className={inputClass}>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="45">45 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Default Invoice Notes</label>
                <textarea
                  name="invoiceNotes"
                  value={form.invoiceNotes}
                  onChange={handleChange}
                  placeholder="e.g. Thank you for your business. Payment is due within the agreed terms."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
                <p className="text-xs text-slate-400 mt-1">This note will be pre-filled on every new invoice.</p>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Terms & Conditions</label>
                <textarea
                  name="termsAndConditions"
                  value={form.termsAndConditions}
                  onChange={handleChange}
                  placeholder="e.g. Payment must be made within the agreed period. Late payments may incur a penalty of 2% per month."
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
                <p className="text-xs text-slate-400 mt-1">Will appear at the bottom of every invoice.</p>
              </div>
            </div>

            {(form.paymentTerms || form.currency) && (
              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Preview</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                  <span>Currency: <span className="font-medium text-slate-900">{form.currency}</span></span>
                  <span>Payment due: <span className="font-medium text-slate-900">{form.paymentTerms} days</span></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Branding Tab ── */}
        {activeTab === "branding" && (
          <div className="bg-white/90 border border-white/60 rounded-2xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-medium text-slate-800">Company Logo</h2>
            </div>
            <div>
              <label className={labelClass}>Logo URL</label>
              <input type="url" name="logoUrl" value={form.logoUrl} onChange={handleChange} placeholder="https://example.com/your-logo.png" className={inputClass} />
              <p className="text-xs text-slate-400 mt-1.5">Paste a direct image link. Host on Imgur, Cloudinary, or any public image host.</p>
            </div>

            {form.logoUrl && !logoError && (
              <div className="flex items-center gap-4 p-4 bg-slate-50/80 border border-slate-100 rounded-xl">
                <div className="w-20 h-20 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center bg-white shrink-0">
                  <img src={form.logoUrl} alt="Logo preview" className="w-full h-full object-contain p-2" onError={() => setLogoError(true)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Logo preview</p>
                  <p className="text-xs text-slate-400 mt-0.5">This is how your logo will appear on invoices.</p>
                  <button type="button" onClick={() => { setForm(p => ({ ...p, logoUrl: "" })); setLogoError(false); }} className="text-xs text-rose-500 hover:text-rose-600 mt-2 transition">
                    Remove logo
                  </button>
                </div>
              </div>
            )}

            {form.logoUrl && logoError && (
              <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-xl">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Could not load image. Please check the URL.
              </div>
            )}

            {!form.logoUrl && (
              <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-sm text-slate-400">No logo set — paste a URL above</p>
              </div>
            )}
          </div>
        )}

        {/* ── Save ── */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-normal rounded-xl transition-all duration-150 active:scale-95 shadow-sm shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;
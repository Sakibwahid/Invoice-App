import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotations } from "../hooks/useQuotations";

const PAGE_SIZE = 20;

const STATUS_CONFIG = {
  Draft: {
    badge: "bg-slate-50 text-slate-600 border-slate-100",
    dot: "bg-slate-400",
  },
  Sent: {
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    dot: "bg-blue-500",
  },
  Accepted: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  Rejected: {
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    dot: "bg-rose-500",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;
  return (
    <span
      className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${cfg.badge}`}
    >
      {status}
    </span>
  );
};

const ShowQuotation = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: quotations = [], isLoading, error } = useQuotations();

  const handleFilterChange = (val) => {
    setStatusFilter(val);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setVisibleCount(PAGE_SIZE);
  };

  const filteredQuotations = useMemo(() => {
    return quotations
      .filter((qt) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          qt.quotationNumber?.toLowerCase().includes(q) ||
          qt.client?.name?.toLowerCase().includes(q) ||
          qt.client?.company?.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "All" || qt.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [quotations, searchTerm, statusFilter]);

  const visible = filteredQuotations.slice(0, visibleCount);
  const hasMore = visibleCount < filteredQuotations.length;
  const loadMore = () => setVisibleCount((c) => c + PAGE_SIZE);

  const counts = useMemo(() => {
    return {
      All: quotations.length,
      Accepted: quotations.filter((q) => q.status === "Accepted").length,
    };
  }, [quotations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-xs tracking-wider text-slate-500 font-medium uppercase">
            Loading Quotations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 md:p-8 font-[inter]">
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 rounded-xl text-[15px] font-normal">
          Failed to load quotations: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl font-[inter] mx-auto space-y-8 p-4 md:p-6 lg:p-8 animate-fadeIn text-slate-900 antialiased">
      {/* ── Header with Unified Brand Positioning ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
            Documents
          </p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Quotations
          </h1>
          <p className="text-slate-500 mt-1 text-base font-normal">
            {counts.All} total &nbsp;·&nbsp; {counts.Accepted} accepted
          </p>
        </div>

        <button
          onClick={() => navigate("/quotations/create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[15px] font-medium hover:bg-slate-800 transition shadow-sm shadow-slate-950/10 self-start sm:self-center"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          New Quotation
        </button>
      </div>

      {/* ── Control Center Navigation & Filters ── */}
      <div className="space-y-4 pt-2">
        {/* Navigation Tabs aligned with the clean Invoice design language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-start gap-6 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {["All", "Draft", "Sent", "Accepted", "Rejected"].map((s) => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => handleFilterChange(s)}
                  className={`pb-3 text-[15px] font-semibold tracking-wide transition-all relative ${
                    active
                      ? "text-slate-900 font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {s}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full animate-fadeIn" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Text Box Bar */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by number, client name, or company…"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-100/80 focus:bg-white border border-transparent focus:border-slate-300 rounded-xl text-[15px] text-slate-900 font-medium placeholder-slate-500 transition-all focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Metadata Subsections ── */}
      <div className="flex items-center justify-between text-[14px] text-slate-600 font-medium">
        <p>
          Showing {visible.length} of {filteredQuotations.length} items
        </p>
        {(searchTerm || statusFilter !== "All") && (
          <button
            onClick={() => {
              handleSearchChange("");
              handleFilterChange("All");
            }}
            className="text-blue-600 hover:text-blue-800 font-semibold transition"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ── Visual Frame Data Rendering Area ── */}
      {filteredQuotations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg py-20 text-center">
          <svg
            className="w-8 h-8 text-slate-400 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-[15px] text-slate-500 font-medium">
            No quotations found matching your current filters.
          </p>
        </div>
      ) : (
        <>
          {/* ── Clean Geometric Desktop Frame ── */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full table-fixed divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 w-3/12">Quotation Number</th>
                  <th className="px-6 py-4 w-4/12">Client</th>
                  <th className="px-6 py-4 w-2/12">Issue Date</th>
                  <th className="px-6 py-4 w-2/12 text-right">Amount</th>
                  <th className="px-6 py-4 w-1/12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {visible.map((qt) => (
                  <tr
                    key={qt.id}
                    onClick={() => navigate(`/quotations/${qt.id}`)}
                    className="group cursor-pointer hover:bg-slate-50/50 transition text-[15px]"
                  >
                    <td className="px-6 py-4.5 font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {qt.quotationNumber}
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="text-slate-900 font-semibold">
                        {qt.client?.name || "—"}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {qt.client?.company}
                      </p>
                    </td>
                    <td className="px-6 py-4.5 text-slate-600 font-medium">
                      {qt.date
                        ? new Date(qt.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-slate-900 font-bold">
                          <span className="text-xs text-slate-500 font-semibold mr-0.5">
                            AED
                          </span>
                          {qt.total?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <StatusBadge status={qt.status} />
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <svg
                        className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-transform group-hover:translate-x-0.5 ml-auto"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                  >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Clean Geometric Mobile Cards ── */}
          <div className="md:hidden space-y-3">
            {visible.map((qt) => {
              const cfg = STATUS_CONFIG[qt.status] || { bar: "bg-slate-300" };
              return (
                <div
                  key={qt.id}
                  onClick={() => navigate(`/quotations/${qt.id}`)}
                  className="group bg-white border border-slate-200 rounded-lg p-4 shadow-sm cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-1 h-9 rounded-full ${cfg.dot || "bg-slate-300"}`} />
                    <div>
                      <p className="text-[15px] font-bold text-slate-900">
                        {qt.quotationNumber}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {qt.client?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="text-[15px] font-bold text-slate-900">
                      <span className="text-xs text-slate-500 font-semibold mr-0.5">
                        AED
                      </span>
                      {qt.total?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <StatusBadge status={qt.status} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Load More Control Indicator ── */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                Load More · {filteredQuotations.length - visibleCount} remaining
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShowQuotation;
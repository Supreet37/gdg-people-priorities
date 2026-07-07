/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Landmark, Printer, RefreshCw, Loader2, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const MPReports = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportDate, setReportDate] = useState("");
  async function loadReportData() {
    setLoading(true);
    try {
      const data = await api.mp.getAllComplaints();
      setComplaints(data);
      setReportDate((/* @__PURE__ */ new Date()).toUTCString());
    } catch (e) {
      console.error("Error loading report data:", e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadReportData();
  }, []);
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPendingPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pendingComplaints = complaints.filter((c) => c.status === "PENDING");

      doc.setProperties({
        title: "Balasore Sadar Pending Grievances Register Summary",
        subject: "Pending Grievances Accountability Report",
        author: "Office of the Member of Parliament",
        creator: "People's Priorities Dashboard"
      });

      const navyColor = [27, 42, 74];     // #1B2A4A
      const marigoldColor = [217, 119, 6]; // #D97706
      const grayColor = [100, 116, 139];   // #64748B
      const stampRed = [190, 24, 74];      // Urgent / Stamp red

      let currentY = 20;

      // Top Tri-Color Accent Line representing constitutional structure
      doc.setFillColor(217, 119, 6); // Saffron
      doc.rect(15, currentY, 60, 1.5, "F");
      doc.setFillColor(27, 42, 74);  // Navy
      doc.rect(75, currentY, 60, 1.5, "F");
      doc.setFillColor(16, 185, 129); // Green / Moss
      doc.rect(135, currentY, 60, 1.5, "F");

      currentY += 8;

      // Official Letterhead
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text("OFFICE OF THE MEMBER OF PARLIAMENT", 105, currentY, { align: "center" });

      currentY += 5;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(marigoldColor[0], marigoldColor[1], marigoldColor[2]);
      doc.text("CONSTITUENCY OF BALASORE SADAR", 105, currentY, { align: "center" });

      currentY += 4;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(`Official Ledger Register  |  Generated UTC: ${new Date().toUTCString()}`, 105, currentY, { align: "center" });

      currentY += 5;
      doc.setDrawColor(27, 42, 74);
      doc.setLineWidth(0.5);
      doc.line(15, currentY, 195, currentY);

      currentY += 8;

      // Section title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text("CONSTITUENCY COMPLAINT REGISTER: PENDING GRIEVANCES", 15, currentY);

      currentY += 5;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(
        "This certificate registers all active, unresolved public petitions and infrastructure deficits submitted by Balasore Sadar citizens.",
        15,
        currentY
      );

      currentY += 8;

      // Metadata card
      doc.setFillColor(250, 248, 242); // Warm paper tint
      doc.rect(15, currentY, 180, 18, "F");
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.3);
      doc.rect(15, currentY, 180, 18, "D");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text("REPRESENTATIVE:", 20, currentY + 6);
      doc.setFont("Helvetica", "normal");
      doc.text("Shri Pratap Chandra Sarangi", 50, currentY + 6);

      doc.setFont("Helvetica", "bold");
      doc.text("PENDING Grievances:", 20, currentY + 12);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(stampRed[0], stampRed[1], stampRed[2]);
      doc.text(`${pendingComplaints.length} Outstanding Cases`, 50, currentY + 12);

      doc.setFont("Helvetica", "bold");
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text("LEDGER REF:", 115, currentY + 6);
      doc.setFont("Helvetica", "normal");
      doc.text("MP-LEDG-2026-PENDING", 145, currentY + 6);

      doc.setFont("Helvetica", "bold");
      doc.text("DATED LOG:", 115, currentY + 12);
      doc.setFont("Helvetica", "normal");
      doc.text(new Date().toLocaleDateString(), 145, currentY + 12);

      currentY += 25;

      const tableHeaders = [["ENTRY NO", "WARD JURISDICTION", "CATEGORY", "PRIORITY", "GRIEVANCE STATEMENT", "LODGED DATE"]];
      const tableRows = pendingComplaints.map((c) => [
        c.entryNumber || `COMP-${c.id.slice(-4).toUpperCase()}`,
        c.ward || "Unspecified Ward",
        c.category || "General",
        c.priority || "MEDIUM",
        `${c.title || "No Title"}\n\nAI SUMMARY: ${c.aiSummary || "Awaiting Classification"}`,
        c.date ? new Date(c.date).toLocaleDateString() : "Pending Log"
      ]);

      doc.autoTable({
        startY: currentY,
        head: tableHeaders,
        body: tableRows,
        theme: "grid",
        margin: { left: 15, right: 15 },
        headStyles: {
          fillColor: [27, 42, 74],
          textColor: [250, 248, 242],
          fontSize: 8,
          fontStyle: "bold",
          halign: "left"
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [30, 41, 59]
        },
        columnStyles: {
          0: { cellWidth: 22, fontStyle: "bold" },
          1: { cellWidth: 32 },
          2: { cellWidth: 26 },
          3: { cellWidth: 16, fontStyle: "bold" },
          4: { cellWidth: 64 },
          5: { cellWidth: 20 }
        },
        alternateRowStyles: {
          fillColor: [250, 248, 242]
        },
        didParseCell: function (data) {
          if (data.section === "body" && data.column.index === 3) {
            const val = data.cell.raw;
            if (val === "HIGH" || val === "URGENT") {
              data.cell.styles.textColor = [190, 24, 74];
            } else {
              data.cell.styles.textColor = [217, 119, 6];
            }
          }
        },
        didDrawPage: function (data) {
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(150, 150, 150);
          doc.text(`Page ${data.pageNumber}`, 195, 287, { align: "right" });
          doc.text("CONFIDENTIAL - PARLIAMENTARY RECORD FOR DISTRICT DEV OUTLAYS", 15, 287);
        }
      });

      let finalY = doc.lastAutoTable.finalY || currentY + 40;

      if (finalY > 240) {
        doc.addPage();
        finalY = 30;
      } else {
        finalY += 15;
      }

      // Divider & Signatures
      doc.setDrawColor(27, 42, 74);
      doc.setLineWidth(0.3);
      doc.line(15, finalY, 85, finalY);
      doc.line(125, finalY, 195, finalY);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      
      doc.text("Shri Pratap Chandra Sarangi", 50, finalY + 4, { align: "center" });
      doc.text("MEMBER OF PARLIAMENT (MP)", 50, finalY + 8, { align: "center" });
      doc.setFont("Helvetica", "normal");
      doc.text("Balasore Sadar Constituency", 50, finalY + 12, { align: "center" });

      doc.setFont("Helvetica", "bold");
      doc.text("Rashmi Ranjan Patra", 160, finalY + 4, { align: "center" });
      doc.text("REGISTRY COMPTROLLER", 160, finalY + 8, { align: "center" });
      doc.setFont("Helvetica", "normal");
      doc.text("Balasore Sadar Local Board", 160, finalY + 12, { align: "center" });

      doc.save(`BALASORE_SADAR_PENDING_GRIEVANCES_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Error generating PDF document. Please try again.");
    }
  };
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;
  const review = complaints.filter((c) => c.status === "IN_REVIEW").length;
  const pending = complaints.filter((c) => c.status === "PENDING").length;
  const resolutionRate = total > 0 ? Math.round(resolved / total * 100) : 100;
  const estimatedAllocatedFunds = resolved * 185e4;
  return <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6">
      
      {
    /* Page Header Toolbar */
  }
      <div className="border-b border-ink-navy/10 pb-3 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-marigold tracking-widest uppercase block mb-1">
            LEGISLATIVE ACCOUNTABILITY
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink-navy">
            Audit Ledger Reports
          </h1>
          <p className="text-sm text-ink-text/75 mt-1">
            Generate, inspect, and export formal constituency accountability summaries and local fund balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
    onClick={loadReportData}
    className="p-2 border border-ink-navy/20 hover:bg-white/40 rounded transition-colors cursor-pointer"
    title="Refresh Ledger"
  >
            <RefreshCw className="w-4 h-4 text-ink-navy" />
          </button>

          <button
            onClick={handleDownloadPendingPDF}
            className="flex items-center gap-1.5 bg-marigold hover:bg-amber-600 text-[#FAF8F2] px-4 py-2 rounded font-bold cursor-pointer transition-colors shadow-sm print:hidden"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>DOWNLOAD PENDING PDF</span>
          </button>
          
          <button
    onClick={handlePrint}
    className="flex items-center gap-1.5 bg-ink-navy hover:bg-ink-navy/90 text-paper px-4 py-2 rounded font-bold cursor-pointer transition-colors"
  >
            <Printer className="w-3.5 h-3.5 text-marigold" />
            <span>PRINT REPORT</span>
          </button>
        </div>
      </div>

      {loading ? <div className="py-24 text-center font-mono text-sm text-ink-navy/60">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-marigold mb-3" />
          <span>Assembling audit trails...</span>
        </div> : <div className="bg-paper border-2 border-ink-navy p-4 md:p-6 rounded-lg shadow-xl relative overflow-hidden font-sans text-ink-text print:border-0 print:p-0 print:shadow-none">
          
          {
    /* Notebook styled vertical ledger lines for that formal registry touch */
  }
          <div className="absolute top-0 bottom-0 left-3 border-l border-stamp-red/20 hidden md:block print:hidden" />
          <div className="absolute top-0 bottom-0 left-4 border-l border-stamp-red/20 hidden md:block print:hidden" />

          <div className="md:pl-6">
            
            {
    /* Seal / Letterhead */
  }
            <div className="text-center border-b-2 border-ink-navy pb-4 mb-6">
              <Landmark className="w-12 h-12 text-marigold mx-auto mb-2" />
              <h2 className="font-serif text-2xl font-bold uppercase tracking-wide text-ink-navy">
                Office of the Member of Parliament
              </h2>
              <span className="font-mono text-[9px] uppercase tracking-widest text-marigold font-bold block mt-1">
                CONSTITUENCY ACCOUNTABILITY CERTIFICATE &amp; RECONCILIATION REPORT
              </span>
              <span className="font-mono text-[9px] text-ink-navy/55 block mt-0.5">
                GENERATED UTC: {reportDate}
              </span>
            </div>

            {
    /* General Ledger Index Metadata */
  }
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-ink-navy/15 pb-4 mb-6 font-mono text-xs">
              <div>
                <span className="text-ink-navy/50 block text-[9px] uppercase">REPORT NO:</span>
                <span className="font-bold text-ink-navy block mt-0.5">MP-REP-2026-A4</span>
              </div>
              <div>
                <span className="text-ink-navy/50 block text-[9px] uppercase">CONSTITUENCY:</span>
                <span className="font-bold text-ink-navy block mt-0.5">BALASORE SADAR</span>
              </div>
              <div>
                <span className="text-ink-navy/50 block text-[9px] uppercase">REPRESENTATIVE:</span>
                <span className="font-bold text-ink-navy block mt-0.5">Shri Pratap Sarangi</span>
              </div>
              <div>
                <span className="text-ink-navy/50 block text-[9px] uppercase">LEAF COUNT:</span>
                <span className="font-bold text-ink-navy block mt-0.5">{total} Grievances</span>
              </div>
            </div>

            {
    /* Executive Highlights Grid */
  }
            <h3 className="font-mono text-xs text-marigold tracking-widest uppercase mb-4 font-bold">
              I. EXECUTIVE PERFORMANCE METRICS
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div className="border border-ink-navy/10 rounded p-3 bg-white/40">
                <span className="font-mono text-[9px] text-ink-navy/55 uppercase block">RESOLVED SANCTION RATE:</span>
                <span className="font-mono text-3xl font-bold text-moss mt-1 block">
                  {resolutionRate}%
                </span>
                <span className="text-[10px] text-ink-text/60 mt-1 block leading-normal">
                  {resolved} out of {total} cases successfully closed.
                </span>
              </div>

              <div className="border border-ink-navy/10 rounded p-3 bg-white/40">
                <span className="font-mono text-[9px] text-ink-navy/55 uppercase block">ESTIMATED FUND ALLOCATION:</span>
                <span className="font-mono text-3xl font-bold text-ink-navy mt-1 block">
                  ₹{(estimatedAllocatedFunds / 1e7).toFixed(2)} Cr
                </span>
                <span className="text-[10px] text-ink-text/60 mt-1 block leading-normal">
                  Development outlays disbursed from MPLAD accounts.
                </span>
              </div>

              <div className="border border-ink-navy/10 rounded p-3 bg-white/40">
                <span className="font-mono text-[9px] text-ink-navy/55 uppercase block">PENDING DEBATE FILES:</span>
                <span className="font-mono text-3xl font-bold text-stamp-red mt-1 block">
                  {pending}
                </span>
                <span className="text-[10px] text-ink-text/60 mt-1 block leading-normal">
                  {pending} outstanding complaints awaiting review steps.
                </span>
              </div>
            </div>

            {
    /* Audit Logging list */
  }
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono text-xs text-marigold tracking-widest uppercase font-bold">
                II. RECENT REGISTRY TRANSACTION ENTRIES
              </h3>
              <span className="font-mono text-[9px] text-ink-navy/50 uppercase">SHOWING LATEST 6 RECORD ACTIONS</span>
            </div>

            <div className="border border-ink-navy/15 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-ink-navy text-paper uppercase text-[9px] tracking-wider border-b border-ink-navy/20">
                    <th className="py-2.5 px-4 font-bold">ENTRY NO</th>
                    <th className="py-2.5 px-4 font-bold">WARD JURISDICTION</th>
                    <th className="py-2.5 px-4 font-bold">CATEGORY</th>
                    <th className="py-2.5 px-4 font-bold">AUDIT STATE</th>
                    <th className="py-2.5 px-4 font-bold text-right">LODGED DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-navy/10 bg-white/20">
                  {complaints.slice(0, 6).map((c) => <tr key={c.id} className="hover:bg-white/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-ink-navy">{c.entryNumber}</td>
                      <td className="py-3 px-4 truncate max-w-[130px]">{c.ward}</td>
                      <td className="py-3 px-4 font-semibold text-amber-800">{c.category}</td>
                      <td className="py-3 px-4 font-bold text-xs">
                        <span className={`
                          ${c.status === "RESOLVED" ? "text-moss" : c.status === "IN_REVIEW" ? "text-marigold" : "text-stamp-red"}
                        `}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-ink-navy/60">
                        {new Date(c.date).toLocaleDateString()}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {
    /* Formal Certificate Signatures */
  }
            <div className="grid grid-cols-2 gap-12 pt-6 border-t border-dashed border-ink-navy/25 font-mono text-[10px] mt-6">
              <div>
                <div className="h-10 flex items-end justify-center">
                  <span className="font-serif italic text-sm text-ink-navy/60">Shri Pratap Chandra Sarangi</span>
                </div>
                <div className="border-t border-ink-navy/30 pt-1 text-center font-bold">
                  MEMBER OF PARLIAMENT (MP)
                </div>
                <div className="text-center text-ink-navy/55 mt-0.5">Office Seal Authorized</div>
              </div>

              <div>
                <div className="h-10 flex items-end justify-center">
                  <span className="font-serif italic text-sm text-ink-navy/60">Rashmi Ranjan Patra</span>
                </div>
                <div className="border-t border-ink-navy/30 pt-1 text-center font-bold">
                  REGISTRY COMPTROLLER
                </div>
                <div className="text-center text-ink-navy/55 mt-0.5">Balasore Sadar Local Board</div>
              </div>
            </div>

          </div>
        </div>}

    </div>;
};

/**
 * LUMIÈRE ATELIER — Luxury Executive Reports Direct PDF Export Engine
 * Renders and downloads high-fidelity PDF documents client-side using html2pdf.
 * Replaces window.print() so users receive direct file downloads without the print spooler starting.
 */

window.downloadReportPDF = async function(registerName, period) {
  const btn = document.getElementById('btnDownloadPdf') || 
              document.querySelector('.btn-report-primary') ||
              (typeof event !== 'undefined' && event?.currentTarget);
  
  let originalHtml = '';
  if (btn) {
    originalHtml = btn.innerHTML;
    btn.innerHTML = '<span>⏳</span> Generating PDF...';
    btn.disabled = true;
  }

  const element = document.getElementById('printableReport') || document.querySelector('.report-paper');
  if (!element) {
    if (btn) {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }
    alert('Report content element was not found.');
    return;
  }

  const cleanPeriod = (period || '30D').toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = (registerName || 'Executive').replace(/\s+/g, '_');
  const filename = `Lumiere_${safeName}_Register_${cleanPeriod}_${dateStr}.pdf`;

  // Dynamically load html2pdf if not present
  if (typeof html2pdf !== 'function') {
    console.warn('[PDF Export] html2pdf library not loaded, fetching script dynamically...');
    try {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'js/html2pdf.bundle.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    } catch (e) {
      console.error('[PDF Export] Failed to dynamically load html2pdf:', e);
      if (btn) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
      alert('PDF generation module could not be loaded. Please use the Print button.');
      return;
    }
  }

  // Apply PDF export styling
  element.classList.add('pdf-export-mode');

  const opt = {
    margin: [8, 8, 8, 8],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0c0c0e',
      logging: false,
      windowWidth: 1200
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(element).save();
    
    if (btn) {
      btn.innerHTML = '<span>✓</span> Downloaded!';
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }, 2500);
    }
  } catch (err) {
    console.error('[PDF Export] Execution error:', err);
    if (btn) {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }
    alert('An error occurred while compiling the PDF. Please try again or use the Print button.');
  } finally {
    element.classList.remove('pdf-export-mode');
  }
};

// main.js
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById('table-body');

  // -----------------------
  // Date setup
  // -----------------------
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const eightDaysAgo = new Date(today);
  eightDaysAgo.setDate(today.getDate() - 8);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  // -----------------------
  // Helper functions
  // -----------------------
  function fmtDate(d) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function parsePickerDate(str) {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  function parseJsonDate(str) {
    const parts = str.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  // -----------------------
  // Pre-seed input values so pickers aren't empty
  // -----------------------
  $('#datepicker-start').val(fmtDate(eightDaysAgo));
  $('#datepicker-end').val(fmtDate(yesterday));

  // -----------------------
  // Initialize datepickers
  // -----------------------
  $('#datepicker-start').datepicker({
    format: 'dd/mm/yyyy',
    todayHighlight: true,
    autoclose: true,
    startDate: oneMonthAgo,
    endDate: yesterday
  }).datepicker('update');

  $('#datepicker-end').datepicker({
    format: 'dd/mm/yyyy',
    todayHighlight: true,
    autoclose: true,
    startDate: oneMonthAgo,
    endDate: yesterday
  }).datepicker('update');

  // -----------------------
  // Load & filter data function
  // -----------------------
  function loadData() {
    const fromStr = $('#datepicker-start').val();
    const toStr = $('#datepicker-end').val();

    if (!fromStr || !toStr) return;

    const fromDate = parsePickerDate(fromStr);
    const toDate = parsePickerDate(toStr);

    // Dropdown values
    const selectedBanner = $('#dropdown1').val(); // All / CAFR / CAPL / etc.
    const selectedEvent = $('#dropdown2').val();  // All / add_to_cart / page_view / etc.
    const selectedPlatform = $('#dropdown3').val(); // All / Web / Mobile
    const selectedAnomaly = $('#dropdown4').val(); // Unspecified / Anomalous data only / Within Normal Limits

    fetch('mock-data.json')
      .then(r => {
        if (!r.ok) throw new Error('Network response was not ok');
        return r.json();
      })
      .then(data => {
        tableBody.innerHTML = '';

        const filtered = data.filter(row => {
          const rowDate = parseJsonDate(row.timestamp);

          // Date filter
          if (rowDate < fromDate || rowDate > toDate) return false;

          // Banner filter
          if (selectedBanner !== "All" && row.banner !== selectedBanner) return false;

          // Event filter
          if (selectedEvent !== "All" && row.eventName !== selectedEvent) return false;

          // Platform filter
          if (selectedPlatform !== "All" && row.platform.toLowerCase() !== selectedPlatform.toLowerCase()) return false;

          // Anomaly filter
          if (selectedAnomaly === "Anomalous data only" && row.anomalyDetected !== "Yes") return false;
          if (selectedAnomaly === "Within Normal Limits" && row.anomalyDetected !== "No") return false;

          return true;
        });

        if (filtered.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No results for selected filters</td></tr>';
          return;
        }

        filtered.forEach(row => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row.eventName}</td>
            <td>${row.anomalyDetected}</td>
            <td>${row.healthScore}</td>
            <td>${row.eventImportance}</td>
            <td>${row.platformCoverage}</td>
          `;
          tableBody.appendChild(tr);
        });
      })
      .catch(err => {
        console.error("Error loading mock data:", err);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading data</td></tr>';
      });
  }

  // -----------------------
  // Event listeners
  // -----------------------
  $('#datepicker-start, #datepicker-end').on('changeDate', loadData);
  $('#dropdown1, #dropdown2, #dropdown3, #dropdown4').on('change', loadData);

  // -----------------------
  // Initial table load on page load
  // -----------------------
  loadData();
});

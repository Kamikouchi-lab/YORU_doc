/* YORU Usage Dashboard */
(function () {
  var BASE = window.DASHBOARD_DATA_BASE || '';

  function fetchJSON(name) {
    return fetch(BASE + '/' + name)
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function fmt(n) {
    if (n == null || n === 0 && arguments[1]) return '\u2014';
    return Number(n).toLocaleString();
  }

  function fmtDate(iso) {
    if (!iso) return '\u2014';
    return iso.replace('T', ' ').replace('Z', ' UTC');
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }


  // Chart colors matching Lanyon theme-base-09
  var ORANGE = 'rgba(210,132,69,1)';
  var ORANGE_BG = 'rgba(210,132,69,0.12)';
  var BLUE = 'rgba(106,159,181,1)';
  var BLUE_BG = 'rgba(106,159,181,0.12)';

  function lineChart(canvasId, labels, datasets, plugins) {
    var ctx = document.getElementById(canvasId);
    if (!ctx || labels.length === 0) return null;
    return new Chart(ctx, {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: Object.assign({ legend: { position: 'bottom', labels: { boxWidth: 12 } } }, plugins),
        scales: {
          x: { ticks: { autoSkip: true, maxRotation: 45, maxTicksLimit: 15 } },
          y: { beginAtZero: true }
        }
      }
    });
  }

  /* --- Interactive range (zoom / pan / period selection) --- */

  if (window.Chart && window.ChartZoom) Chart.register(window.ChartZoom);

  var DEFAULT_RANGE_MONTHS = 6;

  // Return the YYYY-MM-DD date `months` months before `iso`
  function monthsBefore(iso, months) {
    var d = new Date(iso + 'T00:00:00Z');
    d.setUTCMonth(d.getUTCMonth() - months);
    return d.toISOString().slice(0, 10);
  }

  function zoomOptions(onChange) {
    return {
      zoom: {
        limits: { x: { min: 'original', max: 'original', minRange: 6 } },
        pan: { enabled: true, mode: 'x', onPanComplete: onChange },
        zoom: {
          wheel: { enabled: true, modifierKey: 'ctrl' },
          pinch: { enabled: true },
          mode: 'x',
          onZoomComplete: onChange
        }
      }
    };
  }

  function setupRangeControls(containerId, chart, labels) {
    var box = document.getElementById(containerId);
    if (!box || !chart) return;
    var buttons = box.querySelectorAll('button[data-months]');
    var fromInput = box.querySelector('input[data-role="from"]');
    var toInput = box.querySelector('input[data-role="to"]');
    var first = labels[0], last = labels[labels.length - 1];
    fromInput.min = toInput.min = first;
    fromInput.max = toInput.max = last;

    function indexAtOrAfter(date) {
      for (var i = 0; i < labels.length; i++) if (labels[i] >= date) return i;
      return labels.length - 1;
    }
    function indexAtOrBefore(date) {
      for (var i = labels.length - 1; i >= 0; i--) if (labels[i] <= date) return i;
      return 0;
    }
    function setActive(months) {
      Array.prototype.forEach.call(buttons, function (b) {
        b.classList.toggle('active', b.getAttribute('data-months') === String(months));
      });
    }
    function syncInputs() {
      var x = chart.scales.x;
      fromInput.value = labels[Math.max(0, Math.round(x.min))];
      toInput.value = labels[Math.min(labels.length - 1, Math.round(x.max))];
    }
    function showRange(lo, hi) {
      if (hi < lo) { var t = lo; lo = hi; hi = t; }
      chart.zoomScale('x', { min: lo, max: hi }, 'none');
      syncInputs();
    }
    function showMonths(months) {
      var lo = months > 0 ? indexAtOrAfter(monthsBefore(last, months)) : 0;
      showRange(lo, labels.length - 1);
      setActive(months);
    }

    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener('click', function () {
        showMonths(parseInt(b.getAttribute('data-months'), 10));
      });
    });
    function onDateInput() {
      if (!fromInput.value || !toInput.value) return;
      showRange(indexAtOrAfter(fromInput.value), indexAtOrBefore(toInput.value));
      setActive(null);
    }
    fromInput.addEventListener('change', onDateInput);
    toInput.addEventListener('change', onDateInput);

    // Called by the zoom plugin after the user pans or zooms the chart
    chart.$onUserRangeChange = function () { syncInputs(); setActive(null); };

    showMonths(DEFAULT_RANGE_MONTHS);
  }

  /* --- Render sections --- */

  function renderKPIs(s) {
    if (!s) return;
    setText('kpi-stars', fmt(s.stars));
    setText('kpi-forks', fmt(s.forks));
    setText('kpi-total-clones', fmt(s.total_clones));
    setText('kpi-clones', fmt(s.clones_30d));
    setText('kpi-unique-cloners', fmt(s.unique_cloners_30d));
    setText('kpi-total-views', fmt(s.total_views));
    setText('kpi-views', fmt(s.views_30d));
    setText('kpi-unique-visitors', fmt(s.unique_visitors_30d));
    setText('last-updated', fmtDate(s.last_updated));
  }

  function renderClones(data) {
    if (!data || !data.history || data.history.length === 0) {
      setText('clones-empty', 'No clone data available yet.');
      return;
    }
    lineChart('clones-chart',
      data.history.map(function (e) { return e.date; }),
      [
        { label: 'Clones', data: data.history.map(function (e) { return e.count; }),
          borderColor: ORANGE, backgroundColor: ORANGE_BG, fill: true, tension: 0.3 },
        { label: 'Unique', data: data.history.map(function (e) { return e.uniques; }),
          borderColor: BLUE, backgroundColor: BLUE_BG, fill: true, tension: 0.3 }
      ]
    );
  }

  function renderViews(data) {
    if (!data || !data.history || data.history.length === 0) {
      setText('views-empty', 'No view data available yet.');
      return;
    }
    var labels = data.history.map(function (e) { return e.date; });
    var chart = lineChart('views-chart', labels,
      [
        { label: 'Views', data: data.history.map(function (e) { return e.count; }),
          borderColor: ORANGE, backgroundColor: ORANGE_BG, fill: true, tension: 0.3 },
        { label: 'Unique', data: data.history.map(function (e) { return e.uniques; }),
          borderColor: BLUE, backgroundColor: BLUE_BG, fill: true, tension: 0.3 }
      ],
      zoomOptions(function (ctx) {
        if (ctx.chart.$onUserRangeChange) ctx.chart.$onUserRangeChange();
      })
    );
    setupRangeControls('views-range', chart, labels);
  }

  /* --- Main --- */

  function init() {
    Promise.all([
      fetchJSON('summary.json'),
      fetchJSON('traffic_clones.json'),
      fetchJSON('traffic_views.json')
    ]).then(function (results) {
      var loading = document.getElementById('dashboard-loading');
      if (loading) loading.style.display = 'none';
      var content = document.getElementById('dashboard-content');
      if (content) content.style.display = 'block';

      renderKPIs(results[0]);
      renderClones(results[1]);
      renderViews(results[2]);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

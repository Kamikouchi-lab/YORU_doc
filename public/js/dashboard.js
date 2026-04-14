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

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  // Chart colors matching Lanyon theme-base-09
  var ORANGE = 'rgba(210,132,69,1)';
  var ORANGE_BG = 'rgba(210,132,69,0.12)';
  var BLUE = 'rgba(106,159,181,1)';
  var BLUE_BG = 'rgba(106,159,181,0.12)';

  function lineChart(canvasId, labels, datasets) {
    var ctx = document.getElementById(canvasId);
    if (!ctx || labels.length === 0) return;
    new Chart(ctx, {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
        scales: {
          x: { ticks: { autoSkip: true, maxRotation: 45, maxTicksLimit: 15 } },
          y: { beginAtZero: true }
        }
      }
    });
  }

  function barChart(canvasId, labels, values) {
    var ctx = document.getElementById(canvasId);
    if (!ctx || labels.length === 0) return;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ORANGE_BG,
          borderColor: ORANGE,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  /* --- Render sections --- */

  function renderKPIs(s) {
    if (!s) return;
    setText('kpi-stars', fmt(s.stars));
    setText('kpi-forks', fmt(s.forks));
    setText('kpi-contributors', fmt(s.contributors));
    setText('kpi-downloads', fmt(s.total_release_downloads));
    setText('kpi-clones', fmt(s.clones_30d));
    setText('kpi-unique-cloners', fmt(s.unique_cloners_30d));
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
    lineChart('views-chart',
      data.history.map(function (e) { return e.date; }),
      [
        { label: 'Views', data: data.history.map(function (e) { return e.count; }),
          borderColor: ORANGE, backgroundColor: ORANGE_BG, fill: true, tension: 0.3 },
        { label: 'Unique', data: data.history.map(function (e) { return e.uniques; }),
          borderColor: BLUE, backgroundColor: BLUE_BG, fill: true, tension: 0.3 }
      ]
    );
  }

  function renderReleases(data) {
    if (!data || !data.releases || data.releases.length === 0) {
      setText('releases-empty', 'No release data available yet.');
      return;
    }
    var filtered = data.releases.filter(function (r) { return r.total_downloads > 0 || r.assets.length > 0; });
    if (filtered.length === 0) {
      setText('releases-empty', 'No download data available.');
      return;
    }
    barChart('releases-chart',
      filtered.map(function (r) { return r.tag_name; }),
      filtered.map(function (r) { return r.total_downloads; })
    );
  }

  function renderReferrers(data) {
    var tbody = document.getElementById('referrers-body');
    if (!tbody) return;
    if (!data || !data.referrers || data.referrers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="dash-empty">No referrer data available yet.</td></tr>';
      return;
    }
    tbody.innerHTML = data.referrers.map(function (r) {
      return '<tr><td>' + escapeHtml(r.referrer) + '</td><td>' + fmt(r.count) + '</td><td>' + fmt(r.uniques) + '</td></tr>';
    }).join('');
  }

  function renderPaths(data) {
    var tbody = document.getElementById('paths-body');
    if (!tbody) return;
    if (!data || !data.paths || data.paths.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="dash-empty">No path data available yet.</td></tr>';
      return;
    }
    tbody.innerHTML = data.paths.map(function (p) {
      return '<tr><td>' + escapeHtml(p.path) + '</td><td>' + fmt(p.count) + '</td><td>' + fmt(p.uniques) + '</td></tr>';
    }).join('');
  }

  /* --- Main --- */

  function init() {
    Promise.all([
      fetchJSON('summary.json'),
      fetchJSON('traffic_clones.json'),
      fetchJSON('traffic_views.json'),
      fetchJSON('releases.json'),
      fetchJSON('referrers.json'),
      fetchJSON('popular_paths.json')
    ]).then(function (results) {
      renderKPIs(results[0]);
      renderClones(results[1]);
      renderViews(results[2]);
      renderReleases(results[3]);
      renderReferrers(results[4]);
      renderPaths(results[5]);

      var loading = document.getElementById('dashboard-loading');
      if (loading) loading.style.display = 'none';
      var content = document.getElementById('dashboard-content');
      if (content) content.style.display = 'block';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

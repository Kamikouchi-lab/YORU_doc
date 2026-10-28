// YORU Ecosystem page: point at a file in "From video to result" to light up
// every step that reads or writes the same file.
(function () {
  var lanes = document.querySelector('.eco-lanes');
  if (!lanes) return;
  var files = Array.prototype.slice.call(lanes.querySelectorAll('.eco-file[data-file]'));

  var count = {};
  files.forEach(function (f) {
    var name = f.getAttribute('data-file');
    count[name] = (count[name] || 0) + 1;
  });

  function trace(name, on) {
    lanes.classList.toggle('is-tracing', on);
    files.forEach(function (f) {
      f.classList.toggle('is-linked', on && f.getAttribute('data-file') === name);
    });
  }

  files.forEach(function (f) {
    var name = f.getAttribute('data-file');
    if (count[name] > 1) {
      f.classList.add('is-handoff');
      f.title = 'Hand-off: ' + count[name] + ' steps use ' + name;
    }
    f.addEventListener('mouseenter', function () { trace(name, true); });
    f.addEventListener('mouseleave', function () { trace(name, false); });
    f.addEventListener('focus', function () { trace(name, true); });
    f.addEventListener('blur', function () { trace(name, false); });
  });
})();

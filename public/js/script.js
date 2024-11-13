(function(document) {
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.querySelector('#sidebar');
  var checkbox = document.querySelector('#sidebar-checkbox');

  document.addEventListener('click', function(e) {
    var target = e.target;

    if(!checkbox.checked ||
       sidebar.contains(target) ||
       (target === checkbox || target === toggle)) return;

    checkbox.checked = false;
  }, false);
})(document);

document.querySelectorAll('details').forEach((details) => {
  details.addEventListener('toggle', () => {
    console.log(`${details.querySelector('summary').textContent} が${details.open ? '展開' : '閉鎖'}されました`);
  });
});
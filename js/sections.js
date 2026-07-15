(function () {
  var headers = document.querySelectorAll('.section__header');
  for (var i = 0; i < headers.length; i++) {
    (function (header) {
      header.addEventListener('click', function () {
        var section = header.parentNode;
        if (section) section.classList.toggle('open');
      });
    })(headers[i]);
  }
})();

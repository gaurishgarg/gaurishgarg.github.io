// Admin helpers for the add forms on /edit
//  1. <form data-template-form>: shows only the fields of the template picked in <select name="template">.
//     Fields of the other templates are disabled so they are neither validated nor submitted.
//  2. <input type="checkbox" data-switch="#id">: shows / enables an optional block (video overview, 3D viewer).
(function () {
  function setDisabled(root, disabled) {
    root.querySelectorAll('input, textarea, select').forEach(function (el) { el.disabled = disabled; });
  }

  document.querySelectorAll('form[data-template-form]').forEach(function (form) {
    var select = form.querySelector('select[name="template"]');
    var groups = form.querySelectorAll('.tpl-group');
    function apply() {
      groups.forEach(function (group) {
        var on = group.getAttribute('data-template') === select.value;
        group.style.display = on ? '' : 'none';
        setDisabled(group, !on);
      });
    }
    select.addEventListener('change', apply);
    apply();
  });

  document.querySelectorAll('input[data-switch]').forEach(function (box) {
    var block = document.querySelector(box.getAttribute('data-switch'));
    if (!block) { return; }
    function apply() {
      block.style.display = box.checked ? '' : 'none';
      setDisabled(block, !box.checked);
      block.querySelectorAll('[data-req]').forEach(function (el) { el.required = box.checked; });
    }
    box.addEventListener('change', apply);
    apply();
  });
})();

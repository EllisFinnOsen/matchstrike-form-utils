(function (window, document) {
  "use strict";

  var CSS_INSERTED = false;

  function insertCssOnce() {
    if (CSS_INSERTED) return;
    CSS_INSERTED = true;

    var style = document.createElement("style");
    style.setAttribute("data-honeypot-style", "true");
    style.textContent = `
      .hp-field {
        position: absolute !important;
        left: -9999px !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function setupForm(form) {
    // Avoid double-binding
    if (form.__honeypotInitialized) return;
    form.__honeypotInitialized = true;

    var fieldName = form.getAttribute("data-honeypot-field") || "_hp_field";
    var behavior = form.getAttribute("data-honeypot-behavior") || "block";

    // Find or create honeypot input
    var hp = form.querySelector('[name="' + fieldName + '"]');
    if (!hp) {
      hp = document.createElement("input");
      hp.type = "text";
      hp.name = fieldName;
      hp.autocomplete = "off";
      hp.className = "hp-field";
      form.appendChild(hp);
    } else {
      // Ensure the CSS class is there if user pre-added the field
      if (!hp.classList.contains("hp-field")) {
        hp.classList.add("hp-field");
      }
    }

    // Submit handler
    form.addEventListener(
      "submit",
      function (e) {
        if (!hp) return;

        var value = (hp.value || "").trim();
        if (value !== "") {
          // This looks like a bot submission, block it
          e.preventDefault();
          e.stopPropagation();

          // Optional: emit a custom event so devs can hook into this
          try {
            var evt = new CustomEvent("honeypot:blocked", {
              detail: {
                form: form,
                field: hp,
                value: value,
              },
            });
            form.dispatchEvent(evt);
          } catch (err) {
            // IE11 etc: fail silently
          }

          if (behavior === "silent-success") {
            try {
              // Reset the form so it "looks" like a success
              form.reset();

              // Webflow-style success/fail handling if present
              var done = form.querySelector(".w-form-done");
              var fail = form.querySelector(".w-form-fail");
              if (done) done.style.display = "block";
              if (fail) fail.style.display = "none";
            } catch (err) {
              // ignore UI errors
            }
          }

          return false;
        }
      },
      true // capture to try and beat other listeners
    );
  }

  function init() {
    insertCssOnce();

    var forms = document.querySelectorAll("form[data-honeypot]");
    if (!forms.length) return;

    // NodeList.forEach fallback for older browsers
    for (var i = 0; i < forms.length; i++) {
      setupForm(forms[i]);
    }
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose a tiny API in case you dynamically add forms later
  window.FormHoneypot = {
    init: init,
    version: "1.0.0",
  };
})(window, document);

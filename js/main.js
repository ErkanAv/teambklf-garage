(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  function setNavOpen(open) {
    if (!header || !toggle || !nav) return;
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
    document.body.classList.toggle("nav-locked", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNavOpen(!header.classList.contains("nav-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setNavOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 800) setNavOpen(false);
    });
  }

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length && "IntersectionObserver" in window) {
    var revealQueue = [];
    var revealFlushScheduled = false;

    function flushReveals() {
      revealFlushScheduled = false;
      var batch = revealQueue.splice(0, revealQueue.length);
      batch.forEach(function (el, i) {
        el.style.setProperty("--reveal-delay", i * 70 + "ms");
        el.classList.add("is-visible");
        el.addEventListener(
          "transitionend",
          function onDone(event) {
            if (event.propertyName !== "opacity") return;
            el.classList.add("is-settled");
            el.removeEventListener("transitionend", onDone);
          }
        );
      });
    }

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          revealQueue.push(entry.target);
          observer.unobserve(entry.target);
        });
        if (!revealFlushScheduled && revealQueue.length) {
          revealFlushScheduled = true;
          requestAnimationFrame(flushReveals);
        }
      },
      { threshold: 0.06, rootMargin: "40px 0px -3% 0px" }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible", "is-settled");
    });
  }

  /* Contact: EmailJS op desktop, FormSubmit op gsm (EmailJS faalt vaak op iOS) */
  var EMAILJS_PUBLIC_KEY = "0oQmkEsCd3Wez9k9B";
  var EMAILJS_SERVICE_ID = "service_81f4keu";
  var EMAILJS_TEMPLATE_ID = "template_i2sv11w";
  var CONTACT_MAIL = "teambklf@gmail.com";

  function isInAppBrowser() {
    var ua = navigator.userAgent || "";
    return /WhatsApp|Instagram|FBAN|FBAV|FB_IAB|Line\/|Twitter|Snapchat/i.test(ua);
  }

  function isMobileDevice() {
    var ua = navigator.userAgent || "";
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return true;
    if (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform || "")) return true;
    return false;
  }

  var inappBanner = document.getElementById("inapp-banner");
  if (inappBanner && isInAppBrowser()) {
    inappBanner.hidden = false;
  }

  var form = document.querySelector(".contact-form");
  if (form) {
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var customSelect = form.querySelector(".custom-select");
    var selectTrigger = form.querySelector(".custom-select-trigger");
    var selectMenu = form.querySelector(".custom-select-menu");
    var selectValue = form.querySelector(".custom-select-value");
    var selectInput = form.querySelector("#onderwerp");
    var selectOptions = selectMenu
      ? Array.prototype.slice.call(selectMenu.querySelectorAll('[role="option"]'))
      : [];
    var selectCloseTimer = null;

    if (new URLSearchParams(window.location.search).get("sent") === "1") {
      form.classList.add("is-sent");
      if (status) {
        status.hidden = false;
        status.classList.remove("is-error");
        status.textContent =
          "Bedankt! Je bericht is verzonden. We antwoorden zo snel mogelijk.";
      }
    }

    function setCustomSelectValue(value) {
      if (!selectInput || !selectValue) return;
      selectInput.value = value;
      selectValue.textContent = value;
      selectOptions.forEach(function (option) {
        option.setAttribute(
          "aria-selected",
          option.getAttribute("data-value") === value ? "true" : "false"
        );
      });
    }

    function closeCustomSelect() {
      if (!customSelect || !selectTrigger || !selectMenu) return;
      if (!customSelect.classList.contains("is-open")) return;
      customSelect.classList.remove("is-open");
      selectTrigger.setAttribute("aria-expanded", "false");
      window.clearTimeout(selectCloseTimer);
      selectCloseTimer = window.setTimeout(function () {
        selectMenu.hidden = true;
      }, 220);
    }

    function openCustomSelect() {
      if (!customSelect || !selectTrigger || !selectMenu) return;
      window.clearTimeout(selectCloseTimer);
      selectMenu.hidden = false;
      selectTrigger.setAttribute("aria-expanded", "true");
      void selectMenu.offsetWidth;
      customSelect.classList.add("is-open");
    }

    function toggleCustomSelect() {
      if (!customSelect) return;
      if (customSelect.classList.contains("is-open")) closeCustomSelect();
      else openCustomSelect();
    }

    if (customSelect && selectTrigger && selectMenu) {
      selectTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleCustomSelect();
      });

      selectOptions.forEach(function (option) {
        option.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          setCustomSelectValue(option.getAttribute("data-value"));
          closeCustomSelect();
          selectTrigger.focus();
        });
      });

      document.addEventListener("pointerdown", function (event) {
        if (!customSelect.contains(event.target)) closeCustomSelect();
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeCustomSelect();
      });

      form.addEventListener("reset", function () {
        window.setTimeout(function () {
          setCustomSelectValue("Onderhoud");
          closeCustomSelect();
        }, 0);
      });

      var onderwerpParam = new URLSearchParams(window.location.search).get("onderwerp");
      if (
        onderwerpParam &&
        selectOptions.some(function (option) {
          return option.getAttribute("data-value") === onderwerpParam;
        })
      ) {
        setCustomSelectValue(onderwerpParam);
      }
    }

    function setStatus(message, isError) {
      if (!status) return;
      status.hidden = false;
      status.innerHTML = message;
      status.classList.toggle("is-error", !!isError);
      try {
        status.focus({ preventScroll: true });
      } catch (err) {
        /* older browsers */
      }
    }

    function buildMailto(params) {
      var subject = encodeURIComponent(
        "TEAMBKLF · " + params.onderwerp + " · " + params.naam
      );
      var body = encodeURIComponent(
        "Naam: " +
          params.naam +
          "\nE-mail: " +
          params.email +
          "\nOnderwerp: " +
          params.onderwerp +
          "\n\n" +
          params.bericht
      );
      return "mailto:" + CONTACT_MAIL + "?subject=" + subject + "&body=" + body;
    }

    function readFormValues() {
      var nameField = form.querySelector("#naam") || form.elements.namedItem("name");
      var emailField = form.querySelector("#email") || form.elements.namedItem("email");
      var messageField = form.querySelector("#bericht") || form.elements.namedItem("message");
      var onderwerpField = form.querySelector("#onderwerp");

      return {
        naam: nameField && nameField.value ? nameField.value.trim() : "",
        email: emailField && emailField.value ? emailField.value.trim() : "",
        onderwerp: onderwerpField && onderwerpField.value ? onderwerpField.value : "Andere vraag",
        bericht: messageField && messageField.value ? messageField.value.trim() : ""
      };
    }

    function sendViaEmailJs(templateParams) {
      return fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: templateParams
        })
      }).then(function (response) {
        if (response.ok) return response.text();
        return response.text().then(function (text) {
          var err = new Error(text || "HTTP " + response.status);
          err.status = response.status;
          err.text = text || "HTTP " + response.status;
          throw err;
        });
      });
    }

    /* Native POST — werkt op iOS waar fetch naar EmailJS faalt */
    function submitViaFormSubmit(values) {
      var nextUrl =
        window.location.href.split("?")[0].split("#")[0] + "?sent=1";
      var fields = {
        name: values.naam,
        email: values.email,
        onderwerp: values.onderwerp,
        message: values.bericht,
        _subject: "TEAMBKLF · " + values.onderwerp + " · " + values.naam,
        _captcha: "false",
        _template: "table",
        _next: nextUrl
      };
      var f = document.createElement("form");
      f.method = "POST";
      f.action = "https://formsubmit.co/" + CONTACT_MAIL;
      f.style.display = "none";
      Object.keys(fields).forEach(function (key) {
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = fields[key];
        f.appendChild(input);
      });
      document.body.appendChild(f);
      f.submit();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var honey = form.querySelector("[name='_honey']");
      if (honey && honey.value) {
        setStatus("Verzenden geblokkeerd.", true);
        return;
      }

      var values = readFormValues();
      if (!values.naam || !values.email || !values.bericht) {
        setStatus("Vul alle verplichte velden in.", true);
        return;
      }

      var mailtoHref = buildMailto(values);
      var mailtoBtn =
        '<a class="btn" style="margin-top:0.75rem" href="' +
        mailtoHref +
        '">Open mail-app</a>';

      var subjectField = form.querySelector("#fs-subject");
      if (subjectField) {
        subjectField.value = "TEAMBKLF · " + values.onderwerp + " · " + values.naam;
      }

      /* Native form POST naar FormSubmit — werkt op gsm zonder EmailJS/fetch */
      if (submitBtn) submitBtn.disabled = true;
      setStatus("Bezig met versturen… even geduld");
      try {
        HTMLFormElement.prototype.submit.call(form);
      } catch (err) {
        if (submitBtn) submitBtn.disabled = false;
        setStatus(
          "Automatisch versturen lukte niet. Tik op de knop hieronder of DM @teambklf.garage.<br>" +
            mailtoBtn,
          true
        );
      }
    });
  }
})();

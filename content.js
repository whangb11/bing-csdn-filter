(function () {
  "use strict";

  const SUFFIX = " -CSDN";
  const HAS_SUFFIX = /-\s*csdn/i;
  const GUARD_KEY = "__bing_csdn_redirect__";

  function needsSuffix(value) {
    return (
      typeof value === "string" &&
      value.trim() !== "" &&
      !HAS_SUFFIX.test(value)
    );
  }

  function withSuffix(value) {
    return value.replace(/\s+$/, "") + SUFFIX;
  }

  function fixUrl() {
    let url;
    try {
      url = new URL(location.href);
    } catch (e) {
      return;
    }
    if (!/(^|\.)bing\.com$/i.test(url.hostname)) return;
    if (!/^\/search/i.test(url.pathname)) return;

    const q = url.searchParams.get("q");
    if (!needsSuffix(q)) return;

    try {
      if (sessionStorage.getItem(GUARD_KEY) === url.toString()) return;
      sessionStorage.setItem(GUARD_KEY, url.toString());
    } catch (e) {
      /* sessionStorage unavailable: fall back to suffix check only */
    }

    url.searchParams.set("q", withSuffix(q));
    location.replace(url.toString());
  }

  function fixForm() {
    const form =
      document.getElementById("sb_form") ||
      document.querySelector("form[action*='/search']");
    if (!form) return;

    const input = form.querySelector(
      "#sb_form_q, textarea[name='q'], input[name='q']"
    );
    if (input && needsSuffix(input.value)) {
      input.value = withSuffix(input.value);
    }
  }

  document.addEventListener(
    "submit",
    function (e) {
      const form = e.target;
      if (form && form.tagName === "FORM") fixForm();
    },
    true
  );

  document.addEventListener(
    "keydown",
    function (e) {
      if (e.key !== "Enter" && e.keyCode !== 13) return;
      const t = e.target;
      if (t && t.name === "q" && needsSuffix(t.value)) {
        t.value = withSuffix(t.value);
      }
    },
    true
  );

  fixUrl();
})();

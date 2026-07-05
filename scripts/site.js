/* ==========================================================================
   DevDocs — shared docsite runtime
   Plain browser JS (ES2017), no imports, no external libraries.
   Runs on DOMContentLoaded. All functions are null-safe.
   ========================================================================== */
(function () {
  "use strict";

  /* -------------------------------------------------------------------------
     Preview scaffolding: CSS injected into every iframe, plus a console shim.
     ------------------------------------------------------------------------- */

  var BASE_PREVIEW_CSS = [
    "html,body{margin:0}",
    "body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;",
    "font-size:15px;line-height:1.5;color:#1b1f24;padding:14px;}",
    ".__console{border-top:1px solid #d0d7de;margin-top:14px;padding-top:8px;",
    "font-family:ui-monospace,Consolas,Menlo,monospace;font-size:12.5px;",
    "line-height:1.5;white-space:pre-wrap;word-break:break-word;color:#24292f;}",
    ".__console:empty{display:none}",
    ".__console .line{padding:1px 0;border-bottom:1px solid #f0f2f4}",
    ".__console .line.error{color:#cf222e}",
    ".__console .line.warn{color:#9a6700}",
    ".__console .line.info{color:#0969da}",
    ".__console .line.debug{color:#6e7781}"
  ].join("");

  /* The shim is serialized verbatim into the iframe. It must be self-contained
     and must never reference outer-scope variables. */
  var CONSOLE_SHIM = [
    "(function(){",
    "  var box=document.createElement('div');box.className='__console';",
    "  function mount(){ if(document.body){document.body.appendChild(box);} }",
    "  if(document.body){mount();}else{document.addEventListener('DOMContentLoaded',mount);}",
    "  function fmt(v){",
    "    if(typeof v==='string')return v;",
    "    if(v instanceof Error)return v.name+': '+v.message;",
    "    if(typeof v==='function')return v.toString();",
    "    if(typeof v==='undefined')return 'undefined';",
    "    if(v===null)return 'null';",
    "    try{",
    "      var seen=[];",
    "      return JSON.stringify(v,function(k,val){",
    "        if(typeof val==='object'&&val!==null){",
    "          if(seen.indexOf(val)!==-1)return '[Circular]';",
    "          seen.push(val);",
    "        }",
    "        if(typeof val==='function')return '[Function]';",
    "        if(typeof val==='undefined')return undefined;",
    "        return val;",
    "      });",
    "    }catch(e){return String(v);}",
    "  }",
    "  function write(type,args){",
    "    var parts=[];for(var i=0;i<args.length;i++){parts.push(fmt(args[i]));}",
    "    var line=document.createElement('div');",
    "    line.className='line '+type;line.textContent=parts.join(' ');",
    "    if(!box.parentNode){mount();}",
    "    box.appendChild(line);",
    "  }",
    "  var native=window.console||{};",
    "  ['log','info','warn','error','debug'].forEach(function(m){",
    "    var orig=native[m];",
    "    console[m]=function(){",
    "      try{write(m==='log'?'log':m,arguments);}catch(e){}",
    "      if(typeof orig==='function'){try{orig.apply(native,arguments);}catch(e){}}",
    "    };",
    "  });",
    "  window.addEventListener('error',function(ev){",
    "    write('error', [ev.message?('Uncaught '+ev.message):('Uncaught '+ev.error)]);",
    "  });",
    "  window.addEventListener('unhandledrejection',function(ev){",
    "    var r=ev.reason;write('error',['Unhandled rejection: '+(r&&r.message||r)]);",
    "  });",
    "})();"
  ].join("\n");

  /* Helpers ---------------------------------------------------------------- */

  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList || []);
  }

  function debounce(fn, wait) {
    var t = null;
    return function () {
      var ctx = this;
      var args = arguments;
      if (t) clearTimeout(t);
      t = setTimeout(function () {
        t = null;
        fn.apply(ctx, args);
      }, wait);
    };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* -------------------------------------------------------------------------
     1) initExamples
     ------------------------------------------------------------------------- */

  function initExamples() {
    var examples = toArray(document.querySelectorAll(".example"));
    examples.forEach(setupExample);

    // Escape collapses any expanded example.
    document.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") return;
      var ex = document.querySelector(".example--expanded");
      if (!ex) return;
      ex.classList.remove("example--expanded");
      document.body.classList.remove("example-lock");
      var btn = ex.querySelector(".expand-btn");
      if (btn) btn.textContent = "Expand";
    });
  }

  function autoGrowEditor(ta) {
    // Grow the textarea to fit its content so no inner scrollbar appears.
    ta.style.height = "auto";
    ta.style.height = (ta.scrollHeight + (ta.offsetHeight - ta.clientHeight)) + "px";
  }

  function paintEditor(ta) {
    if (ta.__hlCode) {
      // Trailing newline keeps the final line rendered during auto-grow.
      ta.__hlCode.innerHTML = highlightSource(ta.__lang, ta.value + "\n");
    }
  }

  function syncEditor(ta) {
    paintEditor(ta);
    autoGrowEditor(ta);
  }

  function setupExample(root) {
    var editors = toArray(root.querySelectorAll("textarea.code"));
    if (!editors.length) return;

    var iframe = root.querySelector("iframe.preview");
    var runBtn = root.querySelector(".run-btn");
    var resetBtn = root.querySelector(".reset-btn");
    var tabWrap = root.querySelector(".editor-tabs");

    // Group editors by language and remember initial values for Reset.
    var byLang = {};
    editors.forEach(function (ta) {
      var lang = (ta.getAttribute("data-lang") || "html").toLowerCase();
      byLang[lang] = ta;
      ta.__initial = ta.value;

      // Build the syntax-highlight overlay: a <pre> painted behind a
      // transparent <textarea>. Both share identical box metrics so the
      // caret lines up over the colored text.
      var wrap = document.createElement("div");
      wrap.className = "code-wrap";
      var pre = document.createElement("pre");
      pre.className = "code-hl";
      pre.setAttribute("aria-hidden", "true");
      var codeEl = document.createElement("code");
      pre.appendChild(codeEl);
      ta.parentNode.insertBefore(wrap, ta);
      wrap.appendChild(pre);
      wrap.appendChild(ta);
      ta.__lang = lang;
      ta.__hlCode = codeEl;
      ta.__hlPre = pre;
    });

    function collect(lang) {
      return byLang[lang] ? byLang[lang].value : "";
    }

    function build() {
      var userHtml = collect("html");
      var userCss = collect("css");
      var userJs = collect("js");
      return (
        "<!doctype html><html><head><meta charset=utf-8><style>" +
        BASE_PREVIEW_CSS +
        userCss +
        "</style></head><body>" +
        userHtml +
        "<script>" +
        CONSOLE_SHIM +
        "\n;try{" +
        userJs +
        "\n}catch(e){console.error(e&&e.message||e);}<\/script>" +
        "</body></html>"
      );
    }

    function run() {
      if (!iframe) return;
      try {
        iframe.srcdoc = build();
      } catch (e) {
        /* no-op: never throw from the runtime */
      }
    }

    // --- Tabbed editors (only when 2+ editors and .editor-tabs present) ---
    if (tabWrap && editors.length >= 2) {
      var tabs = toArray(tabWrap.querySelectorAll(".editor-tab"));

      function selectTab(lang, focus) {
        tabs.forEach(function (tab) {
          var isActive = tab.getAttribute("data-lang") === lang;
          tab.setAttribute("aria-selected", isActive ? "true" : "false");
          tab.tabIndex = isActive ? 0 : -1;
          if (isActive && focus) tab.focus();
        });
        editors.forEach(function (ta) {
          var match = (ta.getAttribute("data-lang") || "") === lang;
          if (match) {
            ta.removeAttribute("hidden");
            syncEditor(ta);
          } else {
            ta.setAttribute("hidden", "");
          }
        });
      }

      tabs.forEach(function (tab, index) {
        tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
        tab.addEventListener("click", function () {
          selectTab(tab.getAttribute("data-lang"), false);
        });
        tab.addEventListener("keydown", function (ev) {
          var dir = 0;
          if (ev.key === "ArrowRight" || ev.key === "ArrowDown") dir = 1;
          else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") dir = -1;
          else if (ev.key === "Home") {
            ev.preventDefault();
            selectTab(tabs[0].getAttribute("data-lang"), true);
            return;
          } else if (ev.key === "End") {
            ev.preventDefault();
            selectTab(tabs[tabs.length - 1].getAttribute("data-lang"), true);
            return;
          } else {
            return;
          }
          ev.preventDefault();
          var next = (index + dir + tabs.length) % tabs.length;
          selectTab(tabs[next].getAttribute("data-lang"), true);
        });
      });

      // Establish initial visible editor from the pre-selected tab.
      var initial = tabs.filter(function (t) {
        return t.getAttribute("aria-selected") === "true";
      })[0] || tabs[0];
      if (initial) selectTab(initial.getAttribute("data-lang"), false);
    }

    // --- Wiring: run / reset / live re-run / keyboard ---------------------
    if (runBtn) {
      runBtn.addEventListener("click", function () {
        run();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        editors.forEach(function (ta) {
          ta.value = ta.__initial;
          syncEditor(ta);
        });
        run();
      });
    }

    var liveRun = debounce(run, 250);

    editors.forEach(function (ta) {
      ta.addEventListener("input", function () {
        syncEditor(ta);
        liveRun();
      });

      // Keep the highlight layer scroll-aligned with the textarea.
      ta.addEventListener("scroll", function () {
        if (ta.__hlPre) {
          ta.__hlPre.scrollTop = ta.scrollTop;
          ta.__hlPre.scrollLeft = ta.scrollLeft;
        }
      });

      ta.addEventListener("keydown", function (ev) {
        // Ctrl/Cmd + Enter => run immediately.
        if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
          ev.preventDefault();
          run();
          return;
        }
        // Plain Enter => newline that keeps the previous line's indent,
        // plus one extra step after an opening bracket.
        if (ev.key === "Enter") {
          ev.preventDefault();
          var s = ta.selectionStart;
          var e = ta.selectionEnd;
          var v = ta.value;
          var lineStart = v.lastIndexOf("\n", s - 1) + 1;
          var indent = (v.slice(lineStart, s).match(/^[ \t]*/) || [""])[0];
          var prevChar = v.slice(0, s).replace(/[ \t]+$/, "").slice(-1);
          var extra = /[{([]/.test(prevChar) ? "  " : "";
          var ins = "\n" + indent + extra;
          ta.value = v.slice(0, s) + ins + v.slice(e);
          ta.selectionStart = ta.selectionEnd = s + ins.length;
          syncEditor(ta);
          liveRun();
          return;
        }
        // Tab inserts two spaces instead of moving focus.
        if (ev.key === "Tab") {
          ev.preventDefault();
          var start = ta.selectionStart;
          var end = ta.selectionEnd;
          var val = ta.value;
          ta.value = val.slice(0, start) + "  " + val.slice(end);
          ta.selectionStart = ta.selectionEnd = start + 2;
          syncEditor(ta);
          liveRun();
        }
      });
    });

    // Paint + size every editor before the first run.
    editors.forEach(syncEditor);

    // Add an Expand toggle for a roomy, IDE-like fullscreen view.
    var actions = root.querySelector(".example-actions");
    if (actions) {
      var expandBtn = document.createElement("button");
      expandBtn.type = "button";
      expandBtn.className = "expand-btn";
      expandBtn.textContent = "Expand";
      actions.appendChild(expandBtn);
      expandBtn.addEventListener("click", function () {
        var on = root.classList.toggle("example--expanded");
        document.body.classList.toggle("example-lock", on);
        expandBtn.textContent = on ? "Collapse" : "Expand";
        editors.forEach(function (ta) {
          if (!ta.hasAttribute("hidden")) syncEditor(ta);
        });
      });
    }

    // Auto-run once on init.
    run();
  }

  /* -------------------------------------------------------------------------
     2) initHighlight — lightweight regex highlighter for pre.code-block
     ------------------------------------------------------------------------- */

  var KEYWORDS = {
    js: [
      "var", "let", "const", "function", "return", "if", "else", "for", "while",
      "do", "switch", "case", "break", "continue", "new", "delete", "typeof",
      "instanceof", "in", "of", "this", "class", "extends", "super", "import",
      "export", "default", "try", "catch", "finally", "throw", "async", "await",
      "yield", "void", "null", "undefined", "true", "false", "static", "get", "set"
    ],
    ts: [
      "var", "let", "const", "function", "return", "if", "else", "for", "while",
      "do", "switch", "case", "break", "continue", "new", "delete", "typeof",
      "instanceof", "in", "of", "this", "class", "extends", "super", "import",
      "export", "default", "try", "catch", "finally", "throw", "async", "await",
      "yield", "void", "null", "undefined", "true", "false", "static", "get", "set",
      "interface", "type", "enum", "namespace", "declare", "readonly", "public",
      "private", "protected", "implements", "abstract", "as", "is", "keyof",
      "infer", "satisfies", "never", "unknown", "any", "string", "number",
      "boolean", "object", "symbol", "bigint"
    ],
    css: [
      "important", "inherit", "initial", "unset", "auto", "none", "flex", "grid",
      "block", "inline", "absolute", "relative", "fixed", "sticky", "hidden",
      "solid", "dashed", "dotted", "transparent", "currentColor"
    ],
    json: ["true", "false", "null"],
    bash: [
      "if", "then", "else", "elif", "fi", "for", "in", "do", "done", "while",
      "case", "esac", "function", "return", "export", "local", "echo", "cd",
      "npm", "npx", "node", "git", "sudo", "cat", "ls", "mkdir", "rm", "cp", "mv"
    ]
  };

  function highlightGeneric(escaped, keywords) {
    // Operates on already HTML-escaped source. Placeholder-protects matched
    // regions so later passes cannot re-tokenize inside them.
    var store = [];
    function stash(cls, text) {
      var token = " " + store.length + " ";
      store.push('<span class="' + cls + '">' + text + "</span>");
      return token;
    }

    var out = escaped;

    // Block comments /* ... */
    out = out.replace(/\/\*[\s\S]*?\*\//g, function (m) {
      return stash("tok-comment", m);
    });
    // Line comments // ... and # ... (bash/json-ish)
    out = out.replace(/\/\/[^\n]*/g, function (m) {
      return stash("tok-comment", m);
    });

    // Strings: double, single, template.
    out = out.replace(/"(?:[^"\\\n]|\\.)*"/g, function (m) {
      return stash("tok-string", m);
    });
    out = out.replace(/'(?:[^'\\\n]|\\.)*'/g, function (m) {
      return stash("tok-string", m);
    });
    out = out.replace(/`(?:[^`\\]|\\.)*`/g, function (m) {
      return stash("tok-string", m);
    });

    // Numbers.
    out = out.replace(/\b(?:0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g, function (m) {
      return stash("tok-number", m);
    });

    // Keywords.
    if (keywords && keywords.length) {
      var kwRe = new RegExp("\\b(" + keywords.join("|") + ")\\b", "g");
      out = out.replace(kwRe, function (m) {
        return stash("tok-keyword", m);
      });
    }

    // Restore placeholders.
    out = out.replace(/ (\d+) /g, function (_, i) {
      return store[Number(i)];
    });
    return out;
  }

  function highlightMarkup(escaped) {
    // For html: comments, tags, attribute strings.
    var store = [];
    function stash(cls, text) {
      var token = " " + store.length + " ";
      store.push('<span class="' + cls + '">' + text + "</span>");
      return token;
    }
    var out = escaped;

    // HTML comments (already escaped: &lt;!-- ... --&gt;)
    out = out.replace(/&lt;!--[\s\S]*?--&gt;/g, function (m) {
      return stash("tok-comment", m);
    });

    // Tags: &lt; optional / tagname ... &gt;
    out = out.replace(/&lt;\/?[a-zA-Z][\w-]*/g, function (m) {
      return stash("tok-keyword", m);
    });

    // Attribute string values.
    out = out.replace(/"(?:[^"\\\n]|\\.)*"/g, function (m) {
      return stash("tok-string", m);
    });
    out = out.replace(/'(?:[^'\\\n]|\\.)*'/g, function (m) {
      return stash("tok-string", m);
    });

    out = out.replace(/ (\d+) /g, function (_, i) {
      return store[Number(i)];
    });
    return out;
  }

  function highlightCss(escaped) {
    var store = [];
    function stash(cls, text) {
      var token = " " + store.length + " ";
      store.push('<span class="' + cls + '">' + text + "</span>");
      return token;
    }
    var out = escaped;

    out = out.replace(/\/\*[\s\S]*?\*\//g, function (m) {
      return stash("tok-comment", m);
    });
    out = out.replace(/"(?:[^"\\\n]|\\.)*"/g, function (m) {
      return stash("tok-string", m);
    });
    out = out.replace(/'(?:[^'\\\n]|\\.)*'/g, function (m) {
      return stash("tok-string", m);
    });
    // Numbers with optional units.
    out = out.replace(/\b\d+\.?\d*(?:px|em|rem|%|vh|vw|s|ms|fr|deg|pt)?\b/g, function (m) {
      return stash("tok-number", m);
    });
    // At-rules and property-ish keywords.
    out = out.replace(/@[a-zA-Z-]+/g, function (m) {
      return stash("tok-keyword", m);
    });
    out = out.replace(/ (\d+) /g, function (_, i) {
      return store[Number(i)];
    });
    return out;
  }

  // Shared entry point: HTML-escape raw source and highlight it by language.
  // Reused by both the static code blocks and the live editor overlays.
  function highlightSource(lang, raw) {
    var escaped = escapeHtml(raw);
    try {
      if (lang === "html") return highlightMarkup(escaped);
      if (lang === "css") return highlightCss(escaped);
      if (lang === "js" || lang === "javascript") return highlightGeneric(escaped, KEYWORDS.js);
      if (lang === "ts" || lang === "typescript") return highlightGeneric(escaped, KEYWORDS.ts);
      if (lang === "json") return highlightGeneric(escaped, KEYWORDS.json);
      if (lang === "bash" || lang === "sh" || lang === "shell") {
        var withHash = escaped.replace(/(^|\n)(\s*#[^\n]*)/g, function (m, p, c) {
          return p + '<span class="tok-comment">' + c + "</span>";
        });
        return highlightGeneric(withHash, KEYWORDS.bash);
      }
      return escaped;
    } catch (e) {
      return escaped; // never break on unmatched input
    }
  }

  function initHighlight() {
    var codes = toArray(document.querySelectorAll("pre.code-block > code"));
    codes.forEach(function (code) {
      var pre = code.parentNode;
      var lang = (pre.getAttribute("data-lang") || "").toLowerCase();
      var raw = code.textContent;
      var escaped = escapeHtml(raw);
      var result;
      try {
        if (lang === "html") {
          result = highlightMarkup(escaped);
        } else if (lang === "css") {
          result = highlightCss(escaped);
        } else if (lang === "js" || lang === "ts" || lang === "javascript" || lang === "typescript") {
          result = highlightGeneric(escaped, KEYWORDS[lang === "javascript" ? "js" : lang === "typescript" ? "ts" : lang]);
        } else if (lang === "json") {
          result = highlightGeneric(escaped, KEYWORDS.json);
        } else if (lang === "bash" || lang === "sh" || lang === "shell") {
          // Bash line comments start with #.
          var pre2 = escaped.replace(/(^|\n)(\s*#[^\n]*)/g, function (m, p, c) {
            return p + '<span class="tok-comment">' + c + "</span>";
          });
          result = highlightGeneric(pre2, KEYWORDS.bash);
        } else {
          result = escaped;
        }
      } catch (e) {
        result = escaped; // never break on unmatched input
      }
      code.innerHTML = result;
    });
  }

  /* -------------------------------------------------------------------------
     3) initTOCSearch
     ------------------------------------------------------------------------- */

  function initTOCSearch() {
    var input = document.getElementById("toc-search");
    var list = document.querySelector(".toc-list");
    if (!input || !list) return;

    var items = toArray(list.querySelectorAll("li"));

    function apply() {
      var q = input.value.trim().toLowerCase();
      items.forEach(function (li) {
        if (!q) {
          li.hidden = false;
          return;
        }
        var text = (li.textContent || "").toLowerCase();
        li.hidden = text.indexOf(q) === -1;
      });
    }

    input.addEventListener("input", apply);
    // Reset the filter if the field is cleared via the native clear button.
    input.addEventListener("search", apply);
  }

  /* -------------------------------------------------------------------------
     4) initTheme
     ------------------------------------------------------------------------- */

  var THEME_KEY = "devdocs-theme";

  function initTheme() {
    var root = document.documentElement;
    var stored = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch (e) {
      stored = null;
    }

    if (stored === "light" || stored === "dark") {
      root.dataset.theme = stored;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.dataset.theme = "dark";
    } else {
      root.dataset.theme = "light";
    }

    var toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* storage may be unavailable; ignore */
      }
    });
  }

  /* -------------------------------------------------------------------------
     5) initScrollSpy
     ------------------------------------------------------------------------- */

  function initScrollSpy() {
    var list = document.querySelector(".toc-list");
    if (!list) return;

    var links = toArray(list.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;

    // Map section id -> toc link.
    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      var section = document.getElementById(id);
      if (section) {
        map[id] = a;
        sections.push(section);
      }
    });
    if (!sections.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        var isActive = a.getAttribute("href") === "#" + id;
        if (isActive) a.classList.add("active");
        else a.classList.remove("active");
      });
    }

    if (!("IntersectionObserver" in window)) {
      // Graceful no-op fallback: mark the first section active.
      setActive(sections[0].id);
      return;
    }

    var visible = {};
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visible[entry.target.id] = entry.intersectionRatio;
          } else {
            delete visible[entry.target.id];
          }
        });
        // Choose the topmost visible section (in document order).
        var chosen = null;
        for (var i = 0; i < sections.length; i++) {
          if (Object.prototype.hasOwnProperty.call(visible, sections[i].id)) {
            chosen = sections[i].id;
            break;
          }
        }
        if (chosen) setActive(chosen);
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: [0, 0.25, 0.5, 1]
      }
    );

    sections.forEach(function (s) {
      observer.observe(s);
    });
  }

  /* -------------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------------- */

  function boot() {
    initTheme();
    initExamples();
    initHighlight();
    initTOCSearch();
    initScrollSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

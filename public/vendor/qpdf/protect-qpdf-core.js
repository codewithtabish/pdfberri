/* eslint-disable */
/**
 * PDFBerri — Protect PDF runtime (QPDF compiled to WebAssembly).
 * Classic script. Runs inside protect-worker.js (preferred) or on the main thread (fallback).
 * Never logs, stores or returns passwords. Errors are reported as short codes only.
 */
(function (root) {
  "use strict";
  if (root.PdfBerriQpdf) return;

  var GLUE_URL = "/vendor/qpdf/qpdf.js";
  var WASM_URL = "/vendor/qpdf/qpdf.wasm";
  var OWNER_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var FACTORY_NAMES = ["createModule", "Module", "QPDF", "qpdf", "createQpdfModule"];

  var factoryPromise = null;
  var wasmPromise = null;

  function fail(code) {
    var error = new Error(code);
    error.code = code;
    return error;
  }

  function isFn(value) {
    return typeof value === "function";
  }

  function yn(value) {
    return value ? "y" : "n";
  }

  function okExit(code) {
    return code === 0 || code === 3;
  }

  /**
   * Result of `--requires-password`. Native qpdf exits 0 when a password is required (or the supplied
   * one is wrong). The WebAssembly build (qpdf 12.x) instead exits 2 and prints "invalid password".
   * Both forms mean the same thing, so accept either.
   */
  function passwordRequired(res) {
    return res.code === 0 || (res.code === 2 && /invalid password/i.test(res.stderr));
  }

  function mapRuntimeError(error) {
    if (error && error.code) return error;
    var text = String((error && error.message) || error || "");
    if (error instanceof RangeError || /out of memory|oom|cannot enlarge memory|allocation failed|invalid array length/i.test(text)) {
      return fail("out-of-memory");
    }
    return fail("engine-failure");
  }

  function findFactory(before) {
    var fresh = Object.keys(root).filter(function (key) {
      return !before.has(key) && isFn(root[key]);
    });
    var i;
    for (i = 0; i < FACTORY_NAMES.length; i++) {
      if (fresh.indexOf(FACTORY_NAMES[i]) !== -1) return root[FACTORY_NAMES[i]];
    }
    if (fresh.length === 1) return root[fresh[0]];
    for (i = 0; i < FACTORY_NAMES.length; i++) {
      if (isFn(root[FACTORY_NAMES[i]])) return root[FACTORY_NAMES[i]];
    }
    return null;
  }

  function loadGlue() {
    if (factoryPromise) return factoryPromise;
    factoryPromise = new Promise(function (resolve, reject) {
      var before = new Set(Object.keys(root));

      function finish(factory) {
        if (isFn(factory)) resolve(factory);
        else reject(fail("engine-init-failed"));
      }

      if (isFn(root.importScripts)) {
        var shimmed = typeof root.module === "undefined" && typeof root.exports === "undefined";
        try {
          if (shimmed) {
            root.module = { exports: {} };
            root.exports = root.module.exports;
          }
          root.importScripts(GLUE_URL);
          var exported = root.module && root.module.exports;
          finish(isFn(exported) ? exported : findFactory(before));
        } catch (error) {
          reject(fail("engine-init-failed"));
        } finally {
          if (shimmed) {
            try {
              delete root.module;
              delete root.exports;
            } catch (ignore) {}
          }
        }
        return;
      }

      var script = document.createElement("script");
      script.src = GLUE_URL;
      script.async = true;
      script.onload = function () {
        finish(findFactory(before));
      };
      script.onerror = function () {
        script.remove();
        reject(fail("engine-init-failed"));
      };
      document.head.appendChild(script);
    });
    factoryPromise.catch(function () {
      factoryPromise = null;
    });
    return factoryPromise;
  }

  function loadWasm() {
    if (!wasmPromise) {
      wasmPromise = fetch(WASM_URL, { credentials: "same-origin" }).then(function (response) {
        if (!response.ok) throw fail("engine-init-failed");
        return response.arrayBuffer();
      });
      wasmPromise.catch(function () {
        wasmPromise = null;
      });
    }
    return wasmPromise;
  }

  /** A fresh QPDF instance per invocation: qpdf exits the runtime after callMain. */
  function createInstance() {
    return Promise.all([loadGlue(), loadWasm()]).then(function (loaded) {
      var factory = loaded[0];
      var wasmBinary = loaded[1];
      var state = { stdout: [], stderr: [], exitCode: null };
      var options = {
        noInitialRun: true,
        thisProgram: "qpdf",
        wasmBinary: wasmBinary,
        locateFile: function (path) {
          return /\.wasm$/.test(path) ? WASM_URL : path;
        },
        print: function (text) {
          state.stdout.push(String(text));
        },
        printErr: function (text) {
          state.stderr.push(String(text));
        },
        onExit: function (code) {
          state.exitCode = code;
        },
      };
      /*
       * This qpdf.js build hardcodes `console.log.bind(console)` / `console.error.bind(console)`
       * and ignores the print / printErr options. The bindings are created synchronously inside the
       * factory call, so we redirect console.log/error for just that call to capture stdout/stderr.
       */
      var con = root.console;
      var origLog = con.log;
      var origError = con.error;
      var promise;
      try {
        con.log = options.print;
        con.error = options.printErr;
        promise = factory(options);
      } finally {
        con.log = origLog;
        con.error = origError;
      }
      return promise.then(function (qpdf) {
        return { qpdf: qpdf, state: state };
      });
    });
  }

  function run(args, files, outputPath) {
    return createInstance()
      .then(function (instance) {
        var qpdf = instance.qpdf;
        var state = instance.state;
        var paths = [];
        try {
          var i;
          for (i = 0; i < files.length; i++) {
            qpdf.FS.writeFile(files[i].path, files[i].data);
            paths.push(files[i].path);
          }
          var code = null;
          try {
            var returned = qpdf.callMain(args);
            code = typeof returned === "number" ? returned : state.exitCode;
          } catch (error) {
            if (error && typeof error.status === "number") code = error.status;
            else if (state.exitCode !== null) code = state.exitCode;
            else throw error;
          }
          var result = {
            code: code,
            stdout: state.stdout.join("\n"),
            stderr: state.stderr.join("\n"),
            output: null,
          };
          if (outputPath) {
            paths.push(outputPath);
            try {
              var out = qpdf.FS.readFile(outputPath);
              var copy = new Uint8Array(out.length);
              copy.set(out);
              result.output = copy;
            } catch (readError) {
              result.output = null;
            }
          }
          return result;
        } finally {
          for (var j = 0; j < paths.length; j++) {
            try {
              qpdf.FS.unlink(paths[j]);
            } catch (ignore) {}
          }
        }
      })
      .catch(function (error) {
        throw mapRuntimeError(error);
      });
  }

  function parsePageCount(stdout) {
    var parts = String(stdout).trim().split(/\s+/);
    var count = parseInt(parts[parts.length - 1], 10);
    return isFinite(count) && count > 0 ? count : null;
  }

  function pageCountFor(extraArgs, files) {
    return run(extraArgs.concat(["--show-npages", "/input.pdf"]), files).then(function (res) {
      return okExit(res.code) ? parsePageCount(res.stdout) : null;
    });
  }

  function classifyFailure(stderr) {
    var text = String(stderr);
    if (/unsupported|not supported/i.test(text) && /encrypt|security handler/i.test(text)) {
      return "unsupported-encryption";
    }
    return "corrupt";
  }

  function randomOwnerPassword(length) {
    var cryptoApi = root.crypto;
    if (!cryptoApi || !isFn(cryptoApi.getRandomValues)) throw fail("engine-failure");
    var bytes = new Uint8Array(length);
    cryptoApi.getRandomValues(bytes);
    var out = "";
    for (var i = 0; i < length; i++) out += OWNER_ALPHABET.charAt(bytes[i] & 63);
    return out;
  }

  function normalizePermissions(input) {
    var p = input || {};
    return { print: !!p.print, copy: !!p.copy, edit: !!p.edit, annotate: !!p.annotate };
  }

  function buildEncryptArgs(style, user, owner, perm) {
    var options = [
      "--accessibility=y",
      "--extract=" + yn(perm.copy),
      "--print=" + (perm.print ? "full" : "none"),
      "--assemble=" + yn(perm.edit),
      "--annotate=" + yn(perm.annotate),
      "--form=" + yn(perm.annotate),
      "--modify-other=" + yn(perm.edit),
    ];
    if (style === "flags") {
      return ["--encrypt", "--user-password=" + user, "--owner-password=" + owner, "--bits=256"].concat(options, ["--"]);
    }
    return ["--encrypt", user, owner, "256"].concat(options, ["--"]);
  }

  function hasPdfHeader(bytes) {
    return (
      bytes.length > 5 &&
      bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d
    );
  }

  function parseAllowed(text, label) {
    var match = new RegExp(label + "\\s*:\\s*(not allowed|allowed)", "i").exec(text);
    return match ? match[1].toLowerCase() === "allowed" : null;
  }

  function parseEncryption(text, report) {
    var value = String(text);
    if (/\bR\s*=\s*6\b/.test(value) && /AESv3/i.test(value)) report.cipher = "aes-256";
    report.permissions.print = parseAllowed(value, "print high resolution");
    report.permissions.copy = parseAllowed(value, "extract for any purpose");
    report.permissions.edit = parseAllowed(value, "modify other");
    report.permissions.annotate = parseAllowed(value, "modify annotations");
  }

  var api = {
    /** Instantiates QPDF once to prove the environment works. */
    init: function () {
      return run(["--version"], []).then(function (res) {
        if (res.code !== 0 || !/version\s+\d/i.test(res.stdout)) throw fail("engine-init-failed");
        return {};
      }).catch(function (error) {
        throw error && error.code === "out-of-memory" ? error : fail("engine-init-failed");
      });
    },

    inspect: function (payload) {
      var files = [{ path: "/input.pdf", data: new Uint8Array(payload.bytes) }];
      var password = payload.password ? String(payload.password) : "";
      return run(["--requires-password", "/input.pdf"], files).then(function (first) {
        if (passwordRequired(first)) {
          if (!password) return { state: "needs-password", pageCount: null };
          return run(["--password=" + password, "--requires-password", "/input.pdf"], files).then(function (second) {
            if (passwordRequired(second)) return { state: "wrong-password", pageCount: null };
            if (second.code !== 3) return { state: classifyFailure(second.stderr), pageCount: null };
            return pageCountFor(["--password=" + password], files).then(function (count) {
              return count === null
                ? { state: "corrupt", pageCount: null }
                : { state: "unlocked", pageCount: count };
            });
          });
        }
        if (first.code === 3) return { state: "restricted", pageCount: null };
        return pageCountFor([], files).then(function (count) {
          if (count !== null) return { state: "plain", pageCount: count };
          return { state: classifyFailure(first.stderr), pageCount: null };
        });
      });
    },

    protect: function (payload) {
      var files = [{ path: "/input.pdf", data: new Uint8Array(payload.bytes) }];
      var userPassword = String(payload.userPassword || "");
      var existingPassword = payload.existingPassword ? String(payload.existingPassword) : "";
      var perm = normalizePermissions(payload.permissions);
      var owner = randomOwnerPassword(32);

      function attempt(style) {
        var args = [];
        if (existingPassword) args.push("--password=" + existingPassword);
        args.push("/input.pdf");
        args = args.concat(buildEncryptArgs(style, userPassword, owner, perm));
        args.push("/output.pdf");
        return run(args, files, "/output.pdf");
      }

      function succeeded(res) {
        return okExit(res.code) && res.output && res.output.length > 0;
      }

      return attempt("flags")
        .then(function (res) {
          if (succeeded(res)) return res;
          if (/unrecognized|unknown option|invalid option|usage/i.test(res.stderr) && userPassword.charAt(0) !== "-") {
            return attempt("positional");
          }
          return res;
        })
        .then(function (res) {
          if (!succeeded(res) || !hasPdfHeader(res.output)) throw fail("protect-failed");
          return { bytes: res.output.buffer };
        });
    },

    verify: function (payload) {
      var files = [{ path: "/output.pdf", data: new Uint8Array(payload.bytes) }];
      var password = String(payload.password || "");
      var wrong = "x" + password;
      var report = {
        passwordRequired: false,
        wrongPasswordRejected: false,
        correctPasswordOpens: false,
        pageCount: null,
        cipher: "unconfirmed",
        permissions: { print: null, copy: null, edit: null, annotate: null },
      };
      return run(["--requires-password", "/output.pdf"], files)
        .then(function (res) {
          report.passwordRequired = passwordRequired(res);
          return run(["--password=" + wrong, "--requires-password", "/output.pdf"], files);
        })
        .then(function (res) {
          report.wrongPasswordRejected = passwordRequired(res);
          return run(["--password=" + password, "--requires-password", "/output.pdf"], files);
        })
        .then(function (res) {
          report.correctPasswordOpens = res.code === 3;
          if (!report.correctPasswordOpens) return null;
          return pageCountFor(["--password=" + password], files.map(function (f) {
            return { path: "/input.pdf", data: f.data };
          }));
        })
        .then(function (count) {
          report.pageCount = count;
          return run(["--password=" + password, "--show-encryption", "/output.pdf"], files);
        })
        .then(function (res) {
          if (okExit(res.code)) parseEncryption(res.stdout, report);
          return report;
        });
    },
  };

  root.PdfBerriQpdf = api;
})(typeof self !== "undefined" ? self : this);
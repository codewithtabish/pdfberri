/* eslint-disable */
"use strict";

importScripts("/vendor/qpdf/protect-qpdf-core.js");

var ALLOWED = {
  init: true,
  inspect: true,
  protect: true,
  verify: true,
};

function createError(code, message) {
  var error = new Error(message);
  error.code = code;
  return error;
}

function serializeError(error) {
  return {
    name: error && error.name ? String(error.name) : "Error",
    message: error && error.message ? String(error.message) : String(error || "Unknown QPDF error"),
    code: error && error.code ? String(error.code) : "engine-failure",
    stack: error && error.stack ? String(error.stack) : null,
  };
}

// Locate the Emscripten module that exposes FS + callMain.
function findModule(core) {
  var candidates = [
    self.Module,
    core && core.Module,
    core && core.module,
    core && core._module,
    core && core.qpdf,
    core,
  ];
  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    if (c && c.FS && typeof c.callMain === "function") return c;
  }
  return null;
}

// Run qpdf and always return a numeric exit status.
// Depending on the Emscripten build, callMain either returns the status
// or throws an ExitStatus object ({ status }).
function runQpdf(mod, args) {
  try {
    var ret = mod.callMain(args);
    return typeof ret === "number" ? ret : -1; // -1 = status not observable
  } catch (e) {
    if (e && typeof e.status === "number") return e.status;
    if (typeof e === "number") return e;
    throw createError("processing-failed", "qpdf failed to run.");
  }
}

function safeUnlink(mod, path) {
  try {
    mod.FS.unlink(path);
  } catch (e) {
    /* file may not exist */
  }
}

function decrypt(core, payload) {
  var mod = findModule(core);
  if (!mod) {
    throw createError(
      "engine-failure",
      "qpdf module does not expose FS/callMain. Core keys: " + Object.keys(core).join(", ")
    );
  }
  if (!payload || !(payload.bytes instanceof ArrayBuffer)) {
    throw createError("processing-failed", "Missing PDF bytes.");
  }

  var password = typeof payload.password === "string" ? payload.password : "";
  var uid = Date.now() + "-" + Math.floor(Math.random() * 1e9);
  var inputPath = "/unlock-in-" + uid + ".pdf";
  var outputPath = "/unlock-out-" + uid + ".pdf";

  try {
    mod.FS.writeFile(inputPath, new Uint8Array(payload.bytes));

    // Exit codes for --requires-password:
    //   0 = password required, supplied one is wrong
    //   2 = file is not encrypted
    //   3 = encrypted, supplied password is correct
    var check = runQpdf(mod, ["--requires-password", "--password=" + password, inputPath]);

    if (check === 2) {
      throw createError("already-unlocked", "This PDF does not require an opening password.");
    }

    // Arguments are passed as an array: no shell, no interpolation.
    var status = runQpdf(mod, ["--password=" + password, "--decrypt", inputPath, outputPath]);

    var out = null;
    try {
      out = mod.FS.readFile(outputPath);
    } catch (e) {
      out = null;
    }

    if (!out || out.length === 0) {
      if (check === 0) {
        throw createError("invalid-password", "The supplied opening password was rejected.");
      }
      throw createError("processing-failed", "qpdf produced no output (exit " + status + ").");
    }

    // Copy so the transferred buffer is exactly the file (not the WASM heap).
    return { bytes: out.slice().buffer };
  } finally {
    safeUnlink(mod, inputPath);
    safeUnlink(mod, outputPath);
  }
}

self.onmessage = function (event) {
  var data = event.data || {};
  var id = data.id;

  if (typeof id !== "number") return;

  Promise.resolve()
    .then(function () {
      var core = self.PdfBerriQpdf;

      if (!core) {
        throw createError("engine-init-failed", "PdfBerriQpdf is not available in the worker.");
      }

      if (data.type === "decrypt") {
        return decrypt(core, data.payload || {});
      }

      if (typeof data.type !== "string" || !ALLOWED[data.type] || typeof core[data.type] !== "function") {
        throw createError("engine-failure", "Unsupported QPDF operation: " + String(data.type));
      }

      return Promise.resolve(core[data.type](data.payload || {}));
    })
    .then(function (result) {
      var transfer = [];
      if (result && result.bytes instanceof ArrayBuffer) {
        transfer.push(result.bytes);
      }
      self.postMessage({ id: id, ok: true, result: result }, transfer);
    })
    .catch(function (error) {
      var details = serializeError(error);
      self.postMessage({
        id: id,
        ok: false,
        code: details.code,
        message: details.message,
        details: details,
      });
    });
};
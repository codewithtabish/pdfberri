/* eslint-disable */
"use strict";

var BASE = "/vendor/qpdf/";
var stderrLines = [];

function createError(code, message) {
  var error = new Error(message);
  error.code = code;
  return error;
}

function locateFile(path) {
  return /\.wasm$/.test(path) ? BASE + "qpdf.wasm" : BASE + path;
}

function onStdout() {}
function onStderr(line) {
  stderrLines.push(String(line));
}

// Boots the raw Emscripten qpdf module directly (no wrapper).
function bootModule() {
  var before = {};
  Object.getOwnPropertyNames(self).forEach(function (k) {
    before[k] = true;
  });

  var resolveReady;
  var runtimeReady = new Promise(function (resolve) {
    resolveReady = resolve;
  });

  // Preset for classic (non-modularized) builds.
  self.Module = {
    noInitialRun: true,
    locateFile: locateFile,
    print: onStdout,
    printErr: onStderr,
    onRuntimeInitialized: function () {
      resolveReady();
    },
  };

  importScripts(BASE + "qpdf.js");

  // Modularized builds expose a factory function (usually createModule).
  var factory = null;
  var names = ["createModule", "createQpdf", "createQPDF", "QPDF", "qpdf"];
  for (var i = 0; i < names.length; i++) {
    if (typeof self[names[i]] === "function") {
      factory = self[names[i]];
      break;
    }
  }
  if (!factory) {
    Object.getOwnPropertyNames(self).forEach(function (k) {
      if (!factory && !before[k] && typeof self[k] === "function") factory = self[k];
    });
  }

  var opts = {
    noInitialRun: true,
    locateFile: locateFile,
    print: onStdout,
    printErr: onStderr,
  };

  if (factory) {
    return Promise.resolve(factory(opts));
  }

  if (self.Module && typeof self.Module.callMain === "function") {
    if (self.Module.calledRun) return Promise.resolve(self.Module);
    return runtimeReady.then(function () {
      return self.Module;
    });
  }

  var newGlobals = Object.getOwnPropertyNames(self).filter(function (k) {
    return !before[k];
  });
  throw createError(
    "engine-init-failed",
    "Could not find qpdf factory/module in qpdf.js. New globals: " + newGlobals.join(", ")
  );
}

// callMain either returns the exit status or throws an ExitStatus ({ status }).
function runQpdf(mod, args) {
  try {
    var ret = mod.callMain(args);
    return typeof ret === "number" ? ret : 0;
  } catch (e) {
    if (e && typeof e.status === "number") return e.status;
    if (typeof e === "number") return e;
    return -1;
  }
}

function safeUnlink(mod, path) {
  try {
    mod.FS.unlink(path);
  } catch (e) {
    /* may not exist */
  }
}

// The trailer / xref-stream dictionary of an encrypted PDF is stored as plain
// text and always contains "/Encrypt". No marker means no encryption.
function looksEncrypted(u8) {
  var text = new TextDecoder("latin1").decode(u8);
  return text.indexOf("/Encrypt") !== -1;
}

// Cheap structural check so we never hand back a truncated file.
function looksLikeCompletePdf(u8) {
  if (u8.length < 16) return false;
  var head = String.fromCharCode.apply(null, u8.subarray(0, 5));
  if (head !== "%PDF-") return false;
  var tail = String.fromCharCode.apply(
    null,
    u8.subarray(Math.max(0, u8.length - 1024))
  );
  return tail.indexOf("%%EOF") !== -1;
}

async function decrypt(bytes, password) {
  var input = new Uint8Array(bytes);

  if (!looksEncrypted(input)) {
    throw createError("already-unlocked", "This PDF does not require an opening password.");
  }

  var mod;
  try {
    mod = await bootModule();
  } catch (e) {
    if (e && e.code) throw e;
    throw createError("engine-init-failed", "qpdf failed to start: " + (e && e.message ? e.message : "unknown"));
  }

  if (!mod || !mod.FS || typeof mod.callMain !== "function") {
    throw createError(
      "engine-init-failed",
      "qpdf module is missing FS/callMain. Module keys: " + (mod ? Object.keys(mod).slice(0, 40).join(", ") : "none")
    );
  }

  var uid = Date.now() + "-" + Math.floor(Math.random() * 1e9);
  var inputPath = "/unlock-in-" + uid + ".pdf";
  var outputPath = "/unlock-out-" + uid + ".pdf";

  try {
    mod.FS.writeFile(inputPath, input);

    // Single qpdf run only. Arguments are an array: no shell, no interpolation.
    stderrLines = [];
    var status = runQpdf(mod, ["--password=" + password, "--decrypt", inputPath, outputPath]);
    var errText = stderrLines.join(" ").toLowerCase();

    var out = null;
    try {
      out = mod.FS.readFile(outputPath);
    } catch (e) {
      out = null;
    }

    if (!out || out.length === 0) {
      if (errText.indexOf("invalid password") !== -1) {
        throw createError("invalid-password", "The supplied opening password was rejected.");
      }
      if (errText.indexOf("unsupported") !== -1 || errText.indexOf("not supported") !== -1) {
        throw createError("unsupported-encryption", "Unsupported encryption.");
      }
      throw createError("processing-failed", "qpdf produced no output (exit " + status + ").");
    }

    if (!looksLikeCompletePdf(out)) {
      throw createError("processing-failed", "qpdf output is incomplete (exit " + status + ").");
    }

    return out.slice().buffer;
  } finally {
    safeUnlink(mod, inputPath);
    safeUnlink(mod, outputPath);
  }
}

self.onmessage = function (event) {
  var data = event.data || {};
  var id = data.id;
  if (typeof id !== "number") return;

  decrypt(data.bytes, typeof data.password === "string" ? data.password : "")
    .then(function (buffer) {
      self.postMessage({ id: id, ok: true, bytes: buffer }, [buffer]);
    })
    .catch(function (error) {
      self.postMessage({
        id: id,
        ok: false,
        code: error && error.code ? String(error.code) : "processing-failed",
        message: error && error.message ? String(error.message) : "Unknown error",
      });
    });
};
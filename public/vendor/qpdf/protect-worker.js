
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
    message:
      error && error.message
        ? String(error.message)
        : String(error || "Unknown QPDF error"),
    code: error && error.code ? String(error.code) : "engine-failure",
    stack: error && error.stack ? String(error.stack) : null,
  };
}

self.onmessage = function (event) {
  var data = event.data || {};
  var id = data.id;

  if (typeof id !== "number") {
    console.error("[Protect PDF Worker] Invalid request ID:", id);
    return;
  }

  Promise.resolve()
    .then(function () {
      var core = self.PdfBerriQpdf;

      if (!core) {
        throw createError(
          "engine-init-failed",
          "PdfBerriQpdf is not available in the worker."
        );
      }

      if (
        typeof data.type !== "string" ||
        !ALLOWED[data.type] ||
        typeof core[data.type] !== "function"
      ) {
        throw createError(
          "engine-failure",
          "Unsupported QPDF operation: " + String(data.type)
        );
      }

      if (
        data.payload !== undefined &&
        (data.payload === null || typeof data.payload !== "object")
      ) {
        throw createError(
          "engine-failure",
          "Invalid QPDF operation payload."
        );
      }

      console.info(
        "[Protect PDF Worker] Starting operation:",
        data.type
      );

      return Promise.resolve(core[data.type](data.payload || {}));
    })
    .then(function (result) {
      var transfer = [];

      if (result && result.bytes instanceof ArrayBuffer) {
        transfer.push(result.bytes);
      }

      self.postMessage(
        {
          id: id,
          ok: true,
          result: result,
        },
        transfer
      );

      console.info(
        "[Protect PDF Worker] Operation completed:",
        data.type
      );
    })
    .catch(function (error) {
      var details = serializeError(error);

      console.error(
        "[Protect PDF Worker] Operation failed:",
        data.type
      );

      console.error(
        "[Protect PDF Worker] Error details:",
        details
      );

      self.postMessage({
        id: id,
        ok: false,
        code: details.code,
        message: details.message,
        details: details,
      });
    });
};

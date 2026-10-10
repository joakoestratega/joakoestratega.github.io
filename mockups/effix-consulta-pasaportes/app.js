"use strict";
(function () {
  // SHA-256 (solo hace falta la primera palabra de 32 bits para el reto)
  var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  var W = new Int32Array(64);
  function h0(str) {
    var n = str.length, bloques = ((n + 9 + 63) >> 6), m = new Int32Array(bloques * 16), i;
    for (i = 0; i < n; i++) m[i >> 2] |= (str.charCodeAt(i) & 0xff) << (24 - (i & 3) * 8);
    m[n >> 2] |= 0x80 << (24 - (n & 3) * 8);
    m[bloques * 16 - 1] = n * 8;
    var a0 = 0x6a09e667, b0 = 0xbb67ae85 | 0, c0 = 0x3c6ef372, d0 = 0xa54ff53a | 0,
        e0 = 0x510e527f, f0 = 0x9b05688c | 0, g0 = 0x1f83d9ab, k0 = 0x5be0cd19;
    for (var b = 0; b < bloques; b++) {
      for (i = 0; i < 16; i++) W[i] = m[b * 16 + i];
      for (i = 16; i < 64; i++) {
        var x = W[i - 15], y = W[i - 2];
        var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
      }
      var a = a0, bb = b0, c = c0, d = d0, e = e0, f = f0, g = g0, h = k0;
      for (i = 0; i < 64; i++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var t2 = (S0 + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      a0 = (a0 + a) | 0; b0 = (b0 + bb) | 0; c0 = (c0 + c) | 0; d0 = (d0 + d) | 0;
      e0 = (e0 + e) | 0; f0 = (f0 + f) | 0; g0 = (g0 + g) | 0; k0 = (k0 + h) | 0;
    }
    return a0 >>> 0;
  }
  if (typeof window === "undefined") { module.exports = h0; return; }

  function resolver(reto, bits) {
    return new Promise(function (ok) {
      var n = 0, tope = 32 - bits;
      (function tanda() {
        var fin = n + 20000;
        for (; n < fin; n++) if ((h0(reto + ":" + n) >>> tope) === 0) return ok(n);
        setTimeout(tanda, 0);
      })();
    });
  }

  var NOMBRES = {
    black: ["Pasaporte Black", ""],
    vip: ["Pasaporte VIP", ""],
    general: ["Pasaporte General", ""],
    dia: ["Pase de un día", ""]
  };
  var form = document.getElementById("form"), input = document.getElementById("doc"),
      btn = document.getElementById("btn"), out = document.getElementById("resultado");

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function mostrar(nodos) {
    out.replaceChildren.apply(out, nodos);
    out.hidden = false;
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function error(msg) { mostrar([el("p", "error", msg)]); }

  function pintarEncontrado(r) {
    var nodos = [];
    if (r.nombre) nodos.push(el("p", "saludo", "Hola, " + r.nombre));
    nodos.push(el("h2", null, r.total === 1 ? "Tienes 1 entrada" : "Tienes " + r.total + " entradas"));
    r.pasaportes.forEach(function (p) {
      var fila = el("div", "pase pase-" + p.tipo);
      fila.appendChild(el("span", "num", String(p.cantidad)));
      fila.appendChild(el("span", "nom", NOMBRES[p.tipo][0]));
      nodos.push(fila);
    });
    if (r.correos && r.correos.length) {
      var c = el("p", "correo");
      c.appendChild(document.createTextNode(r.correos.length === 1 ? "Tu compra quedó con el correo " : "Tus compras quedaron con los correos "));
      c.appendChild(el("strong", null, r.correos.join(", ")));
      c.appendChild(document.createTextNode(". Búscalo también en spam o promociones."));
      nodos.push(c);
    }
    mostrar(nodos);
  }

  function pintarNada(motivo) {
    var caja = el("div", "nada");
    caja.appendChild(el("h2", null, "No encontramos entradas con ese dato"));
    var ul = el("ul");
    if (motivo === "formato") ul.appendChild(el("li", null, "El dato parece incompleto. Escribe el documento sin puntos ni espacios, o el correo completo."));
    else ul.appendChild(el("li", null, "Revisa que esté bien escrito."));
    ul.appendChild(el("li", null, "Si buscaste con el documento, prueba con tu correo. Y al revés."));
    ul.appendChild(el("li", null, "Si otra persona compró tu entrada o te invitó, prueba con el documento o el correo de esa persona."));
    ul.appendChild(el("li", null, "Si aún no aparece, acércate a la taquilla de La Tiquetera desde el miércoles 14 de octubre con tu documento."));
    caja.appendChild(ul);
    mostrar([caja]);
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var v = input.value.trim(), doc;
    if (v.indexOf("@") >= 0) {
      doc = v.toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(doc)) { input.focus(); return error("Revisa el correo: parece incompleto."); }
    } else {
      doc = v.replace(/[^0-9A-Za-z]/g, "");
      if (doc.length < 4) { input.focus(); return error("Escribe tu documento completo o tu correo."); }
    }
    btn.disabled = true; btn.textContent = "Buscando...";
    // MUESTRA: datos ficticios. La version en vivo consulta el servidor.
    var DEMO = {
      "1111111111": { nombre: "Laura", total: 2, pasaportes: [{ tipo: "general", cantidad: 2 }], correos: ["la•••@gmail.com"] },
      "2222222222": { nombre: "Andrés", total: 4, pasaportes: [{ tipo: "vip", cantidad: 1 }, { tipo: "general", cantidad: 3 }], correos: ["an•••@hotmail.com"] },
      "3333333333": { nombre: "Camila", total: 3, pasaportes: [{ tipo: "black", cantidad: 1 }, { tipo: "vip", cantidad: 2 }], correos: ["ca•••@gmail.com"] },
      "laura@ejemplo.com": "1111111111"
    };
    setTimeout(function () {
      var r = DEMO[doc];
      if (typeof r === "string") r = DEMO[r];
      if (r) pintarEncontrado(r); else pintarNada();
      btn.disabled = false; btn.textContent = "Consultar";
    }, 700);
  });
})();

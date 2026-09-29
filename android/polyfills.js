// Funciones que faltan en navegadores viejos de Android (WebView sin actualizar)
if (!Array.prototype.flat) Object.defineProperty(Array.prototype, 'flat', { configurable: true, writable: true, value: function (d) {
  d = d === undefined ? 1 : Math.floor(d);
  return d < 1 ? Array.prototype.slice.call(this) : Array.prototype.reduce.call(this, function (a, v) { return a.concat(Array.isArray(v) ? v.flat(d - 1) : v); }, []);
} });
if (!Array.prototype.flatMap) Object.defineProperty(Array.prototype, 'flatMap', { configurable: true, writable: true, value: function (f, t) { return Array.prototype.map.call(this, f, t).flat(); } });
if (!Object.fromEntries) Object.fromEntries = function (it) { var o = {}; Array.from(it).forEach(function (p) { o[p[0]] = p[1]; }); return o; };

module.exports = {
  getTk(a) {
    bo = function(a) {
        return function() {
            return a
        }
    };
    co = function(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2);
        d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
        d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
        a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
    }
    return a
    };
    eo = '433186.3509911887';
    if (null !== eo)
        var b = eo;
    else {
        b = bo(String.fromCharCode(84));
        var c = bo(String.fromCharCode(75));
        b = [b(), b()];
        b[1] = c();
        b = (eo = window[b.join(c())] || "") || ""
    }
    var d = bo(String.fromCharCode(116));
    c = bo(String.fromCharCode(107));
    d = [d(), d()];
    d[1] = c();
    c = "&" + d.join("") + "=";
    d = b.split(".");
    b = Number(d[0]) || 0;
    for (var e = [], f = 0, g = 0; g < a.length; g++) {
        var h = a.charCodeAt(g);
        128 > h ? e[f++] = h : (2048 > h ? e[f++] = h >> 6 | 192 : (55296 == (h & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (h = 65536 + ((h & 1023) << 10) + (a.charCodeAt(++g) & 1023),
        e[f++] = h >> 18 | 240,
        e[f++] = h >> 12 & 63 | 128) : e[f++] = h >> 12 | 224,
        e[f++] = h >> 6 & 63 | 128),
        e[f++] = h & 63 | 128)
    }
    a = b;
    for (f = 0; f < e.length; f++)
        a += e[f],
        a = co(a, "+-a^+6");
    a = co(a, "+-3^+b+-f");
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1E6;
    return a.toString() + "." + (a ^ b)
  }
}
function makeDraggable(t) {
    var e, n = t,
        l = a();

    function r() {
        null != (l = a()) && (e = u(n.querySelectorAll("[data-move]")))
    }

    function a() {
        var t = {
            height: n.height.baseVal.value,
            width: n.width.baseVal.value
        };
        return 0 == t.height || 0 == t.width ? (setTimeout(r, 500), null) : t
    }

    function u(t) {
        var e = [];
        for (let l = 0; l < t.length; l++) {
            var n = o(t[l]);
            e.push(n)
        }
        return e
    }

    function o(t) {
        var e = JSON.parse(t.dataset.points);
        null != t.dataset.bargraph && "true" == t.dataset.bargraph && (e = function(t, e) {
            let n = parseFloat(e).toFixed(2) - .05,
                r = [];
            for (let e = 0; e < t.length; e++) r.push({
                X: i(t[e].X, l.width),
                Y: i(t[e].Y, l.height),
                YValues: t[e].YValues,
                XValues: t[e].XValues
            }), r.push({
                X: i(t[e].X, l.width) + n,
                Y: i(t[e].Y, l.height),
                YValues: t[e].YValues,
                XValues: t[e].XValues
            });
            return r
        }(e, i(t.dataset.xgap, l.width)));
        var n = function(t) {
                var e = {
                    moveAlong: null,
                    smoothAlong: null
                };
                let n = null != t && null != t ? t.split(":") : [];
                for (var l = 0; l < n.length; l++) n[l].startsWith("m=") ? e.moveAlong = n[l].replace("m=", "").split(",") : e.smoothAlong = n[l].replace("s=", "").split(",");
                return e
            }(t.dataset.move),
            r = null;
        return null != t.dataset.func && (r = window[t.dataset.func]), {
            moveAlong: n.moveAlong,
            element: t,
            points: s(e),
            function: r,
            smoothAlong: n.smoothAlong,
            X1: i(t.dataset.chartx1, l.width),
            X2: i(t.dataset.chartx2, l.width),
            Y1: i(t.dataset.charty1, l.height),
            Y2: i(t.dataset.charty2, l.height)
        }
    }

    function s(t) {
        for (var e = 0; e < t.length; e++) t[e].X = i(t[e].X, l.width), t[e].Y = i(t[e].Y, l.height);
        return t
    }

    function i(t, e) {
        return (t += "").includes("%") ? e * (parseFloat(t) / 100) : parseFloat(t)
    }

    function h(t) {
        t.preventDefault();
        var l = function(t) {
            var e = n.getScreenCTM();
            t.touches && (t = t.touches[0]);
            return {
                X: (t.clientX - e.e) / e.a,
                Y: (t.clientY - e.f) / e.d
            }
        }(t);
        for (let n = 0; n < e.length; n++) {
            var r = e[n];
            if (!(r.Y1 > l.Y || r.Y2 < l.Y || r.X1 > l.X || r.X2 < l.X)) {
                var a = m(l.X, r.points);
                if (A(t, r, a), c(t, r, l), null != r.function) {
                    var u = [t, r, a];
                    r.function.apply(null, u)
                }
            }
        }
    }

    function m(t, e) {
        return e.reduce((e, n) => {
            let l = Math.abs(e.X - t),
                r = Math.abs(n.X - t);
            return l == r ? e.X > n.X ? e : n : r < l ? n : e
        })
    }

    function A(t, e, n) {
        if (null != e.moveAlong)
            for (let t = 0; t < e.moveAlong.length; t++) "X" == e.moveAlong[t] ? e.element.hasAttribute("cx") ? e.element.setAttribute("cx", n.X) : e.element.hasAttribute("x") ? e.element.setAttribute("X", n.X) : e.element.hasAttribute("x1") && (e.element.setAttribute("x1", n.X), e.element.setAttribute("x2", n.X)) : "Y" == e.moveAlong[t] && (e.element.hasAttribute("cy") ? e.element.setAttribute("cy", n.Y) : e.element.hasAttribute("y") ? e.element.setAttribute("y", n.Y) : e.element.hasAttribute("y1") && (e.element.setAttribute("y1", n.Y), e.element.setAttribute("y2", n.Y)))
    }

    function c(t, e, n) {
        if (null != e.smoothAlong)
            for (let t = 0; t < e.smoothAlong.length; t++) "X" == e.smoothAlong[t] ? e.element.hasAttribute("cx") ? e.element.setAttribute("cx", n.X) : e.element.hasAttribute("x") ? e.element.setAttribute("X", n.X) : e.element.hasAttribute("x1") && (e.element.setAttribute("x1", n.X), e.element.setAttribute("x2", n.X)) : "Y" == e.smoothAlong[t] && (e.element.hasAttribute("cy") ? e.element.setAttribute("cy", n.Y) : e.element.hasAttribute("y") ? e.element.setAttribute("y", n.Y) : e.element.hasAttribute("y1") && (e.element.setAttribute("y1", n.Y), e.element.setAttribute("y2", n.Y)))
    }
    null != l && (e = u(n.querySelectorAll("[data-move]"))), n.addEventListener("mousemove", h), n.addEventListener("touchmove", h), new ResizeObserver(t => {
        r()
    }).observe(n)

}
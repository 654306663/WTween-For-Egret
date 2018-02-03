var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var Tools = (function () {
    function Tools() {
    }
    Tools.Copy = function (o) {
        if (o instanceof Array) {
            var a = [];
            for (var i = 0; i < o.length; ++i) {
                a[i] = Tools.Copy(o[i]);
            }
            return a;
        }
        else if (o instanceof Function) {
            var b = o;
            return b;
        }
        else if (o instanceof Object) {
            var c = {};
            for (var j in o) {
                c[j] = Tools.Copy(o[j]);
            }
            return c;
        }
        else {
            return o;
        }
    };
    return Tools;
}());
__reflect(Tools.prototype, "Tools");

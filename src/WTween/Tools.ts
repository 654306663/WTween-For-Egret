class Tools{
 
    public static Copy (o) {
        if (o instanceof Array) 
        {
            var a = [];
            for (var i = 0; i < o.length; ++i) {
                a[i] = Tools.Copy(o[i]);
            }
            return a;
 
        } 
        else if (o instanceof Function) 
        {
            var b = o;
            return b;
        }  
        else if (o instanceof Object) 
        {
            var c = {}
            for (var j in o) {
                c[j] = Tools.Copy(o[j]);
            }
            return c;
        }
        else 
        {
            return o;
        }
    }
}
enum WTweenType
{
    Linear,
    QuadEaseOut, QuadEaseIn, QuadEaseInOut, QuadEaseOutIn,     
    ExpoEaseOut, ExpoEaseIn, ExpoEaseInOut, ExpoEaseOutIn,
    CubicEaseOut, CubicEaseIn, CubicEaseInOut, CubicEaseOutIn,
    QuartEaseOut, QuartEaseIn, QuartEaseInOut, QuartEaseOutIn,
    QuintEaseOut, QuintEaseIn, QuintEaseInOut, QuintEaseOutIn,
    CircEaseOut, CircEaseIn, CircEaseInOut, CircEaseOutIn,
    SineEaseOut, SineEaseIn, SineEaseInOut, SineEaseOutIn,
    ElasticEaseOut, ElasticEaseIn, ElasticEaseInOut, ElasticEaseOutIn,
    BounceEaseOut, BounceEaseIn, BounceEaseInOut, BounceEaseOutIn,
    BackEaseOut, BackEaseIn, BackEaseInOut, BackEaseOutIn
}
 
class WTweener
{
    public stepBackups = [];
    public step = [];
    public target : any;
    public loop : number;  // -1 无限循环；0 执行一次
    public index : number = 0;
 
    /// <param name="target">动画目标</param>  
    /// <param name="loop">循环次数 -1 无限循环；0 执行一次</param>   
    public get(target : any, loop : number = 0)
    {
        this.target = target;
        this.loop = loop;
        return this;
    }
 
    /// <param name="params">参数 格式为：{x:10,y:20}</param>  
    /// <param name="time">动画时长</param> 
    /// <param name="ease">缓动效果类型</param> 
    public to(params : any, time : number, ease : WTweenType)
    {
        var obj : any = {};
        obj.type = "to";
        obj.startValues = Tools.Copy(params);
        obj.endValues = params;
        obj.endTime = time;
        obj.currentTime = 0;
        obj.ease = ease;
        obj.index = this.index++;
        this.step.push(obj);
        if(this.loop != 0 && this.loop != 1)
            this.stepBackups.push(Tools.Copy(obj));
        return this;
    }
 
    /// <param name="func">方法</param>  
    public call(func)
    {
        var obj : any = {};
        obj.type = "call";
        obj.func = func;
        obj.index = this.index++;
        this.step.push(obj);
        if(this.loop != 0 && this.loop != 1)
            this.stepBackups.push(Tools.Copy(obj));
        return this;
    }
 
    /// <param name="time">动画时长</param> 
    public wait(time : number)
    {
        var obj : any = {};
        obj.type = "wait";
        obj.endTime = time;
        obj.currentTime = 0;
        obj.index = this.index++;
        this.step.push(obj);
        if(this.loop != 0 && this.loop != 1)
            this.stepBackups.push(Tools.Copy(obj));
        return this;
    } 
}
 
class WTween
{ 
    private static tweenTable : Array<WTweener> = new Array();
 
    /// 在Main.ts中初始化后调用该方法给WTween添加心跳
    public static Init()
    {
        egret.startTick(this.Update,this);
    }
 
    public static Play(wTweener : WTweener)
    {
        this.tweenTable.push(wTweener);
    }
 
    public static Stop(wTweener : WTweener) 
    {
        var index = -1;
        for(var i = 0; i < this.tweenTable.length; i++)
        {
            if(this.tweenTable[i] == wTweener)
            {
                index = i;
                break;
            }
        }
        if(index != -1)
            this.tweenTable.splice(index, 1);
    }
 
    private static timeOnEnterFrame:number = 0;
    private static Update(timeStamp:number)
    {        
        var now = timeStamp;
        var time = this.timeOnEnterFrame;
        var pass = now - time;
        this.timeOnEnterFrame = now;
 
        for(var i = 0; i < this.tweenTable.length; i++)
        {
            switch(this.tweenTable[i].step[0]["type"])
            {
                case "to":              
                    if(this.tweenTable[i].step[0]["currentTime"] == 0)
                    {
                        
                        for(var key in this.tweenTable[i].step[0]["startValues"])
                        {
                            this.tweenTable[i].step[0]["startValues"][key] = this.tweenTable[i].target[key];
                            this.tweenTable[i].stepBackups.forEach((value,index,array)=>{
                                if(value["index"] == this.tweenTable[i].step[0]["index"])
                                    this.tweenTable[i].stepBackups[index]["startValues"][key] = this.tweenTable[i].target[key];
                            })
                        }
                    }  
                    if(this.tweenTable[i].step[0]["currentTime"] < this.tweenTable[i].step[0]["endTime"])
                    {
                        this.tweenTable[i].step[0]["currentTime"] += pass;
                        this.DoTween(this.tweenTable[i].target, this.tweenTable[i].step[0])
                    }
                    else
                    {
                        for(var key in this.tweenTable[i].step[0]["endValues"])
                            this.tweenTable[i].target[key] = this.tweenTable[i].step[0]["endValues"][key];
                        this.tweenTable[i].step.shift();
                    }
                break;
                case "call":
                    if(this.tweenTable[i].step[0]["func"] != null)
                        this.tweenTable[i].step[0]["func"].call();
                    this.tweenTable[i].step.shift();
                break;
                case "wait":
                    if(this.tweenTable[i].step[0]["currentTime"] < this.tweenTable[i].step[0]["endTime"])
                        this.tweenTable[i].step[0]["currentTime"] += pass;
                    else
                        this.tweenTable[i].step.shift();
                break;
            }
            if(this.tweenTable[i].step.length == 0)
            {
                if(this.tweenTable[i].loop > 1 || this.tweenTable[i].loop == -1)
                {
                    if(this.tweenTable[i].loop > 1)
                        this.tweenTable[i].loop--;
                    this.tweenTable[i].step = Tools.Copy(this.tweenTable[i].stepBackups);
                    for(var j = 0; j < this.tweenTable[i].stepBackups.length; j++)
                    {
                        if(this.tweenTable[i].stepBackups[j]["type"] == "to")
                        {
                            for(var key in this.tweenTable[i].stepBackups[j]["startValues"])
                            {
                                this.tweenTable[i].target[key] = this.tweenTable[i].stepBackups[j]["startValues"][key];
                            }
                        }
                    }
                }
                else
                    this.Stop(this.tweenTable[i]);
            }
        }
        return true;
    }
    
    private static DoTween(target : any, obj : any)
    {
        for(var key in obj["endValues"])
        {
            var currentValue = 0;
            switch(obj["ease"])
            {
                case WTweenType.Linear:
                    currentValue = this.Linear(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.BackEaseIn:
                    currentValue = this.BackEaseIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.BackEaseInOut:
                    currentValue = this.BackEaseInOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.BackEaseOut:
                    currentValue = this.BackEaseOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.BackEaseOutIn:
                    currentValue = this.BackEaseOutIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.BounceEaseIn:
                    currentValue = this.BounceEaseIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.BounceEaseInOut:
                    currentValue = this.BounceEaseInOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.BounceEaseOut:
                    currentValue = this.BounceEaseOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.BounceEaseOutIn:
                    currentValue = this.BounceEaseOutIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.CircEaseIn:
                    currentValue = this.CircEaseIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.CircEaseInOut:
                    currentValue = this.CircEaseInOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.CircEaseOut:
                    currentValue = this.CircEaseOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.CircEaseOutIn:
                    currentValue = this.CircEaseOutIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.CubicEaseIn:
                    currentValue = this.CubicEaseIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.CubicEaseInOut:
                    currentValue = this.CubicEaseInOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.CubicEaseOut:
                    currentValue = this.CubicEaseOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.CubicEaseOutIn:
                    currentValue = this.CubicEaseOutIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.ElasticEaseIn:
                    currentValue = this.ElasticEaseIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.ElasticEaseInOut:
                    currentValue = this.ElasticEaseInOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.ElasticEaseOut:
                    currentValue = this.ElasticEaseOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.ElasticEaseOutIn:
                    currentValue = this.ElasticEaseOutIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.ExpoEaseIn:
                    currentValue = this.ExpoEaseIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.ExpoEaseInOut:
                    currentValue = this.ExpoEaseInOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.ExpoEaseOut:
                    currentValue = this.ExpoEaseOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.ExpoEaseOutIn:
                    currentValue = this.ExpoEaseOutIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuadEaseIn:
                    currentValue = this.QuadEaseIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuadEaseInOut:
                    currentValue = this.QuadEaseInOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuadEaseOut:
                    currentValue = this.QuadEaseOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuadEaseOutIn:
                    currentValue = this.QuadEaseOutIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuartEaseIn:
                    currentValue = this.QuartEaseIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuartEaseInOut:
                    currentValue = this.QuartEaseInOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuartEaseOut:
                    currentValue = this.QuartEaseOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuartEaseOutIn:
                    currentValue = this.QuartEaseOutIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuintEaseIn:
                    currentValue = this.QuintEaseIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuintEaseInOut:
                    currentValue = this.QuintEaseInOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuintEaseOut:
                    currentValue = this.QuintEaseOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.QuintEaseOutIn:
                    currentValue = this.QuintEaseOutIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.SineEaseIn:
                    currentValue = this.SineEaseIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.SineEaseInOut:
                    currentValue = this.SineEaseInOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.SineEaseOut:
                    currentValue = this.SineEaseOut(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                case WTweenType.SineEaseOutIn:
                    currentValue = this.SineEaseOutIn(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
                default:
                    currentValue = this.Linear(obj["currentTime"], 0, obj["endValues"][key] - obj["startValues"][key], obj["endTime"]);
                    break;
            }
            target[key] = currentValue + obj["startValues"][key];
        }
    }
 
    /// <summary>  
    /// Easing equation function for a simple linear tweening, with no easing.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static Linear(t : number, b : number, c : number, d : number)
    {
        return c * t / d + b;
    }
 
    /// <summary>  
    /// Easing equation function for an exponential (2^t) easing out:   
    /// decelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static ExpoEaseOut(t : number, b : number, c : number, d : number)
    {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    }
 
    /// <summary>  
    /// Easing equation function for an exponential (2^t) easing in:   
    /// accelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static ExpoEaseIn(t : number, b : number, c : number, d : number)
    {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    }
 
    /// <summary>  
    /// Easing equation function for an exponential (2^t) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static ExpoEaseInOut(t : number, b : number, c : number, d : number)
    {
        if (t == 0)
            return b;
 
        if (t == d)
            return b + c;
 
        if ((t /= d / 2) < 1)
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
 
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
 
    /// <summary>  
    /// Easing equation function for an exponential (2^t) easing out/in:   
    /// deceleration until halfway, then acceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static ExpoEaseOutIn(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.ExpoEaseOut(t * 2, b, c / 2, d);
 
        return this.ExpoEaseIn((t * 2) - d, b + c / 2, c / 2, d);
    }
 
    /// <summary>  
    /// Easing equation function for a circular (sqrt(1-t^2)) easing out:   
    /// decelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static CircEaseOut(t : number, b : number, c : number, d : number)
    {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a circular (sqrt(1-t^2)) easing in:   
    /// accelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static CircEaseIn(t : number, b : number, c : number, d : number)
    {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a circular (sqrt(1-t^2)) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static CircEaseInOut(t : number, b : number, c : number, d : number)
    {
        if ((t /= d / 2) < 1)
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
 
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a circular (sqrt(1-t^2)) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static CircEaseOutIn(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.CircEaseOut(t * 2, b, c / 2, d);
 
        return this.CircEaseIn((t * 2) - d, b + c / 2, c / 2, d);
    }
 
    /// <summary>  
    /// Easing equation function for a quadratic (t^2) easing out:   
    /// decelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuadEaseOut(t : number, b : number, c : number, d : number)
    {
        return -c * (t /= d) * (t - 2) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a quadratic (t^2) easing in:   
    /// accelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuadEaseIn(t : number, b : number, c : number, d : number)
    {
        return c * (t /= d) * t + b;
    }
 
    /// <summary>  
    /// Easing equation function for a quadratic (t^2) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuadEaseInOut(t : number, b : number, c : number, d : number)
    {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t + b;
 
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a quadratic (t^2) easing out/in:   
    /// deceleration until halfway, then acceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuadEaseOutIn(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.QuadEaseOut(t * 2, b, c / 2, d);
 
        return this.QuadEaseIn((t * 2) - d, b + c / 2, c / 2, d);
    }
 
    /// <summary>  
    /// Easing equation function for a sinusoidal (sin(t)) easing out:   
    /// decelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static SineEaseOut(t : number, b : number, c : number, d : number)
    {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a sinusoidal (sin(t)) easing in:   
    /// accelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static SineEaseIn(t : number, b : number, c : number, d : number)
    {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    }
 
    /// <summary>  
    /// Easing equation function for a sinusoidal (sin(t)) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static SineEaseInOut(t : number, b : number, c : number, d : number)
    {
        if ((t /= d / 2) < 1)
            return c / 2 * (Math.sin(Math.PI * t / 2)) + b;
 
        return -c / 2 * (Math.cos(Math.PI * --t / 2) - 2) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a sinusoidal (sin(t)) easing in/out:   
    /// deceleration until halfway, then acceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static SineEaseOutIn(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.SineEaseOut(t * 2, b, c / 2, d);
 
        return this.SineEaseIn((t * 2) - d, b + c / 2, c / 2, d);
    }
 
    /// <summary>  
    /// Easing equation function for a cubic (t^3) easing out:   
    /// decelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static CubicEaseOut(t : number, b : number, c : number, d : number)
    {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a cubic (t^3) easing in:   
    /// accelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static CubicEaseIn(t : number, b : number, c : number, d : number)
    {
        return c * (t /= d) * t * t + b;
    }
 
    /// <summary>  
    /// Easing equation function for a cubic (t^3) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static CubicEaseInOut(t : number, b : number, c : number, d : number)
    {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t + b;
 
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a cubic (t^3) easing out/in:   
    /// deceleration until halfway, then acceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static CubicEaseOutIn(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.CubicEaseOut(t * 2, b, c / 2, d);
 
        return this.CubicEaseIn((t * 2) - d, b + c / 2, c / 2, d);
    }
 
    /// <summary>  
    /// Easing equation function for a quartic (t^4) easing out:   
    /// decelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuartEaseOut(t : number, b : number, c : number, d : number)
    {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a quartic (t^4) easing in:   
    /// accelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuartEaseIn(t : number, b : number, c : number, d : number)
    {
        return c * (t /= d) * t * t * t + b;
    }
 
    /// <summary>  
    /// Easing equation function for a quartic (t^4) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuartEaseInOut(t : number, b : number, c : number, d : number)
    {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t * t + b;
 
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a quartic (t^4) easing out/in:   
    /// deceleration until halfway, then acceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuartEaseOutIn(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.QuartEaseOut(t * 2, b, c / 2, d);
 
        return this.QuartEaseIn((t * 2) - d, b + c / 2, c / 2, d);
    } 
 
    /// <summary>  
    /// Easing equation function for a quintic (t^5) easing out:   
    /// decelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuintEaseOut(t : number, b : number, c : number, d : number)
    {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a quintic (t^5) easing in:   
    /// accelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuintEaseIn(t : number, b : number, c : number, d : number)
    {
        return c * (t /= d) * t * t * t * t + b;
    }
 
    /// <summary>  
    /// Easing equation function for a quintic (t^5) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuintEaseInOut(t : number, b : number, c : number, d : number)
    {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a quintic (t^5) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static QuintEaseOutIn(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.QuintEaseOut(t * 2, b, c / 2, d);
        return this.QuintEaseIn((t * 2) - d, b + c / 2, c / 2, d);
    } 
 
    /// <summary>  
    /// Easing equation function for an elastic (exponentially decaying sine wave) easing out:   
    /// decelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static ElasticEaseOut(t : number, b : number, c : number, d : number)
    {
        if ((t /= d) == 1)
            return b + c;
 
        var p = d * 0.3;
        var s = p / 4;
 
        return (c * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
    }
 
    /// <summary>  
    /// Easing equation function for an elastic (exponentially decaying sine wave) easing in:   
    /// accelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static ElasticEaseIn(t : number, b : number, c : number, d : number)
    {
        if ((t /= d) == 1)
            return b + c;
 
        var p = d * 0.3;
        var s = p / 4;
 
        return -(c * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    }
 
    /// <summary>  
    /// Easing equation function for an elastic (exponentially decaying sine wave) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static ElasticEaseInOut(t : number, b : number, c : number, d : number)
    {
        if ((t /= d / 2) == 2)
            return b + c;
 
        var p = d * (0.3 * 1.5);
        var s = p / 4;
 
        if (t < 1)
            return -0.5 * (c * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return c * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    }
 
    /// <summary>  
    /// Easing equation function for an elastic (exponentially decaying sine wave) easing out/in:   
    /// deceleration until halfway, then acceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static ElasticEaseOutIn(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.ElasticEaseOut(t * 2, b, c / 2, d);
        return this.ElasticEaseIn((t * 2) - d, b + c / 2, c / 2, d);
    } 
 
    /// <summary>  
    /// Easing equation function for a bounce (exponentially decaying parabolic bounce) easing out:   
    /// decelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static BounceEaseOut(t : number, b : number, c : number, d : number)
    {
        if ((t /= d) < (1 / 2.75))
            return c * (7.5625 * t * t) + b;
        else if (t < (2 / 2.75))
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        else if (t < (2.5 / 2.75))
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        else
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a bounce (exponentially decaying parabolic bounce) easing in:   
    /// accelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static BounceEaseIn(t : number, b : number, c : number, d : number)
    {
        return c - this.BounceEaseOut(d - t, 0, c, d) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a bounce (exponentially decaying parabolic bounce) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static BounceEaseInOut(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
        else
            return this.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
    }
 
    /// <summary>  
    /// Easing equation function for a bounce (exponentially decaying parabolic bounce) easing out/in:   
    /// deceleration until halfway, then acceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static BounceEaseOutIn(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.BounceEaseOut(t * 2, b, c / 2, d);
        return this.BounceEaseIn((t * 2) - d, b + c / 2, c / 2, d);
    }
 
    /// <summary>  
    /// Easing equation function for a back (overshooting cubic easing: (s+1)*t^3 - s*t^2) easing out:   
    /// decelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static BackEaseOut(t : number, b : number, c : number, d : number)
    {
        return c * ((t = t / d - 1) * t * ((1.70158 + 1) * t + 1.70158) + 1) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a back (overshooting cubic easing: (s+1)*t^3 - s*t^2) easing in:   
    /// accelerating from zero velocity.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static BackEaseIn(t : number, b : number, c : number, d : number)
    {
        return c * (t /= d) * t * ((1.70158 + 1) * t - 1.70158) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a back (overshooting cubic easing: (s+1)*t^3 - s*t^2) easing in/out:   
    /// acceleration until halfway, then deceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static BackEaseInOut(t : number, b : number, c : number, d : number)
    {
        var s = 1.70158;
        if ((t /= d / 2) < 1)
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    }
 
    /// <summary>  
    /// Easing equation function for a back (overshooting cubic easing: (s+1)*t^3 - s*t^2) easing out/in:   
    /// deceleration until halfway, then acceleration.  
    /// </summary>  
    /// <param name="t">Current time in seconds.</param>  
    /// <param name="b">Starting value.</param>  
    /// <param name="c">Final value.</param>  
    /// <param name="d">Duration of animation.</param>  
    /// <returns>The correct value.</returns>  
    public static BackEaseOutIn(t : number, b : number, c : number, d : number)
    {
        if (t < d / 2)
            return this.BackEaseOut(t * 2, b, c / 2, d);
        return this.BackEaseIn((t * 2) - d, b + c / 2, c / 2, d);
    }
}
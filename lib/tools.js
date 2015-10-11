var rnd = function(a, b)
{
    if (b === undefined)
    {
        return Math.floor(Math.random() * a);
    }
    return Math.floor(Math.random() * (b - a)) + a;
};

Array.prototype.randomElement = function()
{
    return this[rnd(this.length)];
};

Array.prototype.clone = function()
{
    return this.slice(0);    
};

var rotclamp = function(r)
{
    while (r >= 2.0 * Math.PI)
    {
        r -= 2.0 * Math.PI;
    }
    while (r <= -2.0 * Math.PI)
    {
        r += 2.0 * Math.PI;
    }
    return r;
}

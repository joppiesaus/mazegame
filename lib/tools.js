var rnd = function(a, b)
{
    if (b === undefined)
    {
        return Math.floor(Math.random() * a);
    }
    return Math.floor(Math.random() * (b - a)) + a;
};

Math.constrain = function(v, min, max)
{
    return Math.max(min, Math.min(v, max));
};

Math.constrainRadius = function(v, r)
{
    return Math.constrain(v, -r, r);
};

Array.prototype.randomElement = function()
{
    return this[rnd(this.length)];
};

Array.prototype.clone = function()
{
    return this.slice(0);
};

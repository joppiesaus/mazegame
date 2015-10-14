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

// Generates a maze.
// Stolen from http://rosettacode.org/wiki/Maze_generation
var generateMaze = function(width, height)
{
    // 1: Start at a random cell
    // 2: Mark the current cell as visited, and get a list of its neighbors.
    //    For each neighbor, starting with a randomly selecter neighbor:
    //        If that neighbor hasn't been visited, remove the wall in between
    //        the cell and the neighbor, and then recurse with that neighbor as
    //        the current cell.

    // Number of openings
    var n = width * height - 1;

    if (n < 0)
    {
        console.alert("Illegal maze dimensions!");
        return;
    }

    var horizontal = [], // Horizontal gaps
        vertical = [], // Vertical gaps
        here = [rnd(width), rnd(height)], // Current cell
        stack = [here], // Last cells
        unvisited = []; // Unvisited cells

    for (var i = 0; i < width + 1; i++)
    {
        horizontal[i] = [], vertical[i] = [];
    }

    for (var i = 0; i < width + 2; i++)
    {
        unvisited[i] = [];
        for (var j = 0; j < height + 1; j++)
        {
            // Mark cells to visit
            unvisited[i].push(i > 0 && i < width + 1 && j > 0 && (i != here[0] + 1 || j != here[1] + 1));
        }
    }

    while (n > 0)
    {
        var neighbors = [
            [here[0] + 1, here[1]],
            [here[0], here[1] + 1],
            [here[0] - 1, here[1]],
            [here[0], here[1] - 1]];

        // Delete visited neighbors
        for (var i = 0; i < neighbors.length; )
        {
            if (unvisited[neighbors[i][0] + 1][neighbors[i][1] + 1])
            {
                i++;
            }
            else
            {
                neighbors.splice(i, 1);
            }
        }

        if (neighbors.length)
        {
            n--;
            var next = neighbors.randomElement();
            unvisited[next[0] + 1][next[1] + 1] = false;

            if (next[0] == here[0])
            {
                horizontal[next[0]][(next[1] + here[1] - 1) / 2] = true;
            }
            else
            {
                vertical[(next[0] + here[0] - 1) / 2][next[1]] = true;
            }

            stack.push(here = next);
        }
        else
        {
            here = stack.pop();
        }
    }

    return { width: width, height: height, horizontal: horizontal, vertical: vertical };
};

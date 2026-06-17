/**
 * Heritage Trail Maze Generator (Fairness Seeded Variant)
 * Generates identical, deterministic algorithmic 2D grids across all users.
 */
window.MazeGenerator = {
    generate: function(level) {
        // Levels 1-5 Scale slowly; Levels 6-10 scale up complexity grid sizes evenly for all
        var width = 5 + Math.floor(level * 1.2);
        var height = 5 + Math.floor(level * 1.2);
        
        if(width % 2 === 0) width++;
        if(height % 2 === 0) height++;

        // Initialize unique seed per level so structures change across levels, but stay identical for all players
        var seed = 2026 + level * 105; 
        function seededRandom() {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        var grid = [];
        for (var y = 0; y < height; y++) {
            grid[y] = [];
            for (var x = 0; x < width; x++) {
                grid[y][x] = 1; 
            }
        }

        var stack = [];
        var current = { x: 1, y: 1 };
        grid[current.y][current.x] = 0; 

        do {
            var neighbors = [];
            var dirs = [
                {x: 0, y: -2}, {x: 0, y: 2},
                {x: -2, y: 0}, {x: 2, y: 0}
            ];

            for(var i=0; i<dirs.length; i++) {
                var nx = current.x + dirs[i].x;
                var ny = current.y + dirs[i].y;
                if(nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && grid[ny][nx] === 1) {
                    neighbors.push({x: nx, y: ny, dir: dirs[i]});
                }
            }

            if (neighbors.length > 0) {
                // Use the seeded randomizer instead of Math.random()
                var randIndex = Math.floor(seededRandom() * neighbors.length);
                var next = neighbors[randIndex];
                grid[current.y + next.dir.y/2][current.x + next.dir.x/2] = 0;
                grid[next.y][next.x] = 0;
                stack.push(current);
                current = { x: next.x, y: next.y };
            } else {
                current = stack.pop();
            }
        } while (stack.length > 0);

        // Deterministic Goal and Spawn coordinates mapping 
        var goalX = width - 2;
        var goalY = height - 2;
        grid[goalY][goalX] = 0; 

        return {
            width: width,
            height: height,
            grid: grid,
            start: { x: 1, y: 1 },
            goal: { x: goalX, y: goalY }
        };
    }
};
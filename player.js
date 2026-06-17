/**
 * Heritage Tracker Coordinate Controller
 * Local client-side orientation matrices for movement verification.
 */
window.PlayerManager = {
    create: function(startX, startZ) {
        return {
            gridX: startX,
            gridZ: startZ,
            position: { x: startX, y: 0, z: startZ },
            type: 'player',
            size: 0.8
        };
    },
    move: function(player, dirX, dirZ, mazeData) {
        var targetX = player.gridX + dirX;
        var targetZ = player.gridZ + dirZ;

        // Collision detection validation constraints check
        if (targetX >= 0 && targetX < mazeData.width && targetZ >= 0 && targetZ < mazeData.height) {
            if (mazeData.grid[targetZ][targetX] === 0) {
                player.gridX = targetX;
                player.gridZ = targetZ;
                player.position.x = targetX;
                player.position.z = targetZ;
                return true;
            }
        }
        return false;
    }
};
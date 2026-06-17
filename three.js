/**
 * Standalone Offline Native Drawing Engine (SONDE)
 * Runs 100% locally with zero dependencies or external downloads.
 */
window.THREE = {
    Scene: function() {
        this.children = [];
        this.add = function(obj) { this.children.push(obj); };
    },
    CanvasRenderer: function() {
        this.domElement = document.createElement('canvas');
        var ctx = this.domElement.getContext('2d');
        
        this.setSize = function(w, h) {
            this.domElement.width = w;
            this.domElement.height = h;
        };
        
        this.render = function(scene, camera) {
            // Background deep blue space color inspired by Sea brand guidelines
            ctx.fillStyle = '#060b19';
            ctx.fillRect(0, 0, this.domElement.width, this.domElement.height);
            
            var cx = this.domElement.width / 2;
            var cy = this.domElement.height / 2;
            var tileSize = 40;
            
            var offsetX = cx - camera.position.x * tileSize;
            var offsetY = cy - camera.position.z * tileSize;
            
            var walls = [];
            var playerObj = null;
            var goalObj = null;
            
            for (var i = 0; i < scene.children.length; i++) {
                var obj = scene.children[i];
                if (obj.type === 'wall') walls.push(obj);
                else if (obj.type === 'player') playerObj = obj;
                else if (obj.type === 'goal') goalObj = obj;
            }
            
            // 1. Draw Goal (Target Destination)
            if (goalObj) {
                var gx = goalObj.position.x * tileSize + offsetX;
                var gy = goalObj.position.z * tileSize + offsetY;
                var pulse = 1 + Math.sin(Date.now() * 0.005) * 0.15;
                
                ctx.save();
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#fe5722';
                ctx.fillStyle = '#fe5722'; // Shopee Orange
                ctx.beginPath();
                ctx.arc(gx, gy, 18 * pulse, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#ffcc80';
                ctx.beginPath();
                ctx.arc(gx, gy, 12 * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            
            // 2. Draw Structural Maze Walls
            for (var j = 0; j < walls.length; j++) {
                var w = walls[j];
                var wx = w.position.x * tileSize + offsetX;
                var wy = w.position.z * tileSize + offsetY;
                
                ctx.fillStyle = w.color || '#0055aa'; // Sea Blue
                ctx.fillRect(wx - tileSize/2 + 2, wy - tileSize/2 + 2, tileSize - 4, tileSize - 4);
                
                ctx.strokeStyle = '#4499ff';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(wx - tileSize/2 + 2, wy - tileSize/2 + 2, tileSize - 4, tileSize - 4);
            }
            
            // 3. Draw Player Character (Low-Poly Jade Moon Rabbit)
            if (playerObj) {
                var px = playerObj.position.x * tileSize + offsetX;
                var py = playerObj.position.z * tileSize + offsetY;
                
                ctx.save();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(px, py + 4, 12, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(px, py - 6, 8, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillRect(px - 5, py - 18, 3, 10);
                ctx.fillRect(px + 2, py - 18, 3, 10);
                
                ctx.fillStyle = '#ff3333'; // Garena Red
                ctx.beginPath();
                ctx.arc(px - 3, py - 6, 1.5, 0, Math.PI * 2);
                ctx.arc(px + 3, py - 6, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        };
    },
    PerspectiveCamera: function() {
        this.position = { x: 0, y: 0, z: 0 };
    }
};
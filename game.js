/**
 * Main Game State Logic Machine
 * Handles tracking metrics and local storage payload array aggregation updates.
 */
(function() {
    var gameState = {
        email: '',
        currentLevel: 1,
        totalTime: 0,
        timerInterval: null,
        mazeData: null,
        player: null,
        scene: null,
        camera: null,
        renderer: null,
        levelStartTimes: [],
        isPaused: false // Pause input engine tracking logic while reading fragments
    };

    // KEEP YOUR COPIED GOOGLE WEB APP DEPLOYMENT URL HERE
    var GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/a/macros/sea.com/s/AKfycbyAudRWqGRL6mGyJEf1JxMUwaMsrxEasq4hlvo3awa3D6FIRu_0KMhWFY_qJZXXf4I6kA/exec";

    var seaValues = [
        "We Serve - Putting our community first",
        "We Adapt - Navigating change with resilience",
        "We Run - Moving with speed and accuracy",
        "We Commit - Staying accountable to our vision",
        "We Humble - Remembering our heritage roots",
        "We Serve - Connecting possibilities through tech",
        "We Adapt - Breaking barriers to optimize access",
        "We Run - Expanding innovative digital reach",
        "We Commit - Powering regional economic growth",
        "We Humble - Assembling united global families"
    ];

    function init() {
        setupEventHandlers();
        fetchGlobalLeaderboard();
    }

    function setupEventHandlers() {
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        document.getElementById('modal-btn').addEventListener('click', advanceStage);
        window.addEventListener('keydown', handleInput);
    }

    function fetchGlobalLeaderboard() {
        if (!GOOGLE_SHEET_WEB_APP_URL || GOOGLE_SHEET_WEB_APP_URL.indexOf("YOUR_") === 0) return;
        
        window.handleLeaderboardResponse = function(data) {
            var tbody = document.querySelector('#global-leaderboard-table tbody');
            if(!tbody) return;
            tbody.innerHTML = '';
            
            var displayLimit = Math.min(data.length, 10); 
            if (displayLimit === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#b0c4de;">No runs logged yet. Be the first!</td></tr>';
                return;
            }
            
            for (var i = 0; i < displayLimit; i++) {
                var displayTime = data[i].formattedTime;
                
                // Fallback catch: If raw text values leak date vectors, recalculate values safely in real-time
                if (displayTime.indexOf("1899") > -1 || displayTime.indexOf("T") > -1 || displayTime.includes(":00.000")) {
                    var totalSeconds = parseInt(data[i].totalTime, 10) || 0;
                    var mins = Math.floor(totalSeconds / 60);
                    var secs = totalSeconds % 60;
                    displayTime = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
                }

                var row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>#${i + 1}</strong></td>
                    <td>${window.UIManager.maskEmail(data[i].email)}</td>
                    <td class="text-orange"><strong>${displayTime}</strong></td>
                `;
                tbody.appendChild(row);
            }
        };

        var script = document.createElement('script');
        script.src = GOOGLE_SHEET_WEB_APP_URL + (GOOGLE_SHEET_WEB_APP_URL.indexOf('?') >= 0 ? '&' : '?') + 'callback=handleLeaderboardResponse';
        document.body.appendChild(script);
    }

    function handleLogin(e) {
        e.preventDefault();
        var emailInput = document.getElementById('user-email').value;
        if (!emailInput) return;

        gameState.email = emailInput;
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');

        startQuestJourney();
    }

    function startQuestJourney() {
        gameState.currentLevel = 1;
        gameState.totalTime = 0;
        gameState.levelStartTimes = [];
        gameState.isPaused = false;
        
        setup3DEnvironment();
        loadLevel(gameState.currentLevel);
        
        if(gameState.timerInterval) clearInterval(gameState.timerInterval);
        gameState.timerInterval = setInterval(function() {
            if (!gameState.isPaused) {
                gameState.totalTime++;
                document.getElementById('hud-timer').innerText = window.UIManager.formatTime(gameState.totalTime);
            }
        }, 1000);
    }

    function setup3DEnvironment() {
        var container = document.getElementById('canvas-container');
        container.innerHTML = ''; 
        
        gameState.scene = new window.THREE.Scene();
        gameState.camera = new window.THREE.PerspectiveCamera();
        gameState.renderer = new window.THREE.CanvasRenderer();
        
        gameState.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(gameState.renderer.domElement);

        window.addEventListener('resize', function() {
            if (gameState.renderer && gameState.scene && gameState.camera) {
                gameState.renderer.setSize(window.innerWidth, window.innerHeight);
                gameState.renderer.render(gameState.scene, gameState.camera);
            }
        });
    }

    function loadLevel(lvl) {
        gameState.scene.children = [];
        document.getElementById('hud-level').innerText = lvl + "/10";

        gameState.mazeData = window.MazeGenerator.generate(lvl);
        
        var colors = ['#0055aa', '#004488', '#003366', '#0a1c40', '#102850'];
        var lvlColor = colors[(lvl - 1) % colors.length];

        for (var y = 0; y < gameState.mazeData.height; y++) {
            for (var x = 0; x < gameState.mazeData.width; x++) {
                if (gameState.mazeData.grid[y][x] === 1) {
                    gameState.scene.add({
                        position: { x: x, y: 0, z: y },
                        type: 'wall',
                        size: 1,
                        color: lvlColor
                    });
                }
            }
        }

        gameState.scene.add({
            position: { x: gameState.mazeData.goal.x, y: 0, z: gameState.mazeData.goal.y },
            type: 'goal',
            size: 1
        });

        gameState.player = window.PlayerManager.create(gameState.mazeData.start.x, gameState.mazeData.start.y);
        gameState.scene.add(gameState.player);

        updateCameraPosition();
        gameState.renderer.render(gameState.scene, gameState.camera);
        gameState.isPaused = false; 
    }

    function handleInput(e) {
        if (!gameState.player || !gameState.mazeData || gameState.isPaused) return;
        
        var moved = false;
        if (e.key === 'ArrowUp' || e.key === 'w') moved = window.PlayerManager.move(gameState.player, 0, -1, gameState.mazeData);
        if (e.key === 'ArrowDown' || e.key === 's') moved = window.PlayerManager.move(gameState.player, 0, 1, gameState.mazeData);
        if (e.key === 'ArrowLeft' || e.key === 'a') moved = window.PlayerManager.move(gameState.player, -1, 0, gameState.mazeData);
        if (e.key === 'ArrowRight' || e.key === 'd') moved = window.PlayerManager.move(gameState.player, 1, 0, gameState.mazeData);

        if (moved) {
            updateCameraPosition();
            gameState.renderer.render(gameState.scene, gameState.camera);
            checkWinCondition();
        }
    }

    function updateCameraPosition() {
        gameState.camera.position.x = gameState.player.position.x;
        gameState.camera.position.z = gameState.player.position.z;
    }

    function checkWinCondition() {
        if (gameState.player.gridX === gameState.mazeData.goal.x && gameState.player.gridZ === gameState.mazeData.goal.y) {
            handleLevelComplete();
        }
    }

    function handleLevelComplete() {
        gameState.isPaused = true; // Pause running timer metrics immediately
        
        gameState.levelStartTimes.push({
            level: gameState.currentLevel,
            runningTimeSeconds: gameState.totalTime
        });

        var valueText = seaValues[(gameState.currentLevel - 1) % seaValues.length];
        
        document.getElementById('modal-title').innerText = `Stage ${gameState.currentLevel} Conquered!`;
        document.getElementById('modal-text').innerText = `You uncovered a corporate culture milestone: \n\n"${valueText}"`;
        
        if (gameState.currentLevel >= 10) {
            document.getElementById('modal-btn').innerText = "Unlock Moonlight Vault";
        } else {
            document.getElementById('modal-btn').innerText = "Advance to Next Trail";
        }
        
        document.getElementById('level-modal').classList.remove('hidden');
    }

    function advanceStage() {
        document.getElementById('level-modal').classList.add('hidden');
        
        if (gameState.currentLevel >= 10) {
            terminateQuestAndSave();
        } else {
            gameState.currentLevel++;
            loadLevel(gameState.currentLevel);
        }
    }

    function terminateQuestAndSave() {
        clearInterval(gameState.timerInterval);
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('end-screen').classList.remove('hidden');

        var fTime = window.UIManager.formatTime(gameState.totalTime);
        var breakdownStr = gameState.levelStartTimes.map(function(b) {
            return "Lvl " + b.level + ": " + b.runningTimeSeconds + "s";
        }).join(" | ");

        document.getElementById('summary-email').innerText = window.UIManager.maskEmail(gameState.email);
        document.getElementById('summary-time').innerText = fTime;

        if (GOOGLE_SHEET_WEB_APP_URL && GOOGLE_SHEET_WEB_APP_URL.indexOf("YOUR_") !== 0) {
            var form = document.createElement('form');
            form.method = 'POST';
            form.action = GOOGLE_SHEET_WEB_APP_URL;
            form.target = 'hidden_iframe';

            var inputs = {
                email: gameState.email,
                totalTime: gameState.totalTime,
                formattedTime: fTime,
                breakdown: breakdownStr
            };

            for (var key in inputs) {
                if (inputs.hasOwnProperty(key)) {
                    var input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = inputs[key];
                    form.appendChild(input);
                }
            }

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        }
    }

    window.addEventListener('DOMContentLoaded', init);
})();
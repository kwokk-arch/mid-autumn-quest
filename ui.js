/**
 * Single-Page Reactive Interface Module
 * Renders local data structures without server context pipeline connections.
 */
window.UIManager = {
    maskEmail: function(email) {
        if (!email || !email.includes('@')) return 'anonymous@sea.com';
        var parts = email.split('@');
        var name = parts[0];
        var domain = parts[1];
        if (name.length <= 2) {
            return 'xx@' + domain;
        }
        return name.substring(0, 2) + 'xx@' + domain;
    },
    
    formatTime: function(totalSeconds) {
        var mins = Math.floor(totalSeconds / 60);
        var secs = totalSeconds % 60;
        return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    },

    renderLeaderboard: function(scores) {
        var tbody = document.querySelector('#leaderboard-table tbody');
        tbody.innerHTML = '';
        
        // Clamp layout presentation arrays strictly to top 40 items
        var displayLimit = Math.min(scores.length, 40);
        
        if(displayLimit === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#b0c4de;">No records found inside LocalStorage.</td></tr>';
            return;
        }

        for (var i = 0; i < displayLimit; i++) {
            var row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${i + 1}</strong></td>
                <td>${this.maskEmail(scores[i].email)}</td>
                <td>${this.formatTime(scores[i].totalTime)}</td>
                <td><small>${scores[i].date || 'Legacy Run'}</small></td>
            `;
            tbody.appendChild(row);
        }
    }
};
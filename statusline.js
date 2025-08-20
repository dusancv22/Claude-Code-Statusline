#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    try {
        const data = JSON.parse(input);
        
        // Extract model information
        const modelDisplay = data.model.display_name;
        const modelId = data.model.id;
        
        // Determine model emoji
        let modelEmoji = '🤖'; // Default for Sonnet
        if (modelId.toLowerCase().includes('opus')) {
            modelEmoji = '🧠';
        }
        
        const modelInfo = `${modelEmoji} ${modelDisplay}`;
        
        // Get git branch information
        const gitInfo = getGitBranch(data.workspace.current_dir);
        
        // Get session time countdown
        const sessionTime = getSessionCountdown();
        
        // Extract cost information if available
        const costInfo = getCostInfo(data);
        
        // Combine all parts
        const parts = [modelInfo, gitInfo, sessionTime];
        if (costInfo) {
            parts.push(costInfo);
        }
        const statusLine = parts.join(' | ');
        
        console.log(statusLine);
        
    } catch (error) {
        console.log(`🚨 Status Error: ${error.message}`);
    }
});

function getCostInfo(data) {
    try {
        // Check for Claude Code's total_cost_usd field
        if (data.cost && data.cost.total_cost_usd !== undefined) {
            return `💰 $${formatCost(data.cost.total_cost_usd)}`;
        }
        
        return null; // No cost information found
        
    } catch (error) {
        return null; // Silently fail if extraction fails
    }
}

function formatCost(cost) {
    // Format cost to 2-4 decimal places based on size
    if (typeof cost === 'number') {
        if (cost < 0.01) {
            return cost.toFixed(4);
        } else if (cost < 1) {
            return cost.toFixed(3);
        } else {
            return cost.toFixed(2);
        }
    }
    return String(cost);
}


function getGitBranch(currentDir) {
    try {
        // Change to the current directory to check git status
        const gitDir = path.join(currentDir, '.git');
        
        if (!fs.existsSync(gitDir)) {
            return '📂 No Git';
        }
        
        // Try to read the current branch
        const headPath = path.join(gitDir, 'HEAD');
        if (fs.existsSync(headPath)) {
            const headContent = fs.readFileSync(headPath, 'utf8').trim();
            
            if (headContent.startsWith('ref: refs/heads/')) {
                const branchName = headContent.replace('ref: refs/heads/', '');
                return `🌿 ${branchName}`;
            } else if (headContent.length === 40) {
                // Detached HEAD state
                return `🔀 ${headContent.substring(0, 7)}`;
            }
        }
        
        return '📂 No Git';
    } catch (error) {
        return '📂 No Git';
    }
}

function getSessionCountdown() {
    const now = new Date();
    
    try {
        const sessionInfo = getSessionInfo();
        
        if (!sessionInfo || !sessionInfo.currentBlockStart) {
            return '⏳ 5:00';
        }
        
        const fiveHours = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
        const currentBlockStart = new Date(sessionInfo.currentBlockStart);
        
        // Validate that currentBlockStart is a valid date
        if (isNaN(currentBlockStart.getTime())) {
            return '⏳ 5:00';
        }
        
        const elapsed = now - currentBlockStart;
        
        // Calculate which block we should be in based on scheduled 5-hour intervals
        const blockNumber = Math.floor(elapsed / fiveHours);
        const scheduledBlockStart = new Date(currentBlockStart.getTime() + (blockNumber * fiveHours));
        const nextBlockStart = new Date(scheduledBlockStart.getTime() + fiveHours);
        
        // Time remaining in current scheduled block
        const timeRemaining = Math.max(0, nextBlockStart - now);
        
        // Update last activity
        updateSessionInfo({
            currentBlockStart: sessionInfo.currentBlockStart,
            lastActivity: now.toISOString(),
            currentScheduledBlock: blockNumber
        });
        
        // Convert to hours:minutes
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        return `⏳ ${hours}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
        return '⏳ 5:00';
    }
}

function getSessionInfo() {
    const sessionFile = path.join(require('os').homedir(), '.claude-session-time');
    
    try {
        if (fs.existsSync(sessionFile)) {
            const data = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
            
            const now = new Date();
            const lastActivity = new Date(data.lastActivity);
            const fiveHours = 5 * 60 * 60 * 1000;
            const currentBlockStart = new Date(data.currentBlockStart);
            
            // Calculate how much time has passed since the original block start
            const totalElapsed = now - currentBlockStart;
            
            // Determine which block we should be in based on time
            const currentBlockNumber = Math.floor(totalElapsed / fiveHours);
            const lastActiveBlockNumber = data.currentScheduledBlock || 0;
            
            // If we've moved past the last active block by 2+ blocks (meaning user was
            // completely inactive for an entire 5-hour block), reset the session
            if (currentBlockNumber > lastActiveBlockNumber + 1) {
                return startNewSession(sessionFile, now);
            }
            
            return data;
        } else {
            // First time - create session file
            return startNewSession(sessionFile, now);
        }
    } catch (error) {
        // Fallback - start new session
        return startNewSession(sessionFile, now);
    }
}

function startNewSession(sessionFile, now = new Date()) {
    const sessionData = {
        currentBlockStart: now.toISOString(),
        lastActivity: now.toISOString(),
        currentScheduledBlock: 0
    };
    
    try {
        fs.writeFileSync(sessionFile, JSON.stringify(sessionData));
    } catch (e) {
        // If we can't write the file, just continue without persistence
    }
    
    return sessionData;
}

function updateSessionInfo(data) {
    const sessionFile = path.join(require('os').homedir(), '.claude-session-time');
    
    try {
        fs.writeFileSync(sessionFile, JSON.stringify(data));
    } catch (e) {
        // If we can't write the file, just continue without persistence
    }
}
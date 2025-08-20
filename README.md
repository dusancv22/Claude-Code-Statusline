# Claude Code Custom Status Line

A Node.js-based custom status line for Claude Code that displays model information, git branch status, session cost, and a 5-hour countdown timer.

## Overview

This status line provides real-time information about your Claude Code session:

- **Model Display**: Shows current model (Sonnet 🤖 or Opus 🧠) with distinctive emojis
- **Git Branch**: Shows current git branch (🌿 branch-name) or "📂 No Git" if not in a repository
- **Session Timer**: Displays countdown timer (⏳ H:MM) for 5-hour session blocks
- **Session Cost**: Shows current session cost (💰 $X.XX) when available

**Example Output:**
```
🤖 Sonnet | 🌿 main | ⏳ 4:32
🧠 Opus | 📂 No Git | ⏳ 2:15
🤖 Sonnet | 🌿 dev | ⏳ 3:45 | 💰 $0.054
🧠 Opus | 🌿 main | ⏳ 1:30 | 💰 $0.125
🤖 Sonnet | 🌿 main | ⏳ 2:45 | 💰 $0.287
```

## Files

- **`statusline.js`** - Main status line script
- **`settings.json.example`** - Example Claude Code settings configuration
- **`README.md`** - This comprehensive documentation

## Requirements

- **Node.js** (any recent version)
- **Claude Code** with status line support
- **Git** (optional, for branch display)

## Installation

### Quick Install (One-Line)

Clone this repository and run the installer:

**Windows (Command Prompt or PowerShell):**
```cmd
git clone https://github.com/yourusername/claude-code-statusline.git && cd claude-code-statusline && install.bat
```

**macOS/Linux:**
```bash
git clone https://github.com/yourusername/claude-code-statusline.git && cd claude-code-statusline && chmod +x install.sh && ./install.sh
```

**Cross-Platform (Node.js):**
```bash
git clone https://github.com/yourusername/claude-code-statusline.git && cd claude-code-statusline && node install.js
```

### Manual Installation

1. **Copy the Script**
   ```bash
   # Windows
   copy statusline.js %USERPROFILE%\.claude\statusline\statusline.js
   
   # macOS/Linux
   cp statusline.js ~/.claude/statusline/statusline.js
   ```

2. **Configure Claude Code**
   
   Add to `~/.claude/settings.json` (or `%USERPROFILE%\.claude\settings.json` on Windows):
   
   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "node \"~/.claude/statusline/statusline.js\"",
       "padding": 0
     }
   }
   ```
   
   Note: On Windows, use the full path like `"C:\\Users\\YourName\\.claude\\statusline\\statusline.js"`

3. **Restart Claude Code**
   
   The status line will appear at the bottom of your Claude Code interface after restarting.

## How It Works

### Architecture

The status line script receives JSON data via stdin from Claude Code and outputs a formatted string to stdout:

```
JSON Input → statusline.js → Formatted Output → Claude Code UI
```

### Input Data Structure

Claude Code provides contextual information as JSON:

```json
{
  "model": {
    "id": "claude-sonnet-4-20250514",
    "display_name": "Sonnet"
  },
  "workspace": {
    "current_dir": "/path/to/project",
    "project_dir": "/path/to/project"
  },
  "session_id": "abc123...",
  "transcript_path": "/path/to/transcript.json"
}
```

### Component Processing

#### 1. Model Detection
```javascript
const modelId = data.model.id;
let modelEmoji = '🤖'; // Default for Sonnet
if (modelId.toLowerCase().includes('opus')) {
    modelEmoji = '🧠';
}
const modelInfo = `${modelEmoji} ${data.model.display_name}`;
```

#### 2. Git Branch Detection
```javascript
const gitDir = path.join(currentDir, '.git');
if (fs.existsSync(gitDir)) {
    const headContent = fs.readFileSync(path.join(gitDir, 'HEAD'), 'utf8').trim();
    if (headContent.startsWith('ref: refs/heads/')) {
        const branchName = headContent.replace('ref: refs/heads/', '');
        return `🌿 ${branchName}`;
    }
}
return '📂 No Git';
```

#### 3. Session Timer (5-Hour Blocks)
The timer implements scheduled 5-hour session blocks that count down continuously:

```javascript
// Calculate which block we should be in
const blockNumber = Math.floor(elapsed / fiveHours);
const scheduledBlockStart = new Date(currentBlockStart.getTime() + (blockNumber * fiveHours));
const nextBlockStart = new Date(scheduledBlockStart.getTime() + fiveHours);
const timeRemaining = Math.max(0, nextBlockStart - now);
```

## Session Timer Logic

### Block Scheduling

The timer operates on **scheduled 5-hour blocks**, not activity-based timing:

1. **Block 1:** Starts when first used (e.g., 10:00 AM - 3:00 PM)
2. **Block 2:** Automatically starts at 3:00 PM - 8:00 PM
3. **Block 3:** Automatically starts at 8:00 PM - 1:00 AM
4. And so on...

### Key Behaviors

#### Continuous Countdown
- Timer counts down regardless of user activity
- Shows remaining time in current block
- Format: `⏳ H:MM` (hours:minutes)

#### Block Transitions
- Blocks start automatically when previous block ends
- No gap between blocks during continuous use

#### Inactivity Reset
- Timer only resets if user is completely inactive for an **entire 5-hour block**
- Partial activity in a block maintains the schedule

### Example Scenarios

#### Scenario A: Continuous Work
```
User works 10:00 AM - 6:00 PM straight

Block 1: 10:00 AM → 3:00 PM
10:00 AM: ⏳ 5:00 (start)
2:00 PM: ⏳ 1:00
3:00 PM: ⏳ 0:00 (Block 1 ends)

Block 2: 3:00 PM → 8:00 PM
3:00 PM: ⏳ 5:00 (Block 2 starts immediately)
6:00 PM: ⏳ 2:00 (still working)
```

#### Scenario B: Work with Long Break
```
User works 10:00 AM - 3:00 PM, breaks until 7:00 PM

Block 1: 10:00 AM → 3:00 PM
3:00 PM: ⏳ 0:00 (Block 1 ends, user stops)

Block 2: 3:00 PM → 8:00 PM (scheduled but user inactive)
7:00 PM: ⏳ 1:00 (user returns - only 1 hour left!)
8:00 PM: ⏳ 0:00 (Block 2 ends)

Block 3: 8:00 PM → 1:00 AM
8:00 PM: ⏳ 5:00 (Block 3 starts)
```

#### Scenario C: Complete Inactivity Reset
```
User works 10:00 AM - 3:00 PM, then completely inactive until 10:00 PM

Block 1: 10:00 AM → 3:00 PM (active)
Block 2: 3:00 PM → 8:00 PM (completely inactive)

10:00 PM: ⏳ 5:00 (NEW Block 1 starts - schedule reset)
```

### Session Persistence

Session state is stored in `~/.claude-session-time`:

```json
{
  "currentBlockStart": "2025-08-19T10:00:00.000Z",
  "lastActivity": "2025-08-19T14:32:15.123Z",
  "currentScheduledBlock": 0
}
```

**Fields:**
- `currentBlockStart`: When the original Block 1 started
- `lastActivity`: Last time the status line was accessed
- `currentScheduledBlock`: Which block the user was last active in

## Customization

### Model Emojis

To change model emojis, modify the model detection logic:

```javascript
let modelEmoji = '🤖'; // Default for Sonnet
if (modelId.toLowerCase().includes('opus')) {
    modelEmoji = '🧠'; // Opus emoji
}
// Add more models:
if (modelId.toLowerCase().includes('haiku')) {
    modelEmoji = '⚡'; // Haiku emoji
}
```

### Git Branch Display

To customize git branch formatting:

```javascript
// Current format: 🌿 branch-name
return `🌿 ${branchName}`;

// Alternative formats:
return `[${branchName}]`;        // [main]
return `git:${branchName}`;      // git:main
return `${branchName} 🔗`;       // main 🔗
```

### Timer Display

To change timer format:

```javascript
// Current format: ⏳ H:MM
return `⏳ ${hours}:${minutes.toString().padStart(2, '0')}`;

// Alternative formats:
return `${hours}h ${minutes}m remaining`;           // 4h 32m remaining
return `[${hours}:${minutes.toString().padStart(2, '0')}]`;  // [4:32]
return `Time: ${hours}:${minutes.toString().padStart(2, '0')}`; // Time: 4:32
```

### Session Block Duration

To change from 5-hour blocks to different durations:

```javascript
// Current: 5 hours
const fiveHours = 5 * 60 * 60 * 1000;

// Alternative durations:
const threeHours = 3 * 60 * 60 * 1000;    // 3-hour blocks
const oneHour = 1 * 60 * 60 * 1000;       // 1-hour blocks
const thirtyMinutes = 30 * 60 * 1000;     // 30-minute blocks
```

## Troubleshooting

### Status Line Not Appearing

1. **Check Claude Code restart**: Status line only loads after restart
2. **Verify script path**: Ensure the path in settings.json is correct and absolute
3. **Test script manually**:
   ```bash
   echo '{"model":{"id":"claude-sonnet-4","display_name":"Sonnet"},"workspace":{"current_dir":"."}}' | node statusline.js
   ```
   Should output: `🤖 Sonnet | 🌿 main | ⏳ 5:00`

### Timer Shows Wrong Time

1. **Check session file**: `~/.claude-session-time` should exist and contain valid JSON
2. **Reset session**: Delete `~/.claude-session-time` to start fresh
3. **Verify system time**: Ensure your system clock is correct

### Git Branch Not Detected

1. **Verify git repository**: Ensure you're in a valid git repository
2. **Check .git/HEAD**: File should exist and contain branch reference
3. **Test git command**: `git rev-parse --abbrev-ref HEAD` should show branch name

### Script Errors

1. **Check Node.js**: Ensure Node.js is installed and accessible
2. **Verify file permissions**: Script should be readable
3. **Check logs**: Run Claude Code with debug flags to see error messages

### Permission Issues

**Linux/macOS:**
```bash
chmod +x statusline.js
chmod 644 ~/.claude/settings.json
```

**Windows:**
- Ensure Node.js is in your PATH
- Use full paths with proper escaping in settings.json

## Advanced Configuration

### Multiple Status Lines

You can create different status lines for different projects by using project-specific settings:

**Project settings:** `.claude/settings.json` (in project root)
```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"/path/to/project-specific-statusline.js\""
  }
}
```

### Integration with Other Tools

#### With Docker
```bash
# In containerized environment
"command": "docker exec container-name node /app/statusline.js"
```

#### With Remote Development
```bash
# For SSH/remote development
"command": "ssh remote-host 'node /remote/path/statusline.js'"
```

### Performance Optimization

The status line updates frequently, so consider:

1. **Caching expensive operations**:
   ```javascript
   let cachedBranch = null;
   let lastBranchCheck = 0;
   
   function getGitBranch(currentDir) {
       const now = Date.now();
       if (now - lastBranchCheck < 5000 && cachedBranch) {
           return cachedBranch; // Use cache for 5 seconds
       }
       // ... actual branch detection
       lastBranchCheck = now;
       cachedBranch = result;
       return result;
   }
   ```

2. **Minimal file I/O**: Current implementation is already optimized

3. **Error handling**: All errors fall back to default values

## Security Considerations

1. **File permissions**: Session file is created in user's home directory
2. **No network access**: Script operates entirely locally
3. **Input validation**: JSON input is parsed safely with try/catch
4. **Path traversal**: Uses Node.js path.join() for safe path handling

## Contributing

To extend or modify the status line:

1. **Fork the implementation**
2. **Modify `statusline.js`** for your needs
3. **Test thoroughly** with different scenarios
4. **Update documentation** if adding new features

### Development Tips

1. **Test with mock data**:
   ```bash
   echo '{"model":{"id":"test","display_name":"Test"},"workspace":{"current_dir":"."}}' | node statusline.js
   ```

2. **Debug session state**:
   ```bash
   cat ~/.claude-session-time | jq .
   ```

3. **Monitor performance**:
   ```bash
   time echo '{}' | node statusline.js
   ```

## License

This implementation is provided as-is for educational and personal use. Modify and distribute freely.

## Changelog

### v1.1.0 (2025-08-20)
- Added session cost display support (💰 $X.XX)
- Added token usage display (📊 X.XK tokens) 
- Shows both cost AND tokens when both are available
- Smart cost formatting based on amount
- Multiple cost field detection (cost, usage, session, tokens)
- Graceful fallback when cost info unavailable

### v1.0.0 (2025-08-19)
- Initial implementation
- Model detection with emojis (Sonnet 🤖, Opus 🧠)
- Git branch detection with 🌿 emoji
- 5-hour session countdown timer with ⏳ emoji
- Scheduled block system with automatic progression
- Session persistence in `~/.claude-session-time`
- Comprehensive error handling and fallbacks
- Format: `Model | Git | Timer` (e.g., `🤖 Sonnet | 🌿 main | ⏳ 4:32`)

---

*Last updated: 2025-08-20*
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code Status Line - A lightweight Node.js custom status line for Claude Code that displays model type (Sonnet/Opus), git branch status, session cost, and a 5-hour countdown timer. No external dependencies required.

## Architecture

### Core Components

1. **statusline.js** - Main implementation (210 lines) that:
   - Receives JSON input from Claude Code via stdin
   - Extracts model info and determines emoji (🤖 Sonnet, 🧠 Opus)
   - Detects git branch by reading `.git/HEAD` directly (no git command needed)
   - Implements 5-hour scheduled block timer with persistence
   - Displays session cost from `data.cost.total_cost_usd` field
   - Outputs formatted string: `{model} | {git} | {timer} | {cost}`

2. **Session Management** - Uses `~/.claude-session-time` for persistence:
   - Tracks `currentBlockStart`, `lastActivity`, `currentScheduledBlock`
   - Implements scheduled 5-hour blocks (not activity-based)
   - Resets only after complete inactivity for entire block (lines 171-173)
   - Mathematical block scheduling algorithm in `getSessionCountdown()` (lines 105-148)

## Key Implementation Details

### Timer Algorithm
- **Scheduled blocks**: Blocks run on fixed 5-hour intervals from initial start
- **Block progression**: Automatic advancement (Block 1 → Block 2 → Block 3...)
- **Reset logic**: Only resets if user skips entire block (> lastActiveBlock + 1)
- **Time calculation**: Uses mathematical approach to determine current block and remaining time

### Cost Display
- **Source field**: Reads from `data.cost.total_cost_usd` (lines 49-52)
- **Smart formatting** (lines 61-72): 
  - Costs < $0.01 show 4 decimal places
  - Costs < $1 show 3 decimal places  
  - Costs ≥ $1 show 2 decimal places
- **Graceful fallback**: Returns null if field not available

### Error Handling
- All functions have try/catch with graceful fallbacks
- Missing data returns sensible defaults
- Session file write failures are silently handled
- Malformed JSON input displays error status

## Development Commands

### Testing
```bash
# Run comprehensive test suite
node test-statusline.js

# Manual test with mock data
echo '{"model":{"id":"claude-sonnet-4","display_name":"Sonnet"},"workspace":{"current_dir":"."}}' | node statusline.js

# Check session state
cat ~/.claude-session-time | jq .

# Reset session
rm ~/.claude-session-time
```

### Installation
```bash
# Copy to Claude directory
cp statusline.js ~/.claude/statusline.js

# Configure in ~/.claude/settings.json:
{
  "statusLine": {
    "type": "command",
    "command": "node \"/full/path/to/statusline.js\"",
    "padding": 0
  }
}
```

## File Structure
- `statusline.js` - Main implementation (210 lines)
- `test-statusline.js` - Comprehensive test suite (174 lines, 11 test cases including cost/token tests)
- `install.js` - Cross-platform installer script
- `settings.json.example` - Claude Code configuration template
- Documentation: README.md, INSTALL.md, TROUBLESHOOTING.md, PROJECT_OVERVIEW.md, CHANGELOG.md

## Customization Points

### Model Emojis (lines 17-20)
```javascript
let modelEmoji = '🤖'; // Default for Sonnet
if (modelId.toLowerCase().includes('opus')) {
    modelEmoji = '🧠';
}
```

### Timer Duration (line 115)
```javascript
const fiveHours = 5 * 60 * 60 * 1000; // Change multiplier for different durations
```

### Output Format (lines 34-38)
```javascript
const parts = [modelInfo, gitInfo, sessionTime];
if (costInfo) {
    parts.push(costInfo);
}
const statusLine = parts.join(' | ');
```

## Important Notes

- **No external dependencies** - Uses only Node.js built-in modules (fs, path, os)
- **Cross-platform** - Works on Windows, macOS, Linux
- **Performance** - ~50ms execution time, minimal file I/O
- **Session persistence** - File-based in user home directory
- **Git detection** - Direct `.git/HEAD` reading, no external commands
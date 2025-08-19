# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code Status Line - A Node.js custom status line implementation for Claude Code that displays model type (Sonnet/Opus), git branch status, and a 5-hour session countdown timer.

## Architecture

### Core Components

1. **statusline.js** - Main implementation that:
   - Receives JSON input from Claude Code via stdin
   - Extracts model info and determines emoji (🤖 Sonnet, 🧠 Opus)
   - Detects git branch by reading `.git/HEAD` directly
   - Implements 5-hour scheduled block timer with persistence
   - Outputs formatted string: `{model} | {git} | {timer}`

2. **Session Management** - Uses `~/.claude-session-time` for persistence:
   - Tracks `currentBlockStart`, `lastActivity`, `currentScheduledBlock`
   - Implements scheduled 5-hour blocks (not activity-based)
   - Resets only after complete inactivity for entire block
   - Mathematical block scheduling algorithm in `getSessionCountdown()`

## Key Implementation Details

### Timer Algorithm
- **Scheduled blocks**: Blocks run on fixed 5-hour intervals from initial start
- **Block progression**: Automatic advancement (Block 1 → Block 2 → Block 3...)
- **Reset logic**: Only resets if user skips entire block (lines 134-137 in statusline.js)
- **Time calculation**: Uses mathematical approach to determine current block and remaining time

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
- `statusline.js` - Main implementation (174 lines)
- `test-statusline.js` - Test suite with 5 test cases
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

### Timer Duration (line 79)
```javascript
const fiveHours = 5 * 60 * 60 * 1000; // Change multiplier for different durations
```

### Output Format (line 31)
```javascript
const statusLine = `${modelInfo} | ${gitInfo} | ${sessionTime}`;
```

## Important Notes

- **No external dependencies** - Uses only Node.js built-in modules (fs, path, os)
- **Cross-platform** - Works on Windows, macOS, Linux
- **Performance** - ~50ms execution time, minimal file I/O
- **Session persistence** - File-based in user home directory
- **Git detection** - Direct `.git/HEAD` reading, no external commands
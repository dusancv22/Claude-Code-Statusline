# Claude Code Status Line - Project Overview

## Project Summary

A comprehensive Node.js-based custom status line implementation for Claude Code that displays real-time information about the current session, including model type, git repository status, and a sophisticated 5-hour session countdown timer.

## Quick Facts

- **Language:** Node.js (JavaScript)
- **Platform Support:** Windows, macOS, Linux
- **Dependencies:** Node.js runtime only
- **Integration:** Claude Code status line API
- **Session Tracking:** File-based persistence in user home directory

## Key Features

### 🤖 Model Display
- **Sonnet:** 🤖 emoji
- **Opus:** 🧠 emoji
- **Other models:** Default to 🤖 emoji
- **Format:** `{emoji} {display_name}`

### 🌿 Git Integration
- **Active repository:** `🌿 {branch-name}`
- **No repository:** `📂 No Git`
- **Detached HEAD:** `🔀 {commit-hash}`
- **Detection method:** Direct `.git/HEAD` file reading

### ⏳ Session Timer
- **Duration:** 5-hour countdown blocks
- **Format:** `⏳ H:MM` (hours:minutes)
- **Behavior:** Scheduled blocks (not activity-based)
- **Reset logic:** Only after complete inactivity for entire block
- **Persistence:** `~/.claude-session-time`

### Combined Output
```
🤖 Sonnet | 🌿 main | ⏳ 4:32
🧠 Opus | 📂 No Git | ⏳ 2:15
```

## Architecture

```
Claude Code ──→ JSON Input ──→ statusline.js ──→ Formatted String ──→ Claude UI
                    ↓
                Session File
              (~/.claude-session-time)
```

## File Structure

```
statusline/
├── statusline.js              # Main implementation
├── settings.json.example      # Claude Code configuration template
├── test-statusline.js         # Test script for development
├── README.md                  # Comprehensive documentation
├── INSTALL.md                 # Quick installation guide
├── TROUBLESHOOTING.md         # Debugging and problem resolution
├── CHANGELOG.md               # Version history and changes
└── PROJECT_OVERVIEW.md        # This file
```

## Implementation Highlights

### Robust Error Handling
- Graceful fallbacks for all components
- Safe JSON parsing with try/catch
- Default values for missing data
- No crashes on malformed input

### Session Management
- Mathematical block scheduling algorithm
- Activity gap detection for resets
- Atomic file updates for session state
- Cross-platform path handling

### Performance Optimized
- Minimal file I/O operations
- Efficient date calculations
- No external dependencies
- Fast startup (~50ms execution time)

### Cross-Platform Compatibility
- Windows path handling
- Unix-style permissions awareness
- Node.js built-in modules only
- Environment-agnostic design

## Development Workflow

### Testing
```bash
# Quick test
echo '{"model":{"id":"test","display_name":"Test"},"workspace":{"current_dir":"."}}' | node statusline.js

# Comprehensive test suite
node test-statusline.js
```

### Debugging
```bash
# Check session state
cat ~/.claude-session-time | jq .

# Manual session reset
rm ~/.claude-session-time
```

### Installation
```bash
# Copy to user directory
cp statusline.js ~/.claude/statusline.js

# Configure Claude Code
# Edit ~/.claude/settings.json with statusLine configuration

# Restart Claude Code
```

## Session Timer Algorithm

### Block Scheduling Logic
```javascript
// Calculate current block based on time elapsed
const blockNumber = Math.floor(elapsed / fiveHours);
const scheduledBlockStart = new Date(currentBlockStart.getTime() + (blockNumber * fiveHours));
const nextBlockStart = new Date(scheduledBlockStart.getTime() + fiveHours);
const timeRemaining = Math.max(0, nextBlockStart - now);
```

### Reset Conditions
```javascript
// Reset if skipped entire block(s)
if (currentBlockNumber > lastActiveBlockNumber + 1) {
    return startNewSession(sessionFile, now);
}
```

### Timeline Example
```
10:00 AM - Block 1 starts  ⏳ 5:00
3:00 PM  - Block 1 ends    ⏳ 0:00
3:00 PM  - Block 2 starts  ⏳ 5:00  (automatic)
8:00 PM  - Block 2 ends    ⏳ 0:00
```

## Configuration Options

### Claude Code Settings
```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"/path/to/statusline.js\"",
    "padding": 0
  }
}
```

### Customization Points
- **Model emojis:** Lines 17-20 in `statusline.js`
- **Timer duration:** Line 79 (fiveHours constant)
- **Output format:** Line 31 (statusLine template)
- **Git display:** Lines 54-56 (branch formatting)

## Security Considerations

### Data Privacy
- No network communication
- Local file operations only
- User home directory access only
- No sensitive data logging

### File Permissions
- Session file created with user permissions
- Script execution requires read access only
- No elevated privileges needed

### Input Validation
- Safe JSON parsing
- Path traversal prevention
- Type checking for all inputs
- Graceful error handling

## Future Enhancement Ideas

### Features
- Support for additional models (Haiku, etc.)
- Customizable time formats (12/24 hour)
- Project-specific configurations
- Visual themes and color customization
- Integration with external tools

### Technical Improvements
- Caching for expensive operations
- Configurable update intervals
- Plugin architecture for extensions
- Alternative persistence backends

### User Experience
- GUI configuration tool
- Real-time preview mode
- Status line templates
- Better error messages

## Use Cases

### Development Teams
- Track session blocks across team members
- Identify active development periods
- Monitor model usage patterns

### Individual Users
- Manage focused work sessions
- Track time spent in different projects
- Visual feedback for active development

### Educational Settings
- Track student engagement time
- Manage classroom coding sessions
- Monitor break patterns

## Repository Ready

This implementation is designed to be extracted into a standalone repository with:

- ✅ Complete documentation
- ✅ Installation instructions
- ✅ Test suite
- ✅ Troubleshooting guide
- ✅ Example configurations
- ✅ Changelog template
- ✅ Cross-platform compatibility
- ✅ No external dependencies

## Getting Started

1. **Install:** Copy `statusline.js` to desired location
2. **Configure:** Add statusLine section to Claude Code settings
3. **Restart:** Restart Claude Code to load status line
4. **Verify:** Status line should appear at bottom of interface

For detailed instructions, see `INSTALL.md` and `README.md`.

---

*Created: 2025-08-19*  
*Version: 1.0.0*  
*Status: Production Ready*
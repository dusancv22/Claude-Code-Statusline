# Quick Installation Guide

## 1. Copy Files

```bash
# Copy the main script to your preferred location
cp statusline.js ~/.claude/statusline.js

# Make it executable (Linux/macOS only)
chmod +x ~/.claude/statusline.js
```

## 2. Configure Claude Code

Edit `~/.claude/settings.json` (create if it doesn't exist):

```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"/home/username/.claude/statusline.js\"",
    "padding": 0
  }
}
```

**Windows Example:**
```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"C:\\Users\\username\\.claude\\statusline.js\"",
    "padding": 0
  }
}
```

## 3. Test

```bash
# Test the script manually
echo '{"model":{"id":"claude-sonnet-4","display_name":"Sonnet"},"workspace":{"current_dir":"."}}' | node statusline.js

# Expected output: 🤖 Sonnet | 🌿 main | ⏳ 5:00
```

## 4. Restart Claude Code

The status line will appear at the bottom of your interface.

## Quick Customization

### Change Timer Duration
Edit line 79 in `statusline.js`:
```javascript
const fiveHours = 3 * 60 * 60 * 1000; // Change to 3-hour blocks
```

### Add More Models
Edit lines 17-20 in `statusline.js`:
```javascript
if (modelId.toLowerCase().includes('haiku')) {
    modelEmoji = '⚡';
}
```

### Change Format
Edit line 31 in `statusline.js`:
```javascript
const statusLine = `[${modelInfo}] ${gitInfo} (${sessionTime})`;
```

That's it! See `README.md` for comprehensive documentation.
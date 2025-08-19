# Troubleshooting Guide

## Common Issues

### ❌ Status line not appearing

**Symptoms:** Status line doesn't show up after configuration

**Solutions:**
1. **Restart Claude Code** - Status line only loads on startup
2. **Check file path** - Ensure path in settings.json is correct and absolute
3. **Verify Node.js** - Run `node --version` to confirm Node.js is installed
4. **Test script manually:**
   ```bash
   echo '{"model":{"id":"test","display_name":"Test"},"workspace":{"current_dir":"."}}' | node statusline.js
   ```

### ❌ "command not found" error

**Symptoms:** Error about node or script not found

**Solutions:**
1. **Use full path to node:**
   ```json
   "command": "/usr/local/bin/node \"/full/path/to/statusline.js\""
   ```
2. **Check Node.js installation:**
   ```bash
   which node  # Linux/macOS
   where node  # Windows
   ```

### ❌ Timer showing wrong time

**Symptoms:** Timer shows incorrect countdown or weird values

**Solutions:**
1. **Reset session data:**
   ```bash
   rm ~/.claude-session-time  # Linux/macOS
   del "%USERPROFILE%\.claude-session-time"  # Windows
   ```
2. **Check system time** - Ensure your system clock is correct
3. **Verify session file format:**
   ```bash
   cat ~/.claude-session-time | jq .  # Should be valid JSON
   ```

### ❌ Git branch not detected

**Symptoms:** Shows "📂 No Git" even in git repository

**Solutions:**
1. **Verify git repository:**
   ```bash
   git status  # Should not error
   ls -la .git/HEAD  # File should exist
   ```
2. **Check working directory** - Script uses `workspace.current_dir` from Claude
3. **Test git detection:**
   ```bash
   # Run this in your project directory
   node -e "console.log(require('fs').readFileSync('.git/HEAD', 'utf8'))"
   ```

### ❌ Permission denied errors

**Linux/macOS:**
```bash
chmod +x statusline.js
chmod 644 ~/.claude/settings.json
```

**Windows:**
- Run Claude Code as Administrator if needed
- Ensure Node.js is in your PATH

### ❌ Script crashes or shows errors

**Symptoms:** Status line shows error messages or doesn't update

**Solutions:**
1. **Check error output:**
   ```bash
   # Run script manually and check for errors
   echo '{}' | node statusline.js
   ```
2. **Verify file permissions** - Script should be readable
3. **Check Node.js version** - Use Node.js 12+ for best compatibility
4. **Debug with test script:**
   ```bash
   node test-statusline.js
   ```

## Debugging Steps

### 1. Test Basic Functionality

```bash
# Test 1: Basic execution
echo '{}' | node statusline.js
# Expected: Should not crash

# Test 2: With model info
echo '{"model":{"id":"claude-sonnet-4","display_name":"Sonnet"},"workspace":{"current_dir":"."}}' | node statusline.js
# Expected: 🤖 Sonnet | [git-info] | ⏳ [time]
```

### 2. Check Session File

```bash
# Location (Linux/macOS)
ls -la ~/.claude-session-time

# Location (Windows)
dir "%USERPROFILE%\.claude-session-time"

# Content should be valid JSON:
{
  "currentBlockStart": "2025-08-19T10:00:00.000Z",
  "lastActivity": "2025-08-19T14:32:15.123Z",
  "currentScheduledBlock": 0
}
```

### 3. Verify Claude Settings

```bash
# Check settings file exists
ls -la ~/.claude/settings.json

# Validate JSON syntax
cat ~/.claude/settings.json | jq .

# Look for statusLine section:
{
  "statusLine": {
    "type": "command",
    "command": "node \"/full/path/to/statusline.js\"",
    "padding": 0
  }
}
```

### 4. Test Performance

```bash
# Time the execution
time echo '{}' | node statusline.js

# Should complete in under 100ms typically
```

## Advanced Debugging

### Enable Debug Mode

Add debug output to the script temporarily:

```javascript
// Add after line 10 in statusline.js
console.error(`DEBUG: Received data: ${input}`);
console.error(`DEBUG: Current dir: ${data.workspace?.current_dir}`);
console.error(`DEBUG: Model: ${data.model?.display_name}`);
```

### Monitor Session File Changes

```bash
# Linux/macOS - watch session file changes
watch -n 1 'cat ~/.claude-session-time | jq .'

# Windows - use PowerShell
while($true) { Get-Content $env:USERPROFILE\.claude-session-time | ConvertFrom-Json; Start-Sleep 1; Clear-Host }
```

### Check Claude Code Logs

Look for status line related errors in Claude Code's debug output:

```bash
# Run Claude Code with debug flags
claude --debug

# Look for statusLine or hook-related messages
```

## Platform-Specific Issues

### Windows

**Issue:** Path escaping in JSON
```json
// Wrong
"command": "node \"C:\Users\name\statusline.js\""

// Correct
"command": "node \"C:\\Users\\name\\statusline.js\""
```

**Issue:** Node.js not in PATH
```json
"command": "\"C:\\Program Files\\nodejs\\node.exe\" \"C:\\Users\\name\\statusline.js\""
```

### macOS

**Issue:** Gatekeeper blocking execution
```bash
# Remove quarantine attribute
xattr -d com.apple.quarantine statusline.js
```

**Issue:** Node.js path on macOS
```bash
# Check actual Node.js location
which node
# Often: /usr/local/bin/node or /opt/homebrew/bin/node
```

### Linux

**Issue:** Different Node.js locations
```bash
# Common locations
/usr/bin/node
/usr/local/bin/node
/home/user/.nvm/versions/node/v20.0.0/bin/node
```

## Configuration Validation

### Test Settings File

```bash
# Validate JSON syntax
python -m json.tool ~/.claude/settings.json
# or
jq . ~/.claude/settings.json
```

### Test Node.js Script Path

```bash
# Test exact command from settings
node "/full/path/from/settings.json" < test-input.json
```

## Getting Help

### Create Minimal Test Case

If issues persist, create a minimal test:

1. **Create test input file:**
   ```bash
   echo '{"model":{"id":"test","display_name":"Test"},"workspace":{"current_dir":"."}}' > test-input.json
   ```

2. **Test script:**
   ```bash
   node statusline.js < test-input.json
   ```

3. **Share output and error messages**

### Information to Include

When reporting issues, include:

1. **Operating System and version**
2. **Node.js version** (`node --version`)
3. **Claude Code version**
4. **Full error messages**
5. **Contents of settings.json (statusLine section)**
6. **Output of manual test**
7. **Session file contents** (`~/.claude-session-time`)

## Recovery Steps

### Complete Reset

If nothing works, try a complete reset:

```bash
# 1. Remove session data
rm ~/.claude-session-time

# 2. Test script manually
echo '{"model":{"id":"test","display_name":"Test"},"workspace":{"current_dir":"."}}' | node statusline.js

# 3. If that works, check Claude settings
cat ~/.claude/settings.json

# 4. Restart Claude Code
```

### Alternative Implementations

If the Node.js version doesn't work, you can rewrite in other languages:

**Python version:**
```python
#!/usr/bin/env python3
import json, sys, os
data = json.load(sys.stdin)
model = data.get('model', {}).get('display_name', 'Unknown')
print(f"🤖 {model} | Status OK")
```

**Bash version (Linux/macOS):**
```bash
#!/bin/bash
read input
echo "🤖 Status | ⏳ 5:00"
```

---

*If these steps don't resolve your issue, the problem may be with Claude Code itself or system-specific configuration.*
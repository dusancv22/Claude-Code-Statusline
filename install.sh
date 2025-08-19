#!/bin/bash

echo "Installing Claude Code Statusline..."
echo ""

# Create the statusline directory
if [ ! -d "$HOME/.claude/statusline" ]; then
    mkdir -p "$HOME/.claude/statusline"
    echo "Created directory: $HOME/.claude/statusline"
fi

# Copy the statusline.js file
cp statusline.js "$HOME/.claude/statusline/statusline.js"
if [ $? -eq 0 ]; then
    echo "Copied statusline.js to $HOME/.claude/statusline/"
else
    echo "ERROR: Failed to copy statusline.js"
    exit 1
fi

# Check if settings.json exists
if [ ! -f "$HOME/.claude/settings.json" ]; then
    echo "Creating new settings.json..."
    cat > "$HOME/.claude/settings.json" << EOF
{
  "statusLine": {
    "type": "command",
    "command": "node \"$HOME/.claude/statusline/statusline.js\"",
    "padding": 0
  }
}
EOF
    echo "Created settings.json with statusline configuration"
else
    echo ""
    echo "WARNING: settings.json already exists"
    echo "Please manually add the following to your $HOME/.claude/settings.json:"
    echo ""
    echo '  "statusLine": {'
    echo '    "type": "command",'
    echo "    \"command\": \"node \\\"$HOME/.claude/statusline/statusline.js\\\"\","
    echo '    "padding": 0'
    echo '  }'
    echo ""
fi

echo ""
echo "==================================="
echo "Installation complete!"
echo "Please restart Claude Code to see your new statusline."
echo "==================================="
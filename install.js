#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Installing Claude Code Statusline...\n');

const homeDir = os.homedir();
const claudeDir = path.join(homeDir, '.claude');
const statuslineDir = path.join(claudeDir, 'statusline');
const targetFile = path.join(statuslineDir, 'statusline.js');
const settingsFile = path.join(claudeDir, 'settings.json');
const sourceFile = path.join(__dirname, 'statusline.js');

// Step 1: Create directories
try {
    if (!fs.existsSync(claudeDir)) {
        fs.mkdirSync(claudeDir);
        console.log(`✅ Created directory: ${claudeDir}`);
    }
    
    if (!fs.existsSync(statuslineDir)) {
        fs.mkdirSync(statuslineDir);
        console.log(`✅ Created directory: ${statuslineDir}`);
    }
} catch (err) {
    console.error(`❌ Error creating directories: ${err.message}`);
    process.exit(1);
}

// Step 2: Copy statusline.js
try {
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`✅ Copied statusline.js to ${targetFile}`);
} catch (err) {
    console.error(`❌ Error copying statusline.js: ${err.message}`);
    process.exit(1);
}

// Step 3: Handle settings.json
try {
    const statusLineConfig = {
        type: "command",
        command: `node "${targetFile.replace(/\\/g, '\\\\')}"`,
        padding: 0
    };

    if (fs.existsSync(settingsFile)) {
        // Read existing settings
        const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        
        if (settings.statusLine) {
            console.log('\n⚠️  WARNING: statusLine already configured in settings.json');
            console.log('Current configuration:');
            console.log(JSON.stringify(settings.statusLine, null, 2));
            console.log('\nTo update, replace with:');
            console.log(JSON.stringify(statusLineConfig, null, 2));
        } else {
            // Add statusLine configuration
            settings.statusLine = statusLineConfig;
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            console.log('✅ Added statusLine configuration to existing settings.json');
        }
    } else {
        // Create new settings.json
        const settings = { statusLine: statusLineConfig };
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
        console.log(`✅ Created settings.json with statusLine configuration`);
    }
} catch (err) {
    console.error(`\n⚠️  Could not update settings.json: ${err.message}`);
    console.log('\nPlease manually add the following to your settings.json:');
    console.log('\n"statusLine": {');
    console.log('  "type": "command",');
    console.log(`  "command": "node \\"${targetFile.replace(/\\/g, '\\\\')}\\",`);
    console.log('  "padding": 0');
    console.log('}');
}

// Step 4: Success message
console.log('\n' + '='.repeat(50));
console.log('✨ Installation complete!');
console.log('🔄 Please restart Claude Code to see your new statusline');
console.log('='.repeat(50));

// Optional: Test the installation
console.log('\n📋 Testing installation...');
const testInput = JSON.stringify({
    model: { id: "test", display_name: "Test" },
    workspace: { current_dir: process.cwd() }
});

const { spawn } = require('child_process');
const child = spawn('node', [targetFile], { stdio: ['pipe', 'pipe', 'pipe'] });

child.stdout.on('data', (data) => {
    console.log(`✅ Test output: ${data.toString().trim()}`);
});

child.stderr.on('data', (data) => {
    console.error(`⚠️  Test error: ${data.toString().trim()}`);
});

child.stdin.write(testInput);
child.stdin.end();
#!/usr/bin/env node

// Test script for statusline.js
// Usage: node test-statusline.js

const { spawn } = require('child_process');
const path = require('path');

const statuslineScript = path.join(__dirname, 'statusline.js');

console.log('🧪 Testing Claude Code Status Line');
console.log('==================================\n');

const tests = [
    {
        name: 'Sonnet model with git repo',
        input: {
            model: { id: 'claude-sonnet-4-20250514', display_name: 'Sonnet' },
            workspace: { current_dir: '.' }
        }
    },
    {
        name: 'Opus model with git repo',
        input: {
            model: { id: 'claude-opus-4-1', display_name: 'Opus' },
            workspace: { current_dir: '.' }
        }
    },
    {
        name: 'Sonnet model without git',
        input: {
            model: { id: 'claude-sonnet-4-20250514', display_name: 'Sonnet' },
            workspace: { current_dir: '/tmp' }
        }
    },
    {
        name: 'Haiku model (should default to Sonnet emoji)',
        input: {
            model: { id: 'claude-haiku-3', display_name: 'Haiku' },
            workspace: { current_dir: '.' }
        }
    },
    {
        name: 'Edge case: missing model info',
        input: {
            workspace: { current_dir: '.' }
        }
    },
    {
        name: 'With session cost (direct cost field)',
        input: {
            model: { id: 'claude-sonnet-4-20250514', display_name: 'Sonnet' },
            workspace: { current_dir: '.' },
            cost: { session: 0.0542 }
        }
    },
    {
        name: 'With usage cost and tokens (should show both)',
        input: {
            model: { id: 'claude-opus-4-1', display_name: 'Opus' },
            workspace: { current_dir: '.' },
            usage: { cost: 0.125, tokens: { total: 15000 } }
        }
    },
    {
        name: 'With token count only',
        input: {
            model: { id: 'claude-sonnet-4-20250514', display_name: 'Sonnet' },
            workspace: { current_dir: '.' },
            tokens: { input: 5000, output: 2500, total: 7500 }
        }
    },
    {
        name: 'With session cost in session object',
        input: {
            model: { id: 'claude-opus-4-1', display_name: 'Opus' },
            workspace: { current_dir: '.' },
            session: { cost: 0.0089, id: 'test-session' }
        }
    },
    {
        name: 'With large token count (should format as K)',
        input: {
            model: { id: 'claude-sonnet-4-20250514', display_name: 'Sonnet' },
            workspace: { current_dir: '.' },
            token_usage: { total: 125000 }
        }
    },
    {
        name: 'With cost and separate token field (should show both)',
        input: {
            model: { id: 'claude-opus-4-1', display_name: 'Opus' },
            workspace: { current_dir: '.' },
            cost: { session: 0.235 },
            tokens: { input: 80000, output: 45000 }
        }
    }
];

async function runTest(test) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [statuslineScript], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('close', (code) => {
            resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
        });
        
        child.on('error', (err) => {
            reject(err);
        });
        
        // Send test input
        child.stdin.write(JSON.stringify(test.input));
        child.stdin.end();
    });
}

async function runAllTests() {
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        console.log(`${i + 1}. ${test.name}`);
        
        try {
            const result = await runTest(test);
            
            if (result.code === 0) {
                console.log(`   ✅ ${result.stdout}`);
            } else {
                console.log(`   ❌ Exit code: ${result.code}`);
                if (result.stderr) {
                    console.log(`   🔍 Error: ${result.stderr}`);
                }
            }
        } catch (err) {
            console.log(`   💥 Failed to run: ${err.message}`);
        }
        
        console.log('');
    }
    
    console.log('🎯 Expected patterns:');
    console.log('   🤖 Sonnet | 🌿 branch | ⏳ X:XX (for Sonnet in git repo)');
    console.log('   🧠 Opus | 🌿 branch | ⏳ X:XX (for Opus in git repo)');
    console.log('   🤖 Model | 📂 No Git | ⏳ X:XX (for non-git directory)');
    console.log('   🤖 Model | 🌿 branch | ⏳ X:XX | 💰 $X.XX (with cost info)');
    console.log('   🤖 Model | 🌿 branch | ⏳ X:XX | 📊 X.XK tokens (with token count)');
    console.log('');
    
    // Performance test
    console.log('⚡ Performance Test:');
    const start = Date.now();
    await runTest(tests[0]);
    const end = Date.now();
    console.log(`   Execution time: ${end - start}ms`);
    console.log('');
    
    console.log('🔧 To test manually:');
    console.log(`   echo '${JSON.stringify(tests[0].input)}' | node statusline.js`);
}

runAllTests().catch(console.error);
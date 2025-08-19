# Changelog

All notable changes to the Claude Code Status Line project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-19

### Added
- Initial implementation of Claude Code custom status line
- Model detection with distinctive emojis:
  - 🤖 Sonnet model emoji
  - 🧠 Opus model emoji
- Git branch detection with 🌿 emoji
- "📂 No Git" display for non-git directories
- 5-hour session countdown timer with ⏳ emoji
- Scheduled block system (blocks run on schedule, not activity-based)
- Session persistence in `~/.claude-session-time`
- Automatic session reset after complete inactivity for entire block
- Timer format: `H:MM` (hours:minutes, no seconds)
- Status line format: `Model | Git | Timer`
- Comprehensive error handling and fallbacks
- Cross-platform support (Windows, macOS, Linux)

### Technical Details
- Node.js implementation using stdin/stdout communication
- JSON input parsing from Claude Code
- File-system based session persistence
- Git repository detection via `.git/HEAD` file reading
- Mathematical block scheduling algorithm
- Graceful degradation for missing data

### Documentation
- Comprehensive README.md with implementation details
- Quick installation guide (INSTALL.md)  
- Troubleshooting guide (TROUBLESHOOTING.md)
- Example settings configuration
- Test script for development and validation

### Files
- `statusline.js` - Main implementation
- `settings.json.example` - Claude Code configuration template
- `test-statusline.js` - Test script for validation
- Complete documentation suite

## [Unreleased]

### Planned Features
- Support for additional models (Haiku, etc.)
- Customizable time formats
- Alternative block durations
- Performance optimizations
- Integration examples

### Ideas for Future Versions
- Custom emoji configuration
- Project-specific status messages
- Integration with external services
- Visual themes/colors
- Statistics tracking

---

## Template for Future Releases

## [X.Y.Z] - YYYY-MM-DD

### Added
- New features that were added

### Changed
- Changes in existing functionality

### Deprecated
- Features that will be removed in future versions

### Removed
- Features that were removed

### Fixed
- Bug fixes

### Security
- Security improvements
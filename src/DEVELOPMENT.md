# Rosa Plugin Development Guide

## Getting Started

### Prerequisites

- Node.js 16+ installed
- TypeScript knowledge
- Obsidian API familiarity

### Development Setup

1. **Install Dependencies**

   ```powershell
   npm install
   ```

2. **Development Build**

   ```powershell
   npm run dev
   ```

3. **Production Build**

   ```powershell
   npm run build
   ```

### Testing in Obsidian

1. Enable Developer Mode in Obsidian Settings
2. Copy the plugin folder to your vault's `.obsidian/plugins/` directory
3. Enable the plugin in Obsidian's Community Plugins settings

## Architecture Overview

### Core Services

1. **NoteManager** (`src/services/NoteManager.ts`)
   - Template processing
   - Folder management
   - Note formatting
   - Auto-linking

2. **ConversationManager** (`src/services/ConversationManager.ts`)
   - AI conversation persistence
   - Message storage as notes
   - Conversation metadata management

3. **AIService** (`src/services/AIService.ts`)
   - Multi-provider AI integration
   - OpenAI and Anthropic support
   - Response streaming (future)

### User Interface

1. **Main Plugin** (`src/main.ts`)
   - Command registration
   - Settings management
   - Service initialization

2. **Settings Tab** (`src/main.ts`)
   - Configuration UI
   - API key management
   - Folder organization

## Implementation Roadmap

### Phase 1: Foundation ✅

- [x] Core plugin structure
- [x] Settings system
- [x] Basic command framework
- [x] Type definitions

### Phase 2: Note Management (Current Phase)

- [ ] Implement NoteManager service
- [ ] Template system integration
- [ ] Folder auto-creation
- [ ] Note formatting engine

### Phase 3: AI Integration

- [ ] AI service implementation
- [ ] Basic conversation UI
- [ ] Message persistence
- [ ] Error handling

### Phase 4: Advanced Features

- [ ] Smart note processing
- [ ] Auto-linking system
- [ ] Report generation
- [ ] Performance optimization

## Command Structure

### Quick Creation Commands

- `rosa-create-project` - Create new project with template
- `rosa-create-person` - Create person profile
- `rosa-new-thought` - Quick thought capture
- `rosa-create-task` - Task creation with metadata

### AI Commands

- `rosa-start-conversation` - Begin AI chat session
- `rosa-process-note` - AI-powered note enhancement
- `rosa-quick-actions` - Multi-purpose action modal

## Template System

Templates are stored in `src/templates/` and support variable substitution:

### Available Variables

- `{{date}}` - Current date
- `{{time}}` - Current time
- `{{datetime}}` - Full timestamp
- `{{timestamp}}` - ISO timestamp
- Custom variables as defined in template

### Template Files

- `project.md` - Project planning template
- `person.md` - Person profile template
- `thought.md` - Quick thought capture
- `task.md` - Task management template

## AI Integration

### Supported Providers

1. **OpenAI**
   - GPT-4, GPT-3.5 models
   - Streaming responses
   - Function calling (future)

2. **Anthropic**
   - Claude models
   - System prompts
   - Conversation continuity

### Conversation Storage

- Each conversation = folder
- Each message = individual note
- Metadata in frontmatter
- Conversation index in README

## Development Best Practices

### Code Organization

- Service classes for business logic
- Type definitions in `types.ts`
- UI components in `ui/` folder
- Templates in `templates/` folder

### Error Handling

- Graceful degradation
- User-friendly error messages
- Comprehensive logging
- Fallback behaviors

### Performance

- Lazy loading of services
- Efficient file operations
- Minimal DOM manipulation
- Caching where appropriate

## Next Steps

1. **Complete NoteManager Implementation**
   - Template loading and processing
   - Folder creation logic
   - Note formatting rules

2. **Build AI Integration**
   - Provider configuration
   - Message handling
   - Response processing

3. **Create UI Components**
   - Chat interface modal
   - Quick action selector
   - Progress indicators

4. **Testing & Polish**
   - Error scenarios
   - Performance testing
   - User experience improvements

## Contributing

### Pull Request Process

1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit PR with description

### Code Style

- Follow TypeScript best practices
- Use meaningful variable names
- Add JSDoc comments for public methods
- Follow existing patterns

## Troubleshooting

### Common Issues

1. **Plugin not loading**
   - Check console for errors
   - Verify manifest.json syntax
   - Ensure all dependencies installed

2. **AI not responding**
   - Verify API key configuration
   - Check network connectivity
   - Review error logs

3. **Templates not working**
   - Confirm template folder exists
   - Check template syntax
   - Verify variable names

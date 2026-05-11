# UIGen LLM Setup Guide

## Quick Start

### 1. Terminal (OpenCode + Ollama)

```bash
# Connect providers
opencode providers

# Start coding with any model
opencode

# List available models
opencode models
```

### 2. UIGen Web App

```bash
# Default (OpenCode - 75+ models)
npm run dev

# Force specific provider
npm run dev:claude    # Anthropic direct
npm run dev:ollama    # Local models
npm run dev:opencode  # OpenCode routing
```

## Switching Providers

Edit `.env`:
```env
LLM_PROVIDER=opencode    # 175+ models (default)
LLM_PROVIDER=anthropic   # Direct Claude API
LLM_PROVIDER=ollama      # Local models (no costs)
```

## Ollama Setup

```bash
# Install
brew install ollama

# Pull models
ollama pull llama3.2
ollama pull codellama
ollama pull qwen2.5-coder

# Start server
ollama serve

# Or use package script
npm run ollama:start
```

## Available Models

| Provider | Command | Examples |
|----------|---------|----------|
| OpenCode | `opencode models` | 175+ models |
| Anthropic | Direct API | claude-sonnet-4-5, claude-opus-4-5 |
| Ollama | Local | llama3.2, qwen2.5-coder |

## Change Default Model

Edit `opencode.json`:
```json
{
  "model": "openrouter/qwen/qwen3-coder:free"
}
```

Then restart the dev server.

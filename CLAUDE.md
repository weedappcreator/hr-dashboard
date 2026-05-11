# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev server
npm run dev              # Default (uses LLM_PROVIDER from .env)
npm run dev:opencode     # Force OpenCode provider (75+ models)
npm run dev:claude       # Force Anthropic direct API
npm run dev:ollama       # Force Ollama (local models)

# Testing (Vitest)
npm run test             # Run all tests once
npx vitest               # Watch mode (hot reload on file changes)
npx vitest run src/lib/contexts/__tests__/chat-context.test.tsx  # Single file
npx vitest src/components/chat --reporter=verbose               # Pattern match + verbose

# Other
npm run build            # Production build
npm run lint             # ESLint
npm run setup            # Install deps + initialize Prisma DB (generates Prisma client at src/generated/prisma)
npm run db:reset         # Force-reset SQLite database
npm run models           # List all available OpenCode models
npm run dev:daemon       # Background dev server (output → logs.txt)

# Ollama
npm run ollama:start     # Start Ollama server (port 11434)
npm run ollama:pull      # Pull a model (e.g., ollama pull llama3.2)
```

## Architecture

**UIGen** is an AI-powered React component generator. Users chat with Claude, which generates/edits React components via tool calls. Changes apply to an in-memory virtual file system that renders live in a sandboxed iframe.

### Request Flow

1. User submits message in `ChatInterface`
2. `ChatContext` POSTs to `/api/chat/route.ts` with current virtual FS state
3. API calls Claude via Vercel AI SDK `streamText()` with two tools: `str_replace_editor` (create/edit files) and `file_manager` (rename/delete)
4. Tool calls stream back and `FileSystemContext` applies mutations
5. `PreviewFrame` re-renders the updated component via `@babel/standalone` (client-side JSX compilation in a sandboxed iframe)
6. On project save, chat history + serialized FS are persisted to SQLite via Prisma

### Key Abstractions

**`VirtualFileSystem`** (`src/lib/file-system.ts`) — In-memory file tree that serializes to JSON for DB persistence. All file operations go through this class.

**`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — React context wrapping `VirtualFileSystem`, exposing operations to the component tree.

**`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — Manages chat messages and streams AI responses; applies tool call results to `FileSystemContext`.

**Tool system** (`src/lib/tools/`) — `str_replace_editor` and `file_manager` tools given to Claude. They define schemas and handlers that mutate the virtual FS.

**Language model provider** (`src/lib/provider.ts`) — Selects provider based on `LLM_PROVIDER` env var. Falls back through OpenCode → Anthropic → Ollama → `MockLanguageModel` (static demo responses) if a provider is unavailable.

**System prompt** (`src/lib/prompts/generation.tsx`) — The prompt given to Claude for component generation.

### Auth

JWT tokens in httpOnly cookies (7-day expiry). `src/middleware.ts` protects `/api/projects` and `/api/filesystem`; `/api/chat` is public. `src/actions/index.ts` has server actions for login/signup/logout. Sessions use `jose` for JWT handling and `bcrypt` for password hashing.

Anonymous users can generate components without logging in — work is held in `sessionStorage` via `src/lib/anon-work-tracker.ts` and auto-converted to a persisted project on sign-up/sign-in.

### API Constraints

`/api/chat/route.ts` has `maxDuration = 120` (seconds) — required because AI streaming responses can be long-running. Auto-saves messages + FS to DB on stream finish when `projectId` is present and user is authenticated.

### Database

Prisma with SQLite (`prisma/dev.db`). Generated client outputs to `src/generated/prisma`. Two models: `User` (email + bcrypt password) and `Project` (name, userId, `messages` as JSON string, `data` as serialized VirtualFileSystem JSON string).

### Layout

`src/app/main-content.tsx` — root split-panel UI. Left panel (35%): chat. Right panel (65%): tabs switching between live `PreviewFrame` (iframe) and `CodeEditor` (Monaco) + `FileTree`.

### Path alias

`@/*` maps to `./src/*`.

### System Prompt

`src/lib/prompts/generation.tsx` contains the prompt given to Claude for component generation. This guides AI behavior on:
- Code style (component structure, hooks patterns)
- Imports and dependencies (available in package.json)
- TypeScript strictness
- Tailwind CSS preferences
- Responsive design defaults

Modifying the prompt will change how components are generated across the entire app.

### Hot Reload Behavior

- **Client-side changes** (React components, styles): Auto-reload instantly via Next.js HMR
- **Tool definitions** (`src/lib/tools/`): Requires dev server restart
- **Provider settings** (`.env` `LLM_PROVIDER`): Requires dev server restart
- **Prisma schema** changes: Requires `npx prisma migrate dev` + restart
- **Virtual FS mutations**: Changes persist in-memory immediately; serialization to DB happens on project save

### Type Generation

Running `npm run setup` auto-generates Prisma client types at `src/generated/prisma/`. If you modify `prisma/schema.prisma`:
```bash
npx prisma migrate dev    # Create migration + regenerate types
# OR
npx prisma generate       # Regenerate types without migrating
```

### Debugging Tips

**Iframe rendering issues:**
- Check browser console for Babel compilation errors
- Verify JSX imports (React must be in scope for JSX)
- Ensure dependencies exist in package.json or are bundled

**Virtual FS sync problems:**
- Inspect Redux DevTools (if connected) for file mutations
- Check Prisma logs: `npx prisma studio` to inspect DB state
- Verify serialization: file operations must go through `FileSystemContext`

**Tool call failures:**
- Check `/api/chat` response in Network tab
- Verify `str_replace_editor` and `file_manager` tool schemas match Vercel AI SDK expectations
- Ensure LLM provider is correctly configured (test with `npm run dev:claude` etc.)

## Environment

Copy `.env` with these settings:

```env
# Provider selection: opencode, anthropic, ollama, gemini
LLM_PROVIDER=opencode

# OpenCode (175+ models via Claude, GPT, Gemini, DeepSeek, etc.)
OPENCODE_API_KEY=your_key_here

# Anthropic (Direct API - claude-3.5-sonnet, opus, haiku)
ANTHROPIC_API_KEY=your_key_here

# Gemini (Google AI - experimental provider)
GEMINI_API_KEY=your_key_here

# Ollama (Local - no API costs)
OLLAMA_BASE_URL=http://localhost:11434/v1

# OpenRouter (optional - additional model access)
OPENROUTER_API_KEY=your_key_here

# Figma integration (optional - for design-to-code features)
FIGMA_ACCESS_TOKEN=your_token_here

# Required in production (defaults to a dev key otherwise)
JWT_SECRET=your_secret_here
```

**⚠️ Security:** `.env` is in `.gitignore` for safety. Never commit API keys. Use `.env.local` for development secrets not tracked in git.

### Provider Fallback Order

If selected provider fails, it falls back in order:
1. OpenCode → Anthropic → Ollama → Mock

When no API keys are present, `MockLanguageModel` returns static demo responses (counter, form, or card components).

### Available Models (run `npm run models`)

- **OpenCode**: 175+ models (Claude, GPT, Gemini, DeepSeek, Qwen, Grok, etc.)
- **Anthropic**: claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5
- **Gemini**: gemini-2.0-flash, gemini-1.5-pro (Google AI, experimental)
- **Ollama**: llama3.2, codellama, qwen2.5-coder, mistral (local)

### Next.js & Build Configuration

- **Framework**: Next.js 15 with App Router (`/src/app`)
- **Bundler**: Turbopack in dev mode (`--turbopack`), webpack for production
- **CSS**: Tailwind CSS v4 with PostCSS (configured in `tailwind.config.js`)
- **Styling strategy**: Utility-first with `clsx` and `tailwind-merge` for conditional styles
- **Compilation**: `@babel/standalone` for client-side JSX compilation in iframe (no build step needed)

### Middleware & Protected Routes

**`src/middleware.ts`** protects these routes:
- `/api/projects/*` — Requires valid JWT token (user-specific project access)
- `/api/filesystem/*` — Requires valid JWT token (virtual FS operations)
- `/api/chat` — Public; no auth required (anonymous users allowed)

**Public routes:**
- `/` — Landing page with sign-up/login
- `[projectId]` — Public project view (no auth required)

**Authenticated endpoints:**
- `POST /api/chat` — Stream component generation; auto-saves if `projectId` present
- `GET /api/projects` — List user projects
- `POST /api/projects` — Create new project

### Optional Integrations

**Figma** - The `figma` tool (`src/lib/tools/figma.ts`) enables reading design tokens, creating frames, and exporting assets. Requires `FIGMA_ACCESS_TOKEN` from https://www.figma.com/settings/personal-access-tokens

## Common Development Workflows

**Starting a dev session:**
```bash
npm run dev                    # Start with default provider
# or
npm run dev:claude            # Force Anthropic Claude
npx vitest                    # In another terminal: run tests in watch mode
```

**After changing `.env` (LLM_PROVIDER or API keys):**
- Restart dev server (`Ctrl+C`, then `npm run dev`)

**After modifying `prisma/schema.prisma`:**
```bash
npx prisma migrate dev        # Create and apply migration
npx vitest run                # Run tests to verify schema changes
```

**After modifying tool definitions (`src/lib/tools/*`):**
- Restart dev server to apply tool schema changes

**Debugging a component generation issue:**
1. Check Network tab → `/api/chat` response for tool call details
2. Review browser console for Babel JSX compilation errors
3. Test with `npm run dev:claude` to isolate provider issues
4. Inspect `FileSystemContext` state via React DevTools

**Testing changes to the system prompt:**
- Modify `src/lib/prompts/generation.tsx`
- No restart needed; next component generation will use new prompt
- Test with a simple request first (e.g., "Make a button")

---

## Additional Projects

### LimpiaCSV — CSV Processing SaaS

**Path:** `/Users/macbookpro/Downloads/limpiacsv`

A Next.js 15 SaaS for accounting firms to clean, deduplicate, normalize, and validate CSV files via n8n workflow.

#### Tech Stack
- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Auth:** Supabase JWT (email/password)
- **Database:** Supabase PostgreSQL (`user_files` table)
- **Storage:** Supabase S3-compatible bucket (`accounting-files`)
- **CSV Processing:** n8n webhook workflow (13 nodes)
- **Styling:** Tailwind CSS v4

#### Architecture

**Request Flow:**
```
User Upload (/subir)
  ↓ Preview CSV client-side
  ↓ Upload to Supabase Storage
  ↓ Create user_files record (status: uploaded)
  ↓ POST /api/procesar with metadata
  ↓ API forwards to n8n webhook
  ↓ n8n processes: Parse → Dedupe → Normalize → Validate → Convert → Upload
  ↓ n8n updates user_files (status: completed, clean_file_url set)
  ↓ Results page (/resultados/[id]) polls for completion
  ↓ User downloads cleaned CSV
```

#### Pages
- `/` — Landing page
- `/ingresar` — Login (Supabase Auth)
- `/registrarse` — Signup (Supabase Auth)
- `/tablero` — Dashboard (file stats, list)
- `/subir` — CSV upload with live preview
- `/resultados/[id]` — Results with auto-polling status

#### Database Schema

**`user_files` table:**
- `id` (UUID, primary key)
- `user_id` (UUID, FK to users)
- `filename` (text)
- `original_file_url` (text, nullable)
- `clean_file_url` (text, nullable)
- `status` ('uploaded' | 'processing' | 'completed' | 'failed')
- `error_message` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Storage bucket:** `accounting-files` (public, path: `{user_id}/{timestamp}.csv`)

#### n8n Workflow

**JSON Workflow:** `n8n-workflow-limpiacsv.json` (auto-importable)

**13 Nodes:**
1. Webhook Trigger (receives file_url, user_id, file_id)
2. HTTP Download (fetch CSV from Supabase)
3. Parse CSV (split headers & rows)
4. Deduplicate (by invoice number + RNC)
5. Normalize (RNC format, amounts, dates)
6. Validate (check required fields)
7. Convert to CSV (rebuild file)
8. Prepare Upload (base64 encode)
9. HTTP Upload (send to Supabase)
10. Build Update (prepare DB record)
11. Postgres Update (update user_files status)
12. Error Handler (catch failures)
13. Webhook Response (return JSON)

**Column Mapping (case-insensitive):**
- Invoice: `factura`, `número_factura`
- RNC: `rnc`, `cédula`
- Amount: `monto`, `amount`
- Date: `fecha`, `date`

#### Commands
```bash
cd /Users/macbookpro/Downloads/limpiacsv

npm run dev              # Dev server (port 3002)
npm run build            # Production build
npm run lint             # ESLint
```

#### Environment Variables
```env
# Supabase (public, safe to commit)
NEXT_PUBLIC_SUPABASE_URL=https://vwabaraiimiwjcbzildx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xRYjn2UDq8Vk3mUS
NEXT_PUBLIC_APP_URL=http://localhost:3002

# n8n Webhook (secret, use .env.local)
N8N_WEBHOOK_URL=https://edouardautomation.app.n8n.cloud/webhook/YOUR_ID
```

#### Key Files
- `src/lib/supabase.ts` — Supabase client + types
- `src/app/api/procesar/route.ts` — Webhook forwarding API
- `src/hooks/useAuth.ts` — Auth state management
- `src/hooks/useCSVPreview.ts` — Client-side CSV parsing
- `src/hooks/useUploadProgress.ts` — XHR upload progress
- `n8n-workflow-limpiacsv.json` — Importable n8n workflow
- `.mcp.json` — n8n MCP server config

#### Setup Status (Apr 23, 2026)
- ✅ Backend API ready
- ✅ Supabase configured (pooler connection: `postgresql://postgres:[password]@[host]:6543/postgres`)
- ✅ n8n workflow imported (JSON) — activate in n8n UI before testing
- ✅ MCP integration configured at `.mcp.json`
- ✅ Documentation complete
- ✅ Environment variables in `.env.local` (secrets, not tracked)
- ⚠️ Needs n8n webhook activation and end-to-end testing

**To resume:**
1. Get n8n webhook URL from https://edouardautomation.app.n8n.cloud
2. Update `N8N_WEBHOOK_URL` in `.env.local`
3. Activate workflow in n8n UI (toggle in edit view)
4. Test: Upload CSV to `/subir`, monitor `/api/procesar` logs

#### Important Notes
- n8n workflow must be **activated** (toggle in UI)
- Postgres credentials required for n8n (Supabase pooler connection)
- CSV parsing is case-insensitive for column headers
- Error handling updates record with `status: failed` and error message
- File cleanup should be automated (archive old files after 30 days)

#### Troubleshooting
- **Webhook 404:** Check webhook URL in n8n, verify workflow is active
- **Processing stuck:** Check n8n logs, verify Postgres connection
- **File not uploading:** Verify Supabase bucket is public, check file path format
- **DB update fails:** Verify PostgreSQL credentials in n8n, check table structure

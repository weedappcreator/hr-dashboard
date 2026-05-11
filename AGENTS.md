# UIGen Agent Configuration

## Skills Auto-Loading

Skills automatically load based on your work context. OpenCode matches the task description against skill `description` fields.

### How It Works

```
You: "Create a welcome email sequence"
     ↓
OpenCode: "This matches mkt-email-sequence skill"
     ↓
Skill auto-loads with email templates & frameworks
```

### Skill Categories

| Prefix | Category | Example |
|--------|----------|---------|
| `mkt-*` | Marketing | SEO, CRO, email, ads |
| `oc-*` | OpenClaudia | Content, social, analytics |
| `mia-*` | Marketing In Action | Positioning, copywriting |
| `am-*` | Agentic Marketing | Full-funnel marketing |
| `think-*` | Strategy & Thinking | JTBD, positioning, negotiation |
| `eng-*` | Engineering | TDD, security, code review |
| `growth-*` | Growth | Experiments, sales pipeline |
| `n8n-*` | Automation | n8n workflows |
| `figma-*` | Design | Figma to code |
| `notion-*` | Productivity | Notion workspaces |
| `skill-*` | Meta | Creating skills |

### Example Triggers

```bash
# Marketing tasks → auto-load marketing skills
"Write landing page copy" → mkt-page-cro, mkt-copywriting
"Plan email sequence" → mkt-email-sequence, oc-email-sequence
"SEO audit my site" → mkt-seo-audit, oc-seo-audit

# Strategy tasks → auto-load thinking skills
"Position my SaaS product" → think-jobs-to-be-done, think-obviously-awesome
"Negotiate with vendor" → think-negotiation
"Design growth strategy" → think-blue-ocean-strategy

# Coding tasks → auto-load engineering skills
"Write tests first" → eng-test-driven-development
"Review this PR" → eng-code-review-and-quality
"Design API" → eng-api-and-interface-design

# Automation → auto-load n8n skills
"Build workflow" → n8n-n8n-workflow-patterns
"Write expression" → n8n-n8n-expression-syntax

# Design → auto-load Figma skills
"Convert Figma to React" → figma-figma-implement-design
"Extract design system" → figma-figma-generate-library
```

### Manual Skill Loading

You can also explicitly request skills:

```bash
"Use the think-jobs-to-be-done skill"
"Load the mkt-email-sequence skill"
"Activate the notion-lifeos skill"
```

### Skill Permissions

All skills are allowed by default (`"*": "allow"`).

### Available Skills

Run to see all skills:
```bash
opencode models  # Shows all available models
```

Or list skills in this project:
```bash
ls .opencode/skills/
```

## Project Context

This is **UIGen** - an AI-powered React component generator.

- Left panel: Chat with AI
- Right panel: Live component preview
- Generates React components via natural language

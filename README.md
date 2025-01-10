# 🏛️ Awra 🏛️
> Making legislation understandable through AI

## What is Awra?
Awra is an AI-powered platform that makes legislative bills accessible and understandable to every citizen. By combining state-of-the-art language models with legislative data, Awra breaks down complex bills into clear, actionable insights.

## Why Awra?
Legislative bills are notoriously complex and hard to understand. This complexity creates a barrier between citizens and their government. Awra bridges this gap by:
- Explaining bills in plain language
- Analyzing state-specific impacts (Coming soon)
- Breaking down cost implications
- Mapping relationships between bills
- Providing historical context

## Features
### 🤖 AI-Powered Analysis
- Natural language explanations of complex legislative text
- Interactive Q&A about bill contents and implications
- Real-time bill tracking and updates

### 📊 Impact Analysis
- State-specific breakdowns
- Cost estimates and financial implications
- Relationship mapping between related bills

### 💡 Smart Search
- Find bills by topic, state, or impact area
- Track bills through the legislative process
- Get notified about important updates

## Technology Stack
- **Frontend**: Next.js 13 (App Router), React, Tailwind CSS
- **AI/ML**: LangChain, Anthropic Claude, Cohere Rerank
- **Backend**: PostgreSQL, Prisma
- **Infrastructure**: Digital Ocean

## Roadmap
- [X] Quick Questions - Bills List
- [X] Dark mode
- [ ] Live Bills Dashboard
- [ ] Update connection pools for chats
- [ ] State-level bill analysis (agent)
- [ ] Updated News relevant to certain bills 
- [ ] Committee hearing tracking

## Contributing
If you have an idea / suggestion create a pull request.

## Development
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run development server
pnpm dev

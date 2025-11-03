# Nuxt AI Chatbot Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Full-featured AI Chatbot Nuxt application with authentication, chat history, multiple pages, collapsible sidebar, keyboard shortcuts, light & dark mode, command palette and more. Built using [Nuxt UI](https://ui.nuxt.com) components and integrated with [AI SDK v5](https://sdk.vercel.ai) for a complete chat experience.

- [Live demo](https://chat-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://chat-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/chat-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/chat-light.png">
    <img alt="Nuxt AI Chatbot Template" src="https://ui.nuxt.com/assets/templates/nuxt/chat-light.png">
  </picture>
</a>

## Features

- ⚡️ **Streaming AI messages** powered by the [AI SDK v5](https://sdk.vercel.ai)
- 🤖 **Multiple model support** via various AI providers and OpenAI-compatible endpoints
- 🔐 **Authentication** via [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)
- 💾 **Chat history persistence** using PostgreSQL database and [Drizzle ORM](https://orm.drizzle.team)
- 🚀 **Easy deploy** to Vercel with zero configuration

## Quick Start

```bash
npm create nuxt@latest -- -t ui/chat
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=chat&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fchat&env=NUXT_SESSION_PASSWORD,NUXT_OAUTH_GITHUB_CLIENT_ID,NUXT_OAUTH_GITHUB_CLIENT_SECRET&products=%5B%7B%22type%22%3A%22integration%22%2C%22group%22%3A%22postgres%22%7D%5D&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fchat-dark.png&demo-url=https%3A%2F%2Fchat-template.nuxt.dev%2F&demo-title=Nuxt%20Chat%20Template&demo-description=An%20AI%20chatbot%20template%20to%20build%20your%20own%20chatbot%20powered%20by%20Nuxt%20MDC%20and%20Vercel%20AI%20SDK.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

Set up your environment variables by creating a `.env` file:

```env
# Database
DATABASE_URL=<your-postgresql-database-url>

# GitHub OAuth (optional, for authentication)
NUXT_OAUTH_GITHUB_CLIENT_ID=<your-github-oauth-app-client-id>
NUXT_OAUTH_GITHUB_CLIENT_SECRET=<your-github-oauth-app-client-secret>

# Password for nuxt-auth-utils (minimum 32 characters)
NUXT_SESSION_PASSWORD=<your-password>
```

> [!TIP]
> 本模板支持直接连接多个厂商或 OpenAI 兼容端。见下文“自行直连各模型”。

To add authentication with GitHub, you need to [create a GitHub OAuth application](https://github.com/settings/applications/new).

Run database migrations:

```bash
pnpm db:migrate
```

## Development

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Deploy to Vercel:

```bash
npx vercel
```

Or connect your repository to Vercel for automatic deployments:

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Configure your environment variables in the Vercel dashboard
4. Deploy automatically on every push

> [!NOTE]
> Make sure to configure your PostgreSQL database connection and run migrations in your production environment.

<!-- 旧的 Vercel AI Gateway 说明已移除，推荐使用下方直连配置。 -->

## 自行直连各模型（不使用 Vercel AI Gateway）

> 本模板已内置对 DeepSeek、Qwen（DashScope 兼容）、豆包（火山方舟 Ark）、OpenAI 以及通用 OpenAI 兼容端的支持。按照下列方式在 `.env` 中配置即可直连。

```env
# OpenAI（可选 base）
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# OpenAI 兼容端（自建/第三方代理）
OPENAI_COMPATIBLE_BASE_URL= # 如 https://your-openai-compatible.example.com
OPENAI_COMPATIBLE_API_KEY= # 对应的密钥
OPENAI_COMPATIBLE_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_MODEL=gpt-4o-mini

# DeepSeek（OpenAI 兼容，使用 Chat Completions）
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_API_KEY=ds-xxx
DEEPSEEK_MODEL=deepseek-chat

# Qwen（DashScope 兼容端）
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_API_KEY=qs-xxx
QWEN_MODEL=qwen-max

# 豆包 / 火山方舟 Ark（OpenAI 兼容，/api/v3/chat/completions）
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_API_KEY=cf02bc6b-...
DOUBAO_MODEL=doubao-seed-1-6-251015

# 默认模型（provider/model）
DEFAULT_MODEL=deepseek/deepseek-chat
```

### 重要提示

- DeepSeek 官方建议使用根域名作为 base：`https://api.deepseek.com`，客户端会自动追加 `/v1/chat/completions`（兼容 OpenAI）。
- 豆包 Ark 必须使用 `https://ark.cn-beijing.volces.com/api/v3`（不要带尾斜杠），模板会强制走 Chat Completions 路径。
- 切换模型后，无需刷新页面：聊天页会在发送前动态注入当前选择的模型。

### 豆包最小连通性测试（纯文本）

```bash
curl -sS https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $DOUBAO_API_KEY" \
  -d '{
    "model": "doubao-seed-1-6-251015",
    "messages": [{"role":"user","content":[{"type":"text","text":"你好，用一句话自我介绍。"}]}],
    "max_completion_tokens": 512
  }'
```

## 自定义首页 Quick Chats（中英文）

首页 Quick Chats 支持通过 `runtimeConfig.public.quickChats` 变量配置，支持中英文内容：

```ts
// nuxt.config.ts（片段）
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      quickChats: [
        { zh: '为什么选择 Nuxt UI？', en: 'Why choose Nuxt UI?', icon: 'i-logos-nuxt-icon' },
        { zh: '展示一个销售折线图', en: 'Show a sales line chart', icon: 'i-lucide-line-chart' }
      ]
    }
  }
})
```

前端会根据当前语言自动选择 `zh/en` 字段；未设置时将退回到内置的 i18n 文案。

## 模型 Logo

模板支持为部分模型显示官方 Logo。你可以将图标放到 `public/logos/` 下，并在 `nuxt.config.ts` 的 `models` 配置里为对应项设置 `logo` 字段（或继续使用 Iconify 的 `icon` 字段）。示例：

```ts
{ label: 'DeepSeek Chat', value: 'deepseek/deepseek-chat', logo: '/logos/deepseek.svg' }
```

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.

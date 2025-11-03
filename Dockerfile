# syntax=docker/dockerfile:1

# ---------- base ----------
FROM node:20-alpine AS base
ARG NODE_OPTIONS=--max_old_space_size=6144
ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NODE_OPTIONS=${NODE_OPTIONS}
RUN corepack enable && adduser -D -u 10001 app

# ---------- deps ----------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Ensure patch files are available during pnpm install
COPY patches ./patches
# Use an explicit pnpm matching the lockfile to avoid corepack shims mismatch
ENV PNPM_HOME=/usr/local/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack disable && npm i -g pnpm@10.20.0 && pnpm -v
# 安全兜底：锁文件不兼容时强制重解（仅在容器内，不影响宿主仓库）
RUN pnpm install --force

# ---------- build ----------
FROM base AS build
WORKDIR /app
ENV PNPM_HOME=/usr/local/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack disable && npm i -g pnpm@10.20.0 && pnpm -v
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Nuxt 4 build output: .output/
ARG NITRO_PRESET=node-server
ENV NITRO_PRESET=${NITRO_PRESET}
# Fix esbuild host/binary mismatch inside container (Alpine/musl)
RUN pnpm rebuild esbuild
RUN pnpm build

# ---------- runner ----------
FROM base AS runner
WORKDIR /app
USER app
ENV PORT=3000
ENV HOST=0.0.0.0
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]



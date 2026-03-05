FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/core/package.json packages/core/
COPY packages/editor/package.json packages/editor/
COPY packages/ui/package.json packages/ui/
COPY packages/utils/package.json packages/utils/
COPY tooling/package.json tooling/
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
COPY . .
RUN pnpm --filter @mint/core build
RUN pnpm --filter @mint/utils build
RUN pnpm --filter @mint/editor build
RUN pnpm --filter @mint/ui build
RUN pnpm --filter @mint/web build

FROM nginx:alpine AS production
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

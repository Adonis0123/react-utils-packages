# adonis-kit 发布流程（npm + Vercel）

本文档只聚焦两条发布主线：

1. npm 包发布：`@adonis-kit/react-layouts`、`@adonis-kit/ui`
2. Vercel 部署：`apps/web`（包含 shadcn registry 静态入口）

## 1. 一次性准备

### 1.1 GitHub Actions（用于 npm 自动发布）

仓库 `Settings -> Secrets and variables -> Actions` 需要有：

- `NPM_TOKEN`：建议 npm automation token，具备发布权限
- `GITHUB_TOKEN`：GitHub Actions 自动提供，无需手工创建

当前 npm 发布工作流文件：`.github/workflows/release.yml`
触发条件：`push` 到 `main` 分支。

### 1.2 Vercel（用于 web 与 registry 访问）

Vercel Project 建议配置：

- Root Directory：`apps/web`
- Build Command：`pnpm turbo run build --filter=web`

部署后需要可访问：

- `https://<your-domain>/registry.json`
- `https://<your-domain>/r/button.json`

### 1.3 域名替换（首次上线或域名变更时）

将 `https://adonis-kit.vercel.app` 替换为你的真实域名：

- `registry.json`
- `apps/web/components.json`
- `apps/web/registry.json`（如保留该镜像文件，也一起维护）

## 2. 先判断这次改动走哪条链路

| 改动类型 | 需要 `pnpm changeset` | 需要 `pnpm registry:build` | 主要发布结果 |
| --- | --- | --- | --- |
| 仅改 `packages/react-layouts` / `packages/ui`（对外包能力变化） | 是 | 否 | npm 新版本 |
| 仅改 `registry/**` / `registry.json` | 否 | 是 | Vercel 上 `/r/*.json` 更新 |
| 仅改 `apps/web/**` 页面展示 | 否 | 否（除非改了 registry 源） | Vercel 站点更新 |
| 同时改包与 registry/web | 是 | 是 | npm + Vercel 都更新 |

## 3. npm 发布流程（Changesets + CI）

### 步骤 1：本地校验

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

### 步骤 2：仅在"包发布"场景生成 changeset

```bash
pnpm changeset
```

为受影响包选择版本级别（patch/minor/major）。

### 步骤 3：提交 PR 并合并到 `main`

```bash
git add .
git commit -m "feat(ui): ..."
git push
```

合并到 `main` 后，`release.yml` 会运行：

1. 安装依赖
2. 构建可发布包（`@adonis-kit/react-layouts`、`@adonis-kit/ui`）
3. 执行 `changesets/action`

### 步骤 4：发布行为说明

- 有未消费 changeset：创建或更新 Release PR
- 合并 Release PR 后：自动 `npm publish`

### 步骤 5：发布后检查

```bash
npm view @adonis-kit/react-layouts version
npm view @adonis-kit/ui version
```

## 4. Vercel 发布流程（web + registry）

### 步骤 1：如果改了 registry 源，先生成静态产物

```bash
pnpm registry:build
```

会更新：

- `apps/web/public/r/*.json`
- `apps/web/public/registry.json`

注意：这些是要随代码提交的产物，不要漏提交。

### 步骤 2：提交 PR，检查 Preview

提交后在 Vercel Preview 验证页面与接口：

- `/registry.json`
- `/r/button.json`
- `/r/card.json`

### 步骤 3：合并到 `main`，触发 Production 部署

上线后再做一次线上验证：

```bash
pnpm dlx shadcn@latest add https://<your-domain>/r/button.json
```

## 5. 同时发布 npm + Vercel（常见组合）

当一次改动既影响包又影响 registry/web，建议顺序：

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm changeset
pnpm registry:build
git add .
git commit -m "feat: ..."
git push
```

然后通过 PR 合并到 `main`，让两条链路各自完成自动发布。

## 6. 手动兜底（仅 CI 异常时）

### npm 手动发布

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm version-packages
pnpm release
```

### Vercel 手动发布

在 Vercel Dashboard 对目标提交执行 Redeploy（Production），并重新验证 `/registry.json` 与 `/r/*.json`。

## 7. 常见问题

### Q1: `NPM_TOKEN is not set`

- 检查仓库 Actions Secrets 是否配置 `NPM_TOKEN`
- 检查 token 是否具备 npm publish 权限

### Q2: npm 没发出去，但 Vercel 正常

- 这是正常隔离现象：`release.yml` 只处理 npm 包
- 优先查看 `.github/workflows/release.yml` 的执行日志

### Q3: `shadcn add` 报 404

- 是否执行并提交了 `pnpm registry:build` 产物
- 是否部署到了正确域名
- `apps/web/components.json` 的 registry 域名是否已更新

# 发布流程迁移指南（面向其他项目）

本文档用于将当前仓库的 Changesets 发布体系迁移到其他仓库，目标是快速复用以下能力：

- 手动选择包与 `patch/minor/major` 生成 changeset（`Release Prepare`）
- `push main` 自动发布（`Release`）
- 发布异常后回退 npm `latest` 标签（`Release Rollback`）

## 1. 适用前提

建议目标项目满足：

1. 使用 npm 发包（public package）
2. 已接入 GitHub Actions
3. 最好是 monorepo（非 monorepo 也可迁移，需调整脚本）

## 2. 需要复制的核心文件

从本仓库复制以下文件到目标仓库：

1. `.github/workflows/release.yml`
2. `.github/workflows/release-prepare.yml`
3. `.github/workflows/release-rollback.yml`
4. `scripts/release/create-changeset.mjs`

可选复制：

5. 根目录 `package.json` 中脚本别名
   - `release:create-changeset`

## 3. 必改配置（迁移时最容易漏）

## 3.1 包白名单

需要同时修改 2 处，保持一致：

1. `release-prepare.yml` 的下拉选项 `inputs.package.options`
2. `create-changeset.mjs` 的 `ALLOWED_PACKAGES`

## 3.3 分支与权限

根据目标仓库修改：

- `on.push.branches`（`main` 或 `master`）
- `permissions`（建议最小化）
- `concurrency`（避免重复发布任务竞争）

## 3.4 构建与测试命令

若目标仓库不是 `pnpm + turbo`，需替换：

- `pnpm install --frozen-lockfile`
- `pnpm turbo run build --filter=<pkg-a> --filter=<pkg-b> ...`
- 单包测试命令（如存在）

## 4. Secrets 配置

目标仓库 `Settings -> Secrets and variables -> Actions` 至少需要：

- `NPM_TOKEN`
- `GITHUB_TOKEN`（通常默认可用）

## 5. 推荐迁移步骤

1. 新建迁移分支并复制文件
2. 修改白名单、路径映射、构建命令、分支策略
3. 提交 PR 并完成代码评审
4. 合并后手动运行一次 `Release Prepare`
5. 观察 `Release` 的版本 PR 与后续 publish 是否正常
6. 在非生产包上演练一次 `Release Rollback`

## 6. 验收标准

满足以下条件即视为迁移成功：

1. `Release Prepare` 可创建带 `.changeset/*.md` 的 PR
2. `Release` 可创建/更新版本 PR
3. 合并版本 PR 后可发布 npm 新版本
4. 每次发布都会先构建发布白名单包（保守稳定策略）
5. `Release Rollback` 可恢复 `latest` 到指定历史版本

## 7. 常见迁移问题

### Q1：仍然一直是 `0.0.0`

根因通常是没有生成 changeset。  
先触发 `Release Prepare` 或手工添加 `.changeset/*.md`。

### Q2：Workflow 校验报 YAML 类型错误

包含 `:` 的字符串建议使用双引号包裹，例如：

```yaml
title: "chore(release): prepare ${{ inputs.package }} (${{ inputs.bump }})"
```

### Q3：回退失败

先确认版本存在：

```bash
npm view <package>@<version> version
```

再确认 `NPM_TOKEN` 是否有 dist-tag 权限。

## 8. 约束说明

- 当前方案是“单包准备发布”，一次只处理一个包
- 回退策略是“安全回退”：仅改 `latest` dist-tag，不删除已发布版本
- 新增发布包时，必须同步更新 workflow 和脚本中的白名单

# 发布流程使用说明（Changesets 定向发包 + 安全回退）

本文档说明当前仓库 npm 发包的标准流程，覆盖以下 3 条 GitHub Actions 工作流：

- `Release`：自动发布主流程（`push main` 触发）
- `Release Prepare`：手动准备发布（生成 changeset + 开 PR）
- `Release Rollback`：手动回退 `latest` dist-tag

如果你要把本流程迁移到其他仓库，请参考：

- `.docs/release-migration-guide.md`

## 1. 发布目标与包白名单

当前仅支持以下发布包：

- `@adonis-kit/react-layouts`
- `@adonis-kit/ui`

> 说明：根目录 `package.json` 的 `"version": "0.0.0"` 是 monorepo 私有版本，不影响子包 npm 发布版本。

## 2. 一次性准备

在仓库 `Settings -> Secrets and variables -> Actions` 中配置：

- `NPM_TOKEN`：必须，具备 npm publish 和 dist-tag 修改权限
- `GITHUB_TOKEN`：GitHub Actions 自动注入（默认可用）
- `Settings -> Actions -> General -> Workflow permissions` 设为 `Read and write permissions`
- 勾选 `Allow GitHub Actions to create and approve pull requests`（`Release Prepare` 创建 PR 必需）

Changesets 配置必须包含以下两点：

1. 启用 changelog 生成（供 `changesets/action` 读取）
2. 私有包不参与 version/tag（避免私有包误升版）

```json
{
  "changelog": "@changesets/cli/changelog",
  "privatePackages": {
    "version": false,
    "tag": false
  }
}
```

## 3. 工作流说明

### 3.1 `Release Prepare`（手动入口）

用途：你只需要选择包和版本级别，系统自动生成 changeset，并创建发布准备 PR。

触发方式：GitHub Actions 手动运行 `Release Prepare`。

输入参数：

- `package`：`@adonis-kit/react-layouts` 或 `@adonis-kit/ui`
- `bump`：`patch` / `minor` / `major`（下拉选择）
- `summary`：changeset 说明（可选）

执行内容：

1. 安装依赖
2. 执行发布配置校验：`node scripts/release/validate-changeset-config.mjs`
3. 自动生成 `.changeset/release-<pkg>-<runid>-<attempt>.md`
4. 仅构建选中包：`pnpm turbo run build --filter=<package>`
5. 若选中 `@adonis-kit/react-layouts`，额外运行测试：`pnpm -C packages/react-layouts test`
6. 自动创建 PR（分支名：`release-prepare-<slug>-<runid>-<attempt>`）

### 3.2 `Release`（自动入口）

用途：处理 changesets 标准两阶段发布（先版本 PR，后 npm publish）。

触发方式：`push` 到 `main`。

执行内容：

1. 安装依赖
2. 执行发布配置校验：`node scripts/release/validate-changeset-config.mjs`
3. 固定构建发布包（`@adonis-kit/react-layouts` 与 `@adonis-kit/ui`）
4. 执行 `changesets/action@v1`
   - `version: pnpm version-packages`
   - `publish: pnpm release`

发布行为：

- 存在未消费 changeset：创建或更新版本 PR
- 版本 PR 合并后再次触发：执行 npm 发布

### 3.3 `Release Rollback`（手动回退）

用途：失败后定向恢复某个包的 `latest` 指向，不做 unpublish。

触发方式：GitHub Actions 手动运行 `Release Rollback`。

输入参数：

- `package`：白名单包
- `restore_version`：要恢复为 `latest` 的已发布版本（如 `0.1.3`）

执行内容：

1. 校验版本号格式
2. 校验目标版本存在：`npm view <package>@<restore_version> version`
3. 记录回退前 dist-tags
4. 回退：`npm dist-tag add <package>@<restore_version> latest`
5. 记录回退后 dist-tags，并写入 workflow summary

## 4. 标准发布操作步骤（推荐）

1. 打开 GitHub Actions，运行 `Release Prepare`。
2. 选择要发布的包和 `patch/minor/major`，可填写 `summary`。
3. 等待自动创建 PR，确认改动中包含新增 `.changeset/*.md` 文件。
4. 合并该 PR 到 `main`。
5. 等待 `Release` 自动创建/更新版本 PR（Changesets PR）。
6. 合并版本 PR 到 `main`。
7. 等待 `Release` 自动执行 npm publish。
8. 发布后验证：
   - `npm view @adonis-kit/react-layouts version`
   - `npm view @adonis-kit/ui version`

## 4.1 发布流程图（Mermaid）

```mermaid
flowchart TD
  A["开始发布"] --> B["手动触发 Release Prepare"]
  B --> C["选择 package + bump + summary"]
  C --> D["生成 .changeset/release-*.md"]
  D --> E["创建 release-prepare PR"]
  E --> F{"合并到 main ?"}
  F -- "否" --> Z1["等待合并"]
  F -- "是" --> G["触发 Release (push main)"]
  G --> H["构建 publishable packages"]
  H --> I{"是否存在未消费 changeset ?"}
  I -- "是" --> J["创建/更新 Changesets 版本 PR"]
  J --> K{"版本 PR 合并到 main ?"}
  K -- "否" --> Z2["等待合并"]
  K -- "是" --> L["再次触发 Release"]
  L --> M["changeset publish (npm)"]
  M --> N["发布成功并更新 tag/release"]
  I -- "否" --> O["直接尝试 publish 未发布版本"]
  O --> P{"npm 上有未发布新版本 ?"}
  P -- "有" --> M
  P -- "无" --> Q["No unpublished projects to publish"]
  N --> R{"需要回退 latest ?"}
  Q --> R
  R -- "否" --> S["结束"]
  R -- "是" --> T["手动触发 Release Rollback"]
  T --> U["npm dist-tag add <pkg>@<version> latest"]
  U --> S
```

图中关键判定点：

- `是否存在未消费 changeset`：决定是先创建版本 PR，还是直接尝试 publish。
- `npm 上有未发布新版本`：对应你日志里的场景，如果版本已发布会走 `No unpublished projects to publish`。
- `Release Rollback`：仅回退 `latest` dist-tag，不删除已发布版本。

## 4.2 `package.json` 发布脚本要不要手动执行？

当前脚本如下：

- `pnpm release`（`changeset publish`）
- `pnpm release:create-changeset`（`node scripts/release/create-changeset.mjs`）
- `pnpm release:detect-build-filters`（`node scripts/release/detect-build-filters.mjs`）
- `pnpm release:validate-config`（`node scripts/release/validate-changeset-config.mjs`）

结论（当前仓库默认流程）：

1. 日常发布不需要你手动执行这 4 个命令。  
2. 推荐入口是 GitHub Actions：手动跑 `Release Prepare`，然后按 PR 流程合并。  
3. `Release` 工作流会自动执行发布必需步骤（包括校验配置与最终 publish）。

各命令在当前流程中的定位：

| 命令 | 当前是否被 workflow 使用 | 你是否需要手动执行 |
| --- | --- | --- |
| `pnpm release` | 是。由 `Release` 中 `changesets/action` 调用（`publish: pnpm release`） | 通常不需要；仅在 CI 失效且你明确要本地直发时才考虑 |
| `pnpm release:create-changeset` | 功能被 `Release Prepare` 使用（当前 workflow 直接调用 `node scripts/release/create-changeset.mjs`） | 不需要，除非你要本地手工生成指定格式 changeset |
| `pnpm release:validate-config` | 功能被 `Release` 与 `Release Prepare` 使用（当前 workflow 直接调用 `node scripts/release/validate-changeset-config.mjs`） | 不需要，可作为本地自检命令 |
| `pnpm release:detect-build-filters` | 否（当前 release workflow 未接入） | 不需要；属于预留/优化脚本 |

补充说明：

- 本仓库现在采用“保守稳定”策略：`Release` 固定构建 `@adonis-kit/react-layouts` 和 `@adonis-kit/ui`，未启用按改动文件动态过滤构建。
- 因此 `release:detect-build-filters` 目前不会影响实际发包结果。

## 5. 常见问题

### Q1：为什么版本一直是 `0.0.0`？

因为没有 changeset 文件时，`changeset version` 不会 bump 包版本。  
请先运行 `Release Prepare` 生成 changeset，再走合并流程。

### Q2：为什么看起来每次都构建两个包？

当前采用保守稳定策略：每次 `Release` 都构建两个发布包，确保 publish 时产物完整。

### Q3：回退是否会删除 npm 已发布版本？

不会。当前策略是“安全回退”，只修改 `latest` dist-tag 指向，不执行 `unpublish`。

### Q4：`Release Prepare` 报错 `GitHub Actions is not permitted to create or approve pull requests`

说明当前仓库（或组织）未允许 Actions 创建 PR。  
在仓库或组织设置中开启：

- `Workflow permissions = Read and write permissions`
- `Allow GitHub Actions to create and approve pull requests`

### Q5：`Release` 报错 `ENOENT ... apps/web/CHANGELOG.md`

常见原因：

1. `.changeset/config.json` 把 `changelog` 设成了 `false`
2. 未配置 `privatePackages` 导致私有包被误升版

请确保配置如下：

```json
{
  "changelog": "@changesets/cli/changelog",
  "privatePackages": {
    "version": false,
    "tag": false
  }
}
```

## 6. 边界与约束

- 当前是单包选择发布（每次只准备一个包）
- 白名单仅包含两个包；新增包需同步更新 workflow 与脚本
- 回退只影响 npm `dist-tag`，不会回滚 Git 历史或代码

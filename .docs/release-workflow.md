# 发布流程使用说明（Changesets 定向发包 + 安全回退）

本文档说明当前仓库 npm 发包的标准流程，覆盖以下 3 条 GitHub Actions 工作流：

- `Release`：自动发布主流程（`push main` 触发）
- `Release Prepare`：手动准备发布（生成 changeset + 开 PR）
- `Release Rollback`：手动回退 `latest` dist-tag

如果你要把本流程迁移到其他仓库，请参考：

- `docs/release-migration-guide.md`

## 1. 发布目标与包白名单

当前仅支持以下发布包：

- `@adonis-kit/react-layouts`
- `@adonis-kit/ui`

> 说明：根目录 `package.json` 的 `"version": "0.0.0"` 是 monorepo 私有版本，不影响子包 npm 发布版本。

## 2. 一次性准备

在仓库 `Settings -> Secrets and variables -> Actions` 中配置：

- `NPM_TOKEN`：必须，具备 npm publish 和 dist-tag 修改权限
- `GITHUB_TOKEN`：GitHub Actions 自动注入（默认可用）

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
2. 自动生成 `.changeset/release-<pkg>-<runid>-<attempt>.md`
3. 仅构建选中包：`pnpm turbo run build --filter=<package>`
4. 若选中 `@adonis-kit/react-layouts`，额外运行测试：`pnpm -C packages/react-layouts test`
5. 自动创建 PR（分支名：`codex/release-prepare-<slug>-<runid>-<attempt>`）

### 3.2 `Release`（自动入口）

用途：处理 changesets 标准两阶段发布（先版本 PR，后 npm publish）。

触发方式：`push` 到 `main`。

执行内容：

1. 安装依赖
2. 固定构建发布包（`@adonis-kit/react-layouts` 与 `@adonis-kit/ui`）
3. 执行 `changesets/action@v1`
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

## 5. 常见问题

### Q1：为什么版本一直是 `0.0.0`？

因为没有 changeset 文件时，`changeset version` 不会 bump 包版本。  
请先运行 `Release Prepare` 生成 changeset，再走合并流程。

### Q2：为什么看起来每次都构建两个包？

当前采用保守稳定策略：每次 `Release` 都构建两个发布包，确保 publish 时产物完整。

### Q3：回退是否会删除 npm 已发布版本？

不会。当前策略是“安全回退”，只修改 `latest` dist-tag 指向，不执行 `unpublish`。

## 6. 边界与约束

- 当前是单包选择发布（每次只准备一个包）
- 白名单仅包含两个包；新增包需同步更新 workflow 与脚本
- 回退只影响 npm `dist-tag`，不会回滚 Git 历史或代码

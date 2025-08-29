---
title: 博客开发与部署工作流
published: 2025-08-25
description: '方便日后开发快速回滚，这里记录一下博客从开发、写文到部署上线的工作流。'
image: ''
tags: [博客搭建, 复盘总结, 开发]
category: 我这样做事
draft: false
---

上次基于 GitHub Pages 部署博客在两年前，写作流程有些复杂，过了一段时间后甚至完全忘记如何恢复环境。这一次从 0 开始重新部署，我更加注重**环境可迁移性**与**自动化**，并做好流程复盘，方便追溯。

下面记录了我在 Fuwari 博客模板基础上改造的开发与上线工作流。无论是换电脑、重装环境还是切换域名，都可以按照这里的步骤快速恢复写作与部署，让「写一篇文章 → 推送 Git → 一键上线」成为顺畅的日常。

## 零丨写作/开发到上线的最简流程

**新建文章**

```powershell
pnpm run new-post 我这样做事 HT-Vol02
```

→ 自动生成 `HT-Vol02.md` 和 `HT-Vol02/` 图片文件夹，在 md 中写文即可。

**启动开发服务器/本地预览**

```powershell
pnpm dev
```

**\*提交并推送**（可选，已与 `deploy.bat` 脚本集成）

```powershell
git add -A
git commit -m "feat: 新文章《效率系统二次迭代》"
git push
```

**部署上线**

```powershell
deploy.bat
```

## 一丨本地开发流程

### 1. 初始化环境（仅首次或换电脑时）

- 先安装好 [Node.js](https://nodejs.org/zh-cn) 的 **LTS 版本**（建议 `20.x`）；
- 安装好 Node.js 后，使用 `pnpm`（替代 npm，速度更快，磁盘占用更少）。如果未安装，先运行：

```powershell
npm install -g pnpm
```

进入项目目录并安装依赖：

```powershell
cd YOUR\PATH\TO\leehenry-blog
pnpm install
```

结果：生成 `node_modules/` 文件夹，包含 Astro、Tailwind 等依赖。

### 2. 启动本地开发

```powershell
pnpm dev
```

- 启动 Vite 开发服务器，浏览器访问 [http://localhost:4321](http://localhost:4321/)。
- 修改文章/样式/配置文件后页面会自动热更新。

### 3. 写文章 / 改配置

#### 3.1 新建文章

**方案一 · 自动化脚本**

在 `/leehenry-blog` 项目文件夹下借助脚本自动生成文章 Markdown 文件和同级图片目录。

```bash
# 语法
pnpm run new-post <栏目> <目录名> [-t "标题"]

# 示例：我这样做事 / HT-Vol02
pnpm run new-post 我这样做事 HT-Vol02 -t "效率系统二次迭代"

# 示例：野语不成篇（支持别名 wild/yy）
pnpm run new-post wild YY-Vol01 -t "零散片语"
```

生成结构：

```bash
src/content/posts/我这样做事/
  HT-Vol02/         ← 图片文件夹（放 cover.jpg 等）
  HT-Vol02.md       ← 文章文件
```

front-matter 自动写入：

```yaml
---
title: 效率系统二次迭代
published: 2025-08-25
description: ''
image: ''
tags: []
category: 我这样做事
draft: false
lang: ''
---
```

> [!tip]
>
> 封面图推荐放在同级文件夹，如 `./HT-Vol02/cover.jpg`，然后在 front-matter 写：`image: ./HT-Vol02/cover.jpg`

> 支持的栏目（可用中文或别名）：
>
> | 中文栏目   | 别名                    |
> | ---------- | ----------------------- |
> | 野语不成篇 | ["wild", "yy", "WW"]    |
> | 多懂一点点 | ["sense", "dd", "SS"]   |
> | 我这样做事 | ["hack", "wz", "HT"]    |
> | 瞬间备忘录 | ["moment", "sj", "MMs"] |
> | 话从哪说起 | ["mind", "hc", "MM"]    |

**方案二 · 手动创建文章**

- 在 `src/content/posts/<栏目>/` 下新建 `title.md`，同目录的同名文件夹放置图片。
- 在文章的开始需要自行填写 front-matter 才能正常解析。

#### 3.2 修改配置

- 修改 `src/config.ts`（站点标题、头像、导航栏）
- 修改 `friends.json`（友链）

### 4. Git 管理

#### 4.1 最小化工作流

```powershell
git add -A
git commit -m "feat: 新增文章《xxx》"
git push
```

#### 4.2 常见命令

- 查看改动：

```powershell
git status
```

- 提交改动：

```powershell
git add -A
git commit -m "feat(nav): add icons for nav links"
```

- 推送到远端：

```powershell
git push
```

#### 4.3 Commit type 参考

| 类型     | 用途说明               | 示例                            |
| -------- | ---------------------- | ------------------------------- |
| feat     | 新功能、新模块         | `feat: 新增友链页面`            |
| fix      | 修复 bug               | `fix: 修复二维码不显示的问题`   |
| docs     | 文档修改               | `docs: 更新 README`             |
| style    | 格式修改（不影响逻辑） | `style: 调整 friends.json 排版` |
| refactor | 重构优化（不改功能）   | `refactor: 优化导航栏组件结构`  |
| perf     | 性能优化               | `perf: 提升图片加载速度`        |
| chore    | 配置/依赖/脚本等杂项   | `chore: 升级依赖`               |

#### 4.4 同步模板作者更新

```powershell
git remote add upstream https://github.com/saicaca/fuwari.git
git fetch upstream
git checkout main
git merge upstream/main
```

结果：将模板作者的更新合并到你的仓库，解决冲突后即可使用。

### 5. 构建网站（生成静态文件）

```powershell
pnpm build
```

- Astro 会输出静态 HTML/CSS/JS 文件到 `dist/` 目录。
- 本地预览打包结果：

```powershell
pnpm preview
```

## 二丨远端部署流程

### 1. 配置免密登录（仅首次或换新电脑时）

```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
type %USERPROFILE%\.ssh\id_ed25519.pub | ssh -p 22 root@YOUR_SERVER_IP "umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys"
```

验证：

```powershell
ssh -i %USERPROFILE%\.ssh\id_ed25519 -p 22 root@YOUR_SERVER_IP "echo ok"
```

出现 `ok` 即免密成功。

### 2. 部署上线

#### 方案 1：一键脚本

```powershell
deploy.bat
```

步骤包含：

1. 远端备份旧版本（保留 `.well-known` / `.user.ini`）
2. 打包 `dist/`
3. 上传并解压到远端目录
4. 修正文件权限
5. 完成后即可通过域名访问

#### 方案 2：手动上传

1. 本地执行 `pnpm build`
2. 将 `dist/` 内的内容打包上传到远程目录 `/www/wwwroot/yourdomain.com/`
3. 设置文件权限（755 文件夹，644 文件）

## 三丨域名绑定与迁移

- 修改 DNS 解析：在阿里云 / 宝塔面板中，将域名解析到服务器 IP。
- 修改 Nginx 配置：在宝塔 → 网站 → 域名管理，绑定新域名并启用 SSL。
- 博客代码无需改动，部署脚本仍可直接使用。

## 四丨常见问题

### 1. astro 模块消失问题

**场景：在 dev/build 的时候报错找不到 astro 模块，`node_modules` 下的 `astro` 莫名其妙消失，**

```bash
Error: Cannot find module '...\leehenry-blog\node_modules\astro\astro.js'
```

解决：重装一下就好了。在项目目录下执行：

```powershell
pnpm install
pnpm build
```

## 附 | `deploy.bat` 使用介绍

### 📌 脚本简介

这是一个一键部署脚本，适用于 **Windows 环境**，主要功能包括：

1. **本地构建**：调用 `pnpm build` 或 `npm run build` 生成静态资源。
2. **远端部署**：自动备份远端站点 → 清理旧文件 → 上传并解压新版本 → 修正权限。
3. **版本管理**：在本地仓库执行 `git add / commit / push`，支持自定义提交信息。
4. **失败重试**：每个步骤独立，如果失败只需重试该步骤，而不是整个流程。
5. **代理支持**：可选仅为 Git 推送设置代理（适合国内环境，上传服务器走直连，GitHub 推送走代理）。

### ⚙️ 使用方法

1. 将脚本命名为 `deploy.bat`，放在和 `leehenry-blog` 同级目录下。

    ```
    project-root/
    ├─ leehenry-blog/         # 博客源码目录
    ├─ deploy.bat             # 部署脚本
    ```

2. 双击运行或在命令行执行：

    ```cmd
    deploy
    ```

3. 脚本会依次执行构建、上传、远端解压和推送 Git。

运行时会显示每个步骤的耗时与日志，失败时可以选择：

- `R` → 仅重试该步骤
- `E` → 退出脚本

### 🛠️ 可配置项

在脚本开头（CONFIG 区域）可修改以下配置：

- **部署参数**

    ```bash
    set "HOST=39.104.64.173"              REM 远端服务器 IP
    set "PORT=22"                         REM SSH 端口
    set "USER=root"                       REM SSH 用户
    set "REMOTE_DIR=/www/wwwroot/39.104.64.173"   REM 部署目录
    set "WWW_USER=www"                    REM 文件属主
    set "WWW_GROUP=www"                   REM 文件属组
    set "KEY=%USERPROFILE%\.ssh\id_ed25519"       REM SSH 私钥路径
    ```

- **Git 代理（仅影响 HTTPS 推送，不影响 SSH）**

    ```bash
    set "GIT_PROXY_ENABLE=1"              REM 1=启用，0=禁用
    set "GIT_PROXY_URL=http://127.0.0.1:2020"
    ```

- **其它**

    ```bash
    set "PAUSE_AT_END=1"                  REM 脚本结束后是否暂停
    set "BACKUP=1"                        REM 是否自动备份远端旧版本
    ```

### 💡 使用场景

- **正常部署**：直接运行脚本，自动完成全流程。
- **修改提交信息**：在 Step 8 时输入自定义 commit message，按回车则默认 `"feat: update new posts"`。
- **跳过 Git 代理**：将 `GIT_PROXY_ENABLE=0`，或把仓库远程改为 SSH 地址。
- **失败重试**：如果某一步失败，输入 `R` 仅重试该步骤，无需从头再跑。

### ❓ 常见问题

- **Q: 为什么 Git 推送时报错？**
     A: 检查远程 URL 是否是 **HTTPS**，只有 HTTPS 才会走代理。SSH (`git@...`) 推送不会使用 HTTP 代理。
- **Q: 我不想每次都用代理怎么办？**
     A: 修改脚本，把 `GIT_PROXY_ENABLE=0`。
- **Q: 远端文件夹会不会清空？**
     A: 是的，会清理目标目录下的文件，但保留 `.well-known` 和 `.user.ini`。如果需要更多保留文件，请在 Step 3 修改规则。
- **Q: 构建工具找不到怎么办？**
     A: 脚本会优先尝试 `pnpm`，若未安装则 fallback 到 `npm run build`。

# 分支介绍-功能与改动总结 20250820

## ⚡ 功能性增加特性

- **个人资料卡片**：重构 `src/components/widget/Profile.astro`，增强展示效果与逻辑。
    - 增加点击微信图标后，弹出微信公众二维码图片的功能。图片弹窗设计了缓动动画；
    - 微信二维码的图片资源在 `public` 文件夹。

- **导航系统**：修改 `Navbar.astro` 与 `NavMenuPanel.astro`，优化菜单体验。
    - 导航栏目（包括桌面端顶部导航与移动端侧边抽屉）支持图标显示；
    - 新增导航栏只需修改 `src/config.ts` 的 `navBarConfig`；
    - 导航栏目增加子模块“友链”。

- **友链模块**：
  - 新增 `friends.astro` 页面，在 `src/data/friend.json` 数据结构化存储友链信息；
  - 支持头像展示（图片资源放在 `public/friends`）、友链卡片式展示支持亮/暗主题自适应；
  - 友链正文内容 `friends.md` 与 about 页面的 `about.md` 一起放在 `src/content/spec` 下。


## ⚡ 内容个性化修改

- **模板个人化**：
    - 修改 `src/config.ts` 中的配置信息：
        - 网站的标题、副标题与语言信息、首页头图启用（`SiteConfig`）；
        - 作者信息、社媒账号链接、头像图片路径（`ProfileConfig`）；

- **内容系统**：
  - 增加多篇文章（`SS-Vol01`, `HT-Vol01`, `MMs-Vol01`, `MM-Vol01`, `MM-Vol02` 等）。
  - 添加文章配图资源，配图与文章放在同级文件夹中，在博客内容 Markdown 中使用相对位置索引图片。
- **静态资源**：新增头像、二维码等图片。
    - 头像和首页头图存放在 `src/assets/images` 文件夹下；

## ⚡ 其他内容修改

- 补充 `.gitignore`；
- `package.json` 与 ``pnpm-lock.yaml` 增加图标包 ` "@iconify-json/simple-icons": "^1.2.48"`。

---

## 📝 使用说明
- 开发前建议运行：
  ```bash
  pnpm install
  pnpm dev
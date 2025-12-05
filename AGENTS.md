# AGENTS 变更记录（余烬汉化版）  

## 当前环境 / 说明  
- 仓库：余烬（Embers）Owlbear Rodeo 扩展，正在进行完整中文本地化。  
- 维护人：Codex（自动化助手）。  

## 本次会话已完成内容  
- `public/manifest.json`：名称、描述、主页链接、按钮标题均汉化，并指向新仓库地址。  
- `index.html`：页面语言与标题改为中文。  
- `README.md`：重写为中文说明，包含安装步骤、来源说明与版权提示。  
- UI 文档与教程页：`src/views/Docs.tsx`、`Tutorials.tsx`、`Listings.tsx` 文字全部汉化。  
- 侧栏与弹窗：  
  - `SpellSelectionPopover` 搜索占位符中文化。  
  - `Main.tsx` 标签标题汉化。  
  - `SpellBook.tsx`、`SpellDetails/SpellBanner.tsx`、`SpellDetails/index.tsx`、`CustomSpells.tsx`、`Settings.tsx` 已汉化主要文案、提示、标题；新增中文注释说明文件用途。  
- 其他：遵循中文注释规范，为主要文件补充用途说明。  

## 待办（下一步优先）  
1. 翻译法术数据 `src/assets/spells_record.json`：法术名、参数名、选项标签等用户可见文本。  
2. 继续清理 UI 残留英文：`SceneControls.tsx`、`AssetPicker.tsx`、`effectsTool.ts` 等通知/按钮文案。  
3. README 中 CF manifest 链接示例待根据实际部署域名更新（用户确认后可改）。  
4. 代码中错误/日志消息（如 `effects/*.ts`）是否需要中文化，视用户需求决定。  

## 提交流程提醒  
- 完成修改后请运行 `git add -A` 并按本地化小步提交（推荐 conventional commits，如 `docs: 汉化 README 与文档页`）。  
- 每次提交前更新本文件（AGENTS.md），保持变更记录最新。  


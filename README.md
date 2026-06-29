# AI 营销视频创作平台

这是一个不依赖 OpenAI API Key 的面试作品 MVP。

目标：用户选择营销类型，输入产品信息，上传 1-3 张图片素材，系统自动生成营销文案，并合成一条 15 秒 9:16 竖屏宣传视频。

## 1. 你需要先安装什么

打开 PowerShell，逐条运行：

```powershell
node --version
npm --version
ffmpeg -version
```

如果 `ffmpeg -version` 报错，安装 FFmpeg：

```powershell
winget install --id Gyan.FFmpeg -e
```

安装后关闭 PowerShell，重新打开，再运行：

```powershell
ffmpeg -version
```

## 2. 安装项目依赖

```powershell
cd E:\OpenMontage\marketing-video-platform
npm install
```

## 3. 启动网站

```powershell
cd E:\OpenMontage\marketing-video-platform
npm run dev
```

浏览器打开：

```text
http://127.0.0.1:3000
```

## 4. 使用流程

1. 选择营销类型：新品发布、痛点转化、限时促销、品牌种草、活动招募。
2. 填产品名称。
3. 填产品卖点，每行一个。
4. 填目标人群。
5. 填风格关键词。
6. 上传 1-3 张图片素材，支持 JPG、PNG、WebP。
7. 点击“生成视频”。
8. 生成完成后，在中间预览区查看 9:16 视频。
9. 点击“下载 MP4”保存视频。

## 5. 当前 MVP 做了什么

- 不需要 OpenAI API Key。
- 不需要用户懂视频剪辑。
- 上传素材会保存到 `public/generated/<任务ID>`。
- 本地模板会根据营销类型生成文案。
- Remotion 会把素材、文案、动效合成 15 秒竖屏视频。
- 视频中间区域会显示上传素材，不再是空白背景。

## 6. 文件结构

```text
app/                    Next.js 页面和接口
components/             AI 视频创作工作台前端组件
lib/localGenerator.ts   本地营销文案模板引擎
lib/pipeline.ts         任务生成流程
lib/renderVideo.ts      Remotion 渲染调用
remotion/               9:16 竖屏视频模板
public/generated/       上传素材，不提交 Git
public/renders/         最终 MP4，不提交 Git
data/jobs/              每次生成任务的 JSON 记录，不提交 Git
```

## 7. 核心流程

```text
营销类型 + 产品输入 + 图片素材
-> 本地模板生成文案
-> 保存素材并生成 Remotion props
-> Remotion 合成 15 秒 9:16 MP4
-> 页面预览和下载
```

## 8. 验证命令

```powershell
cd E:\OpenMontage\marketing-video-platform
npm run typecheck
npm run render:sample
```
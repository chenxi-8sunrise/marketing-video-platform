export function requireOpenAIKey() {
  throw new Error("当前版本是本地模板模式，不需要 OpenAI API Key。");
}

export function textModel() {
  return "local-template";
}

export function imageModel() {
  return "local-template";
}

export function videoModel() {
  return "local-template";
}

export function videoGenerationEnabled() {
  return false;
}

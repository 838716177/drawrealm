import httpx
import json
import asyncio
from typing import Optional, AsyncGenerator

from ..core.config import get_settings

settings = get_settings()

MAX_RETRIES = 3
RETRY_DELAY = 2.0


class AIServiceError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class AIService:
    def __init__(self):
        self.base_url = settings.OPENROUTER_BASE_URL
        self.default_model = settings.OPENROUTER_DEFAULT_MODEL
        self.image_model = settings.OPENROUTER_IMAGE_MODEL
        self.video_model = settings.OPENROUTER_VIDEO_MODEL
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(120.0, connect=30.0),
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=20),
            )
        return self._client

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }

    async def _post_with_retry(self, endpoint: str, payload: dict) -> dict:
        last_error = None

        for attempt in range(MAX_RETRIES):
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=30.0)) as client:
                    response = await client.post(
                        f"{self.base_url}{endpoint}",
                        headers=self._headers(),
                        json=payload,
                    )
                    if response.status_code == 200:
                        return response.json()
                    if response.status_code == 429:
                        await asyncio.sleep(RETRY_DELAY * (attempt + 1))
                        continue
                    error_body = response.text[:500]
                    raise AIServiceError(
                        f"AI API error {response.status_code}: {error_body}",
                        status_code=response.status_code,
                    )
            except (httpx.ConnectError, httpx.ReadError, httpx.RemoteProtocolError) as e:
                last_error = str(e)
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_DELAY * (attempt + 1))
                continue
            except AIServiceError:
                raise

        raise AIServiceError(
            f"AI服务连接失败（已重试{MAX_RETRIES}次）: {last_error}",
            status_code=503,
        )

    async def chat_completion(
        self,
        messages: list[dict],
        model: Optional[str] = None,
        temperature: float = 0.8,
        max_tokens: int = 4096,
    ) -> dict:
        payload = {
            "model": model or self.default_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        return await self._post_with_retry("/chat/completions", payload)

    async def chat_completion_stream(
        self,
        messages: list[dict],
        model: Optional[str] = None,
        temperature: float = 0.8,
        max_tokens: int = 4096,
    ) -> AsyncGenerator[str, None]:
        client = await self._get_client()
        payload = {
            "model": model or self.default_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        for attempt in range(MAX_RETRIES):
            try:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers=self._headers(),
                    json=payload,
                ) as response:
                    if response.status_code != 200:
                        error_body = await response.aread()
                        raise AIServiceError(f"AI API error {response.status_code}: {error_body[:500]}")
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]
                            if data == "[DONE]":
                                return
                            try:
                                chunk = json.loads(data)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                            except (json.JSONDecodeError, KeyError, IndexError):
                                continue
                    return
            except (httpx.ConnectError, httpx.ReadError, httpx.RemoteProtocolError) as e:
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_DELAY * (attempt + 1))
                    continue
                raise AIServiceError(f"AI流式连接失败: {e}", status_code=503)

    async def generate_worldview(
        self, user_input: str, style: str = "史诗奇幻", stream: bool = False
    ):
        system_prompt = """你是一个世界构建大师，擅长创建宏大、细腻、自洽的幻想世界设定。
请根据用户的描述，生成一个完整的互动故事世界设定。输出使用Markdown格式，包含以下结构：

## 世界观概述
[用一段极具画面感的文字描述这个世界的基本设定]

## 时代背景
[当前故事发生的时代，世界处于什么状态]

## 世界法则
[这个世界独特的物理或魔法规则，至少3条]

## 地理环境
[世界的主要地理特征，关键地点]

## 主要种族
[这个世界存在的主要智慧种族及其特征]

## 势力格局
[主要的国家、组织、势力及其关系]

## 历史脉络
[重大历史事件和传说]

## 文化特色
[独特的文化、习俗、信仰体系]

要求：语言优美、设定独特、逻辑自洽。让读者仿佛置身其中。"""

        user_prompt = f"故事风格：{style}\n用户想法：{user_input}\n请生成完整的世界观设定。"

        if stream:
            return self.chat_completion_stream(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.9,
                max_tokens=4096,
            )
        else:
            response = await self.chat_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.9,
                max_tokens=4096,
            )
            content = response["choices"][0]["message"]["content"]
            model = response.get("model", self.default_model)
            tokens = response.get("usage", {}).get("total_tokens", 0)
            return content, model, tokens

    async def generate_opening_story(
        self, worldview: str, worldbook_title: str, character_context: str = "", stream: bool = False
    ):
        system_prompt = """你是一位沉浸式互动小说的叙事大师。根据世界观设定和主角设定，写出一个引人入胜的故事开场。
开场要求：
1. 严格以给定的角色为主角，根据角色的性格和背景来展开故事
2. 用生动的感官细节营造氛围
3. 立即引入角色和冲突
4. 在末尾设置一个让玩家必须做出选择的情境
5. 保持悬念，让玩家渴望继续探索
6. 故事要体现角色的个性特征和能力

故事长度：800-1500字"""

        char_part = f"主角设定：\n{character_context}\n\n" if character_context else "角色：待定"
        user_prompt = f"世界名称：{worldbook_title}\n{char_part}\n世界观设定：\n{worldview[:3000]}\n\n请根据以上设定和主角信息，写出一个沉浸式的互动故事开场。"

        if stream:
            return self.chat_completion_stream(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.9,
                max_tokens=3000,
            )
        else:
            response = await self.chat_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.9,
                max_tokens=3000,
            )
            content = response["choices"][0]["message"]["content"]
            model = response.get("model", self.default_model)
            tokens = response.get("usage", {}).get("total_tokens", 0)
            return content, model, tokens

    async def generate_scene_description(
        self, worldview: str, scene_name: str, scene_context: str, previous_context: str = ""
    ) -> str:
        system_prompt = """你是场景叙事的专家。根据世界观和前后文，用生动的文字描述当前场景。
输出格式（Markdown）:

## 场景：[场景名]
[2-3段描述性文字，运用五感描写，营造沉浸感]

## 氛围
[场景的情绪基调、光线、声音、气味]

## 关键元素
- [元素1]
- [元素2]
- [元素3]

## 剧情推进
[当前场景发生了什么，故事的转折点]

## 分支选项
[根据当前情境，提供3-4个玩家可以选择的方向]"""

        response = await self.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"世界观：\n{worldview[:2000]}\n\n前情提要：\n{previous_context or '故事开始'}\n\n当前场景：{scene_name}\n场景背景：{scene_context}\n\n请描述这个场景并提供分支选项。"},
            ],
            temperature=0.85,
            max_tokens=2500,
        )
        return response["choices"][0]["message"]["content"]

    async def generate_branches(
        self, worldview: str, scene_description: str, num_branches: int = 3
    ) -> list[dict]:
        system_prompt = f"""根据场景描述，生成{num_branches}个互斥但又合理的剧情分支选项。
每个选项包含：
- choice_text: 选项文字（10-30字，有吸引力）
- choice_id: 英文标识符
- description: 该选项会导向的叙事方向（30-80字）
- is_hot: 是否最推荐选择（只有一个为true）

必须是JSON数组格式输出，不要用markdown代码块包裹。"""

        response = await self.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"世界观：\n{worldview[:1500]}\n\n场景描述：\n{scene_description[:2000]}\n\n请生成{num_branches}个分支选项，纯JSON格式。"},
            ],
            temperature=0.9,
            max_tokens=1500,
        )
        content = response["choices"][0]["message"]["content"]
        try:
            content = content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[-1]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
            branches = json.loads(content)
            if isinstance(branches, list):
                return branches
        except (json.JSONDecodeError, IndexError):
            pass
        return [
            {"choice_text": "继续前进", "choice_id": "continue", "description": "沿着当前道路继续故事的推进", "is_hot": True},
            {"choice_text": "谨慎探索", "choice_id": "explore", "description": "更加小心地探索周围环境，寻找隐藏的线索", "is_hot": False},
            {"choice_text": "另辟蹊径", "choice_id": "alternate", "description": "尝试一条与众不同的道路，可能带来意外的发现", "is_hot": False},
        ]

    async def generate_visual_prompt(self, scene_description: str, style: str = "cinematic") -> str:
        system_prompt = "你是一个视觉提示词专家。根据场景描述，生成高质量的图片/视频生成提示词（英文）。使用 cinematic, 4K, detailed 等高质量关键词。长度50-150词。仅输出提示词。"

        response = await self.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"场景描述：\n{scene_description}\n风格：{style}\n请生成英文图片/视频生成提示词。"},
            ],
            temperature=0.7,
            max_tokens=300,
        )
        return response["choices"][0]["message"]["content"].strip()

    async def generate_image(self, prompt: str, size: str = "1024x1024") -> dict:
        return {
            "image_url": "",
            "prompt_used": prompt,
            "message": "图片生成API暂不可用，请使用AI生成世界后通过视觉提示词自行生成"
        }

    async def generate_video(self, image_url: str, prompt: str = "", duration: int = 5) -> dict:
        return {
            "video_url": image_url,
            "status": "placeholder",
            "message": "视频生成API暂不可用，视频播放器将展示场景画面和文字"
        }

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


ai_service = AIService()

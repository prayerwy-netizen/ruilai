import { GoogleGenAI, Type } from "@google/genai";
import * as XLSX from 'xlsx';

// Helper to convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to parse Excel file and convert to text
export const parseExcelToText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        let textContent = '';

        // Iterate through all sheets
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          textContent += `\n\n=== 工作表: ${sheetName} ===\n\n`;

          // Convert to CSV format for better structure
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          textContent += csv;

          // Also try to extract as JSON for structured data
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (json.length > 0) {
            textContent += '\n\n[结构化数据]\n';
            textContent += JSON.stringify(json, null, 2);
          }
        });

        console.log("Excel 解析完成，文本长度:", textContent.length);
        resolve(textContent);
      } catch (error) {
        console.error("Excel 解析错误:", error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const generateChatResponse = async (
  prompt: string,
  imageFile: File | null,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    // 优先从 localStorage 读取（用户在浏览器中配置的）
    // 如果没有，则从环境变量读取（本地开发时使用）
    let apiKey = localStorage.getItem('GEMINI_API_KEY');

    if (!apiKey && import.meta.env.VITE_GEMINI_API_KEY) {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log("Using API Key from environment variable (local development)");
    }

    console.log("API Key loaded:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT SET");

    if (!apiKey) {
      return "Error: 请先在右上角设置 API Key。\n\n您可以从 Google AI Studio 获取免费的 API Key: https://aistudio.google.com/apikey";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use gemini-3-pro-preview for complex reasoning and thinking capabilities
    // as requested for the "Coal Mine Decision Support" context.
    const modelId = "gemini-3-pro-preview";

    const parts: any[] = [];
    
    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }
    
    parts.push({ text: prompt });

    const contents = {
        role: 'user',
        parts: parts
    };

    // Construct the full history for context, excluding the current message which is in `contents`
    // Note: In a real app, we'd manage the chat session more persistently.
    // Here we treat it as a single turn with history context if provided, 
    // but for simplicity in this demo, we often just send the new content.
    // To properly use history with the SDK's chat feature:
    
    // System instruction to act as a Coal Mine expert
    const systemInstruction = `你是“睿来智能体”，一位专业的煤矿生产决策智能助手。
    你的职责是帮助矿领导通过分析数据来解决生产问题。
    
    功能重点：
    1. 根因追溯：当用户问产量下降或设备故障时，分析原因（设备->检修->人员）。
    2. 预防建议：基于历史给出维护建议。
    3. 风格：专业、简洁、客观。
    4. 格式：使用Markdown格式化输出，关键数据加粗。`;

    const result = await ai.models.generateContent({
      model: modelId,
      contents: contents, // For this demo, we are sending the current turn. Ideally use chat.sendMessage
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: {
            thinkingBudget: 32768,
        },
        temperature: 0,
      },
    });

    return result.text || "未能生成回答，请重试。";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return `系统遇到错误: ${(error as Error).message}`;
  }
};

export const analyzeDocument = async (textOrFile: string | File): Promise<any> => {
    // Extract entities and relations from a document (text or file)
    // Supports text, Excel, PDF, and other file formats via Gemini's multimodal capabilities
    try {
        console.log("=== analyzeDocument 开始 ===");
        console.log("输入类型:", textOrFile instanceof File ? "File" : "Text");
        if (textOrFile instanceof File) {
            console.log("文件名:", textOrFile.name);
            console.log("文件类型:", textOrFile.type);
            console.log("文件大小:", textOrFile.size, "bytes");
        }

        // 优先从 localStorage 读取，如果没有则从环境变量读取
        let apiKey = localStorage.getItem('GEMINI_API_KEY');
        if (!apiKey && import.meta.env.VITE_GEMINI_API_KEY) {
            apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            console.log("使用环境变量中的 API Key");
        } else if (apiKey) {
            console.log("使用 localStorage 中的 API Key");
        }

        if(!apiKey) {
            console.error("错误: 没有找到 API Key");
            throw new Error("No API Key");
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `请分析这份煤矿相关文档，提取其中的关键实体和关系。

实体类型包括：
- 设备（如采煤机、液压支架、皮带机等）
- 人员（如班长、技术员、操作工等）
- 事件（如故障、检修、产量变化等）
- 区域（如工作面、掘进面、巷道等）
- 流程（如工艺流程、操作步骤等）

关系类型包括：
- 负责、管理、操作
- 位于、属于
- 导致、影响
- 关联、相关
- 上下游、依赖

请返回JSON格式:
{
  "entities": [{"name": "实体名称", "type": "实体类型"}],
  "relations": [{"source": "源实体名称", "target": "目标实体名称", "type": "关系类型"}]
}

请尽可能详细地提取所有有用的实体和关系。`;

        let contents: any;
        let documentText: string;

        // Check if input is a File or text string
        if (textOrFile instanceof File) {
            // Check if it's an Excel file
            const isExcel = textOrFile.name.endsWith('.xlsx') ||
                           textOrFile.name.endsWith('.xls') ||
                           textOrFile.type.includes('spreadsheet');

            if (isExcel) {
                console.log("检测到 Excel 文件，使用 xlsx 库解析...");
                // Parse Excel to text first
                documentText = await parseExcelToText(textOrFile);
                console.log("Excel 解析为文本，长度:", documentText.length);

                // Send as text
                contents = {
                    role: 'user',
                    parts: [{ text: prompt + `\n\n文档内容:\n${documentText.substring(0, 10000)}` }]
                };
            } else {
                console.log("转换文件为 Base64...");
                // For other files (PDF, images, etc.), convert to base64 and send to Gemini
                const filePart = await fileToGenerativePart(textOrFile);
                console.log("文件转换完成，MIME 类型:", filePart.inlineData.mimeType);
                console.log("Base64 数据长度:", filePart.inlineData.data.length);
                contents = {
                    role: 'user',
                    parts: [filePart, { text: prompt }]
                };
            }
        } else {
            console.log("使用文本内容，长度:", textOrFile.length);
            // For plain text
            documentText = textOrFile;
            contents = {
                role: 'user',
                parts: [{ text: prompt + `\n\n文档内容: ${documentText.substring(0, 8000)}` }]
            };
        }

        console.log("调用 Gemini API...");
        const result = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        entities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    type: { type: Type.STRING }
                                }
                            }
                        },
                        relations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    source: { type: Type.STRING },
                                    target: { type: Type.STRING },
                                    type: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log("Gemini API 响应:", result.text);
        const parsed = JSON.parse(result.text || "{}");
        console.log("解析结果 - 实体数量:", parsed.entities?.length || 0);
        console.log("解析结果 - 关系数量:", parsed.relations?.length || 0);
        console.log("=== analyzeDocument 完成 ===");

        return parsed;
    } catch (e) {
        console.error("=== analyzeDocument 错误 ===");
        console.error("错误详情:", e);
        console.error("错误消息:", (e as Error).message);
        console.error("错误堆栈:", (e as Error).stack);
        throw e; // 重新抛出错误以便上层处理
    }
}
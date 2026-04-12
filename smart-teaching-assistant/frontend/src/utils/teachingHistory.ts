export type ChatMessage = {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  };
  
  const STORAGE_KEY = "teaching_chat_history";
  
  /**
   * 🔑 Identify lesson by uploaded PDF
   */
  const getLessonKey = (): string => {
    const file = (window as any).currentUploadedFile;
    return file?.name ?? "default-lesson";
  };
  
  /**
   * 📥 Load chat history for current lesson
   */
  export const loadChatHistory = (): ChatMessage[] => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return all[getLessonKey()] || [];
    } catch {
      return [];
    }
  };
  
  /**
   * 📤 Append a new chat message
   */
  export const appendChatMessage = (msg: ChatMessage) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const key = getLessonKey();
  
      if (!all[key]) {
        all[key] = [];
      }
  
      all[key].push(msg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // silent fail (do not break UI)
    }
  };
  
  /**
   * 🧹 Clear chat for current lesson (not used yet)
   */
  export const clearChatHistory = () => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      delete all[getLessonKey()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  };
  
import { apiClient } from "./apiClient";

export type Subject = { id: number; code: string; name: string; description: string; modules: number };
export type Module = { id: number; subject_id: number; title: string; order_index: number };
export type Question = {
  id: number;
  subject_id: number;
  module_id: number;
  subject_name: string;
  module_title: string;
  text: string;
  marks: number;
  difficulty: string;
  bloom_level: string;
  question_type: string;
  keywords: string;
  model_answer: string;
  usage_count: number;
  is_active: boolean;
};
export type Template = {
  id: number;
  name: string;
  duration_minutes: number;
  total_marks: number;
  sections: number;
  instructions: string;
};
export type PaperItem = {
  id: number;
  question_id: number;
  section: string;
  sequence: number;
  marks: number;
  text: string;
  difficulty: string;
  bloom_level: string;
};
export type Paper = {
  id: number;
  title: string;
  subject_id: number;
  subject_name: string;
  total_marks: number;
  duration_minutes: number;
  status: string;
  created_at: string;
  items: PaperItem[];
};
export type Settings = {
  institution_name: string;
  logo_url: string;
  similarity_threshold: number;
  default_instructions: string;
};

export type QuestionPayload = {
  subject_id: number;
  module_id: number;
  text: string;
  marks: number;
  difficulty: string;
  bloom_level: string;
  question_type: string;
  keywords: string;
  model_answer: string;
  is_active: boolean;
};

export const examforgeApi = {
  dashboard: async () => (await apiClient.get("/dashboard")).data,
  subjects: async () => (await apiClient.get<Subject[]>("/subjects")).data,
  modules: async () => (await apiClient.get<Module[]>("/modules")).data,
  questions: async () => (await apiClient.get<Question[]>("/questions?limit=500")).data,
  templates: async () => (await apiClient.get<Template[]>("/templates")).data,
  papers: async () => (await apiClient.get<Paper[]>("/papers")).data,
  paper: async (id: number) => (await apiClient.get<Paper>(`/papers/${id}`)).data,
  analytics: async () => (await apiClient.get("/analytics")).data,
  settings: async () => (await apiClient.get<Settings>("/settings")).data,
  auditLogs: async () => (await apiClient.get("/audit-logs")).data,
  createQuestion: async (payload: QuestionPayload) =>
    (await apiClient.post<Question>("/questions", payload)).data,
  updateQuestion: async (id: number, payload: Partial<QuestionPayload>) =>
    (await apiClient.put<Question>(`/questions/${id}`, payload)).data,
  deleteQuestion: async (id: number) => {
    await apiClient.delete(`/questions/${id}`);
  },
  createTemplate: async (payload: Omit<Template, "id">) =>
    (await apiClient.post("/templates", payload)).data,
  generatePaper: async (payload: {
    title: string;
    subject_id: number;
    module_ids: number[];
    total_marks: number;
    duration_minutes: number;
    sections: number;
    difficulty_distribution: Record<string, number>;
    bloom_distribution: Record<string, number>;
    internal_choices: boolean;
  }) => (await apiClient.post<Paper>("/generator", payload)).data,
  importQuestions: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return (
      await apiClient.post("/import/questions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  },
  updateSettings: async (payload: Settings) => (await apiClient.put("/settings", payload)).data,
};

export async function downloadExport(paperId: number, type: "pdf" | "docx") {
  const response = await apiClient.get(`/papers/${paperId}/export/${type}`, { responseType: "blob" });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `paper-${paperId}.${type}`;
  link.click();
  window.URL.revokeObjectURL(url);
}

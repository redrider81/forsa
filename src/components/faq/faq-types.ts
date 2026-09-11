export type FaqEntry = {
  question: string;
  answer: string[];
  contactEmail?: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  summary: string;
  entries: FaqEntry[];
};

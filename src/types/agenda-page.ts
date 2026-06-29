export type AgendaPageContent = {
  pageKey: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel?: string | null;
  buttonHref?: string | null;
  sections: Array<{
    title: string;
    text?: string;
  }>;
  items: string[];
  serviceSlugs: string[];
};

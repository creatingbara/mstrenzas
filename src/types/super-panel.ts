export type AppThemeSettings = {
  id: string;
  logoUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  darkPrimaryColor: string;
  darkBackgroundColor: string;
  darkTextColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: string;
  buttonStyle: string;
  cardStyle: string;
  updatedAt: string | null;
};

export type AppNavigationItem = {
  id: string;
  label: string;
  href: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  opensNewTab: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AppPageSection = {
  id: string;
  pageKey: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  buttonLabel: string;
  buttonUrl: string;
  sortOrder: number;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AppSeoSettings = {
  id: string;
  pageKey: string;
  title: string;
  description: string;
  keywords: string;
  ogImageUrl: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AppSeoSettingsByPage = Record<string, AppSeoSettings>;

export type AppFooterSettings = {
  id: string;
  businessName: string;
  description: string;
  whatsapp: string;
  instagramUrl: string;
  address: string;
  schedule: string;
  copyrightText: string;
  updatedAt: string | null;
};

export type AppAdminUiSettings = {
  id: string;
  adminTitle: string;
  adminSubtitle: string;
  sidebarLogoUrl: string;
  sidebarColor: string;
  sidebarAccentColor: string;
  updatedAt: string | null;
};

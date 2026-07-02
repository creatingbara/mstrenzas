import { SuperPanelClient } from "@/components/admin/SuperPanelClient";
import { requireSuperAdmin } from "@/lib/auth/require-auth";
import {
  getAllEditablePageSections,
  getAllSeoSettings,
  getAppAdminUiSettings,
  getAppFooterSettings,
  getAppNavigationItems,
  getAppThemeSettings
} from "@/lib/super-panel";

export const metadata = {
  title: "Super Panel | Panel M&S Trenzas"
};

export default async function SuperPanelPage() {
  await requireSuperAdmin("/admin/super-panel");
  const [theme, sections, navigation, seo, footer, adminUi] = await Promise.all([
    getAppThemeSettings(),
    getAllEditablePageSections(),
    getAppNavigationItems(),
    getAllSeoSettings(),
    getAppFooterSettings(),
    getAppAdminUiSettings()
  ]);

  return (
    <section>
      <SuperPanelClient
        initialTheme={theme}
        initialSections={sections}
        initialNavigation={navigation}
        initialSeo={seo}
        initialFooter={footer}
        initialAdminUi={adminUi}
      />
    </section>
  );
}

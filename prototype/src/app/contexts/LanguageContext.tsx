import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type Language = "en" | "nl" | "bg";

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "GB" },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands", flag: "NL" },
  { code: "bg", label: "Bulgarian", nativeLabel: "Български", flag: "BG" },
];

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.browseSpaces": "Browse All Spaces",
    "nav.templateLibrary": "Template Library",
    "nav.createSpace": "Create Space",
    "nav.invitations": "Invitations",
    "nav.mySpaces": "My Spaces",
    "nav.activityView": "Activity View",

    // Header
    "header.search": "Search spaces, challenges...",
    "header.notifications": "Notifications",
    "header.messages": "Messages",
    "header.markAllRead": "Mark all as read",
    "header.manageSettings": "Manage Settings",
    "header.noNotifications": "No new notifications",
    "header.switchApp": "Switch App",
    "header.myAccount": "My Account",
    "header.profile": "Profile",
    "header.designSystem": "Design System",
    "header.settings": "Settings",
    "header.logOut": "Log out",
    "header.language": "Language",

    // Dashboard
    "dashboard.welcome": "Welcome back",
    "dashboard.subtitle": "Here's what's happening across your spaces",
    "dashboard.recentSpaces": "Recent Spaces",
    "dashboard.exploreAll": "Explore all your Spaces",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.activityFeed": "Activity Feed",
    "dashboard.viewAll": "View all",
    "dashboard.myContributions": "My Contributions",
    "dashboard.upcoming": "Upcoming",

    // Browse Spaces
    "spaces.title": "Explore Spaces",
    "spaces.subtitle": "Discover and join innovation spaces across the ecosystem",
    "spaces.search": "Search spaces...",
    "spaces.sortBy": "Sort by",
    "spaces.filters": "Filters",
    "spaces.allTypes": "All types",
    "spaces.allPrivacy": "All privacy",
    "spaces.loadMore": "Load more spaces",
    "spaces.showing": "Showing",
    "spaces.of": "of",
    "spaces.spaces": "spaces",
    "spaces.noResults": "No spaces found",
    "spaces.noResultsDesc": "Try adjusting your search or filters",
    "spaces.clearFilters": "Clear all filters",
    "spaces.members": "members",

    // Space
    "space.about": "About",
    "space.community": "Community",
    "space.subspaces": "Subspaces",
    "space.knowledgeBase": "Knowledge Base",
    "space.settings": "Settings",
    "space.joinSpace": "Join Space",
    "space.share": "Share",

    // Templates
    "templates.title": "Template Library",
    "templates.subtitle": "Ready-to-use templates for your innovation journey",
    "templates.search": "Search templates...",
    "templates.all": "All",
    "templates.packs": "Packs",
    "templates.individual": "Individual",

    // User
    "user.profile": "Profile",
    "user.account": "Account",
    "user.membership": "Membership",
    "user.organizations": "Organizations",
    "user.notifications": "Notifications",
    "user.general": "General",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.public": "Public",
    "common.private": "Private",
    "common.in": "in",
    "common.leads": "Leads",

    // Footer
    "footer.copyright": "Alkemio Foundation",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy",
    "footer.docs": "Docs",
    "footer.support": "Support",
    "footer.about": "About",
  },

  nl: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.browseSpaces": "Alle ruimtes bekijken",
    "nav.templateLibrary": "Sjabloonbibliotheek",
    "nav.createSpace": "Ruimte aanmaken",
    "nav.invitations": "Uitnodigingen",
    "nav.mySpaces": "Mijn ruimtes",
    "nav.activityView": "Activiteitenoverzicht",

    // Header
    "header.search": "Zoek ruimtes, uitdagingen...",
    "header.notifications": "Meldingen",
    "header.messages": "Berichten",
    "header.markAllRead": "Alles als gelezen markeren",
    "header.manageSettings": "Instellingen beheren",
    "header.noNotifications": "Geen nieuwe meldingen",
    "header.switchApp": "App wisselen",
    "header.myAccount": "Mijn account",
    "header.profile": "Profiel",
    "header.designSystem": "Ontwerpsysteem",
    "header.settings": "Instellingen",
    "header.logOut": "Uitloggen",
    "header.language": "Taal",

    // Dashboard
    "dashboard.welcome": "Welkom terug",
    "dashboard.subtitle": "Dit is wat er gebeurt in je ruimtes",
    "dashboard.recentSpaces": "Recente ruimtes",
    "dashboard.exploreAll": "Bekijk al je ruimtes",
    "dashboard.quickActions": "Snelle acties",
    "dashboard.activityFeed": "Activiteitenfeed",
    "dashboard.viewAll": "Alles bekijken",
    "dashboard.myContributions": "Mijn bijdragen",
    "dashboard.upcoming": "Aankomend",

    // Browse Spaces
    "spaces.title": "Verken ruimtes",
    "spaces.subtitle": "Ontdek en neem deel aan innovatieruimtes in het ecosysteem",
    "spaces.search": "Zoek ruimtes...",
    "spaces.sortBy": "Sorteren op",
    "spaces.filters": "Filters",
    "spaces.allTypes": "Alle typen",
    "spaces.allPrivacy": "Alle privacy",
    "spaces.loadMore": "Meer ruimtes laden",
    "spaces.showing": "Toont",
    "spaces.of": "van",
    "spaces.spaces": "ruimtes",
    "spaces.noResults": "Geen ruimtes gevonden",
    "spaces.noResultsDesc": "Pas je zoekopdracht of filters aan",
    "spaces.clearFilters": "Alle filters wissen",
    "spaces.members": "leden",

    // Space
    "space.about": "Over",
    "space.community": "Community",
    "space.subspaces": "Subruimtes",
    "space.knowledgeBase": "Kennisbank",
    "space.settings": "Instellingen",
    "space.joinSpace": "Deelnemen",
    "space.share": "Delen",

    // Templates
    "templates.title": "Sjabloonbibliotheek",
    "templates.subtitle": "Kant-en-klare sjablonen voor je innovatietraject",
    "templates.search": "Zoek sjablonen...",
    "templates.all": "Alles",
    "templates.packs": "Pakketten",
    "templates.individual": "Individueel",

    // User
    "user.profile": "Profiel",
    "user.account": "Account",
    "user.membership": "Lidmaatschap",
    "user.organizations": "Organisaties",
    "user.notifications": "Meldingen",
    "user.general": "Algemeen",

    // Common
    "common.save": "Opslaan",
    "common.cancel": "Annuleren",
    "common.delete": "Verwijderen",
    "common.edit": "Bewerken",
    "common.create": "Aanmaken",
    "common.close": "Sluiten",
    "common.back": "Terug",
    "common.next": "Volgende",
    "common.search": "Zoeken",
    "common.loading": "Laden...",
    "common.public": "Openbaar",
    "common.private": "Prive",
    "common.in": "in",
    "common.leads": "Leads",

    // Footer
    "footer.copyright": "Alkemio Foundation",
    "footer.terms": "Voorwaarden",
    "footer.privacy": "Privacy",
    "footer.docs": "Documentatie",
    "footer.support": "Ondersteuning",
    "footer.about": "Over ons",
  },

  bg: {
    // Navigation
    "nav.dashboard": "Табло",
    "nav.browseSpaces": "Преглед на пространства",
    "nav.templateLibrary": "Библиотека с шаблони",
    "nav.createSpace": "Създай пространство",
    "nav.invitations": "Покани",
    "nav.mySpaces": "Моите пространства",
    "nav.activityView": "Преглед на активност",

    // Header
    "header.search": "Търсене на пространства, предизвикателства...",
    "header.notifications": "Известия",
    "header.messages": "Съобщения",
    "header.markAllRead": "Маркирай всички като прочетени",
    "header.manageSettings": "Управление на настройки",
    "header.noNotifications": "Няма нови известия",
    "header.switchApp": "Смяна на приложение",
    "header.myAccount": "Моят акаунт",
    "header.profile": "Профил",
    "header.designSystem": "Дизайн система",
    "header.settings": "Настройки",
    "header.logOut": "Изход",
    "header.language": "Език",

    // Dashboard
    "dashboard.welcome": "Добре дошли отново",
    "dashboard.subtitle": "Ето какво се случва в пространствата ви",
    "dashboard.recentSpaces": "Скорошни пространства",
    "dashboard.exploreAll": "Разгледай всички пространства",
    "dashboard.quickActions": "Бързи действия",
    "dashboard.activityFeed": "Лента с активност",
    "dashboard.viewAll": "Виж всички",
    "dashboard.myContributions": "Моите приноси",
    "dashboard.upcoming": "Предстоящи",

    // Browse Spaces
    "spaces.title": "Разглеждане на пространства",
    "spaces.subtitle": "Открийте и се присъединете към иновационни пространства в екосистемата",
    "spaces.search": "Търсене на пространства...",
    "spaces.sortBy": "Сортирай по",
    "spaces.filters": "Филтри",
    "spaces.allTypes": "Всички типове",
    "spaces.allPrivacy": "Всички нива",
    "spaces.loadMore": "Зареди още пространства",
    "spaces.showing": "Показани",
    "spaces.of": "от",
    "spaces.spaces": "пространства",
    "spaces.noResults": "Няма намерени пространства",
    "spaces.noResultsDesc": "Опитайте да промените търсенето или филтрите",
    "spaces.clearFilters": "Изчисти всички филтри",
    "spaces.members": "члена",

    // Space
    "space.about": "За нас",
    "space.community": "Общност",
    "space.subspaces": "Подпространства",
    "space.knowledgeBase": "База знания",
    "space.settings": "Настройки",
    "space.joinSpace": "Присъедини се",
    "space.share": "Сподели",

    // Templates
    "templates.title": "Библиотека с шаблони",
    "templates.subtitle": "Готови за използване шаблони за вашето иновационно пътуване",
    "templates.search": "Търсене на шаблони...",
    "templates.all": "Всички",
    "templates.packs": "Пакети",
    "templates.individual": "Индивидуални",

    // User
    "user.profile": "Профил",
    "user.account": "Акаунт",
    "user.membership": "Членство",
    "user.organizations": "Организации",
    "user.notifications": "Известия",
    "user.general": "Общи",

    // Common
    "common.save": "Запази",
    "common.cancel": "Отказ",
    "common.delete": "Изтрий",
    "common.edit": "Редактирай",
    "common.create": "Създай",
    "common.close": "Затвори",
    "common.back": "Назад",
    "common.next": "Напред",
    "common.search": "Търсене",
    "common.loading": "Зареждане...",
    "common.public": "Публично",
    "common.private": "Частно",
    "common.in": "в",
    "common.leads": "Лидове",

    // Footer
    "footer.copyright": "Alkemio Foundation",
    "footer.terms": "Условия",
    "footer.privacy": "Поверителност",
    "footer.docs": "Документация",
    "footer.support": "Поддръжка",
    "footer.about": "За нас",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: LanguageOption[];
  currentLanguage: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem("alkemio-language");
      if (stored && (stored === "en" || stored === "nl" || stored === "bg")) {
        return stored as Language;
      }
    } catch {}
    return "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("alkemio-language", lang);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] ?? translations.en?.[key] ?? key;
    },
    [language]
  );

  const currentLanguage = useMemo(
    () => LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0],
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: LANGUAGES,
      currentLanguage,
    }),
    [language, setLanguage, t, currentLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
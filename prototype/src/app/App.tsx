import { LanguageProvider } from "./contexts/LanguageContext";
import { MessagingHubProvider } from "./contexts/MessagingHubContext";
import { SearchProvider } from "./contexts/SearchContext";
import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <LanguageProvider>
      <MessagingHubProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </MessagingHubProvider>
    </LanguageProvider>
  );
}
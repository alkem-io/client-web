import { Outlet } from "react-router";
import { SearchOverlay } from "@/app/components/search/SearchOverlay";

/**
 * Root wrapper rendered inside RouterProvider.
 * Provides router-dependent overlays (SearchOverlay needs useLocation/useNavigate).
 */
export function RootWrapper() {
  return (
    <>
      <SearchOverlay />
      <Outlet />
    </>
  );
}

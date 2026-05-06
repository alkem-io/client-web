import { RecentSpaces } from "@/app/components/dashboard/RecentSpaces";
import { ActivityFeed } from "@/app/components/dashboard/ActivityFeed";
import { DashboardSidebar } from "@/app/components/dashboard/DashboardSidebar";

export function Dashboard() {
  return (
    <div className="px-6 md:px-8 py-8 w-full">
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar — occupies the 1-col margin area + 1 more col */}
        <div className="hidden md:block col-span-2">
          <DashboardSidebar />
        </div>
        {/* Main content — 9 columns, leaving 1-col margin on right */}
        <div className="col-span-12 md:col-span-9 grid grid-cols-9 gap-6">
          <div className="col-span-9">
            <RecentSpaces />
          </div>
          <div className="col-span-9 lg:col-span-5">
            <ActivityFeed title="Latest Activity in my Spaces" type="spaces" />
          </div>
          <div className="col-span-9 lg:col-span-4">
            <ActivityFeed title="My Latest Activity" type="personal" />
          </div>
        </div>
      </div>
    </div>
  );
}

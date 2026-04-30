import { RecentSpaces } from "@/app/components/dashboard/RecentSpaces";
import { ActivityFeed } from "@/app/components/dashboard/ActivityFeed";

export function Dashboard() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-[1600px] mx-auto">
      <RecentSpaces />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActivityFeed title="Latest Activity in my Spaces" type="spaces" />
        <ActivityFeed title="My Latest Activity" type="personal" />
      </div>
    </div>
  );
}

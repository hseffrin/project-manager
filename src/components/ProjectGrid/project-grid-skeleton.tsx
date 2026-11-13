import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ProjectCardSkeleton } from "@/components/ProjectCard/project-card-skeleton";

type ProjectGridSkeletonProps = {
  // Also draws the toolbar (title, filter, sort, button), as on the home page.
  // The search results have no toolbar.
  withToolbar?: boolean;
};

// Shown while the projects load: the same layout as ProjectGrid, so the real
// content takes its place without jumping.
export function ProjectGridSkeleton({
  withToolbar = false,
}: ProjectGridSkeletonProps) {
  return (
    <div role="status" className="flex flex-col gap-5.5">
      <span className="sr-only">Carregando projetos...</span>

      {/* Same sizes as ProjectToolbar: switch + label, select and button. */}
      {withToolbar && (
        <div aria-hidden className="flex items-center gap-6">
          <Skeleton width={150} height={32} />
          <div className="ml-auto flex items-center gap-8">
            <Skeleton width={186} height={24} borderRadius={9999} />
            <Skeleton width={296} height={40} />
            <Skeleton width={184} height={40} borderRadius={9999} />
          </div>
        </div>
      )}

      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-8">
        {[0, 1, 2].map((card) => (
          <ProjectCardSkeleton key={card} />
        ))}
      </div>
    </div>
  );
}

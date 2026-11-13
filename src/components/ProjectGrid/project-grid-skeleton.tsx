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
    <div role="status" className="flex flex-col gap-8">
      <span className="sr-only">Carregando projetos...</span>

      {withToolbar && (
        <div aria-hidden className="flex items-center gap-6">
          <Skeleton width={160} height={32} />
          <div className="ml-auto flex items-center gap-6">
            <Skeleton width={176} height={24} borderRadius={9999} />
            <Skeleton width={320} height={40} />
            <Skeleton width={160} height={48} borderRadius={9999} />
          </div>
        </div>
      )}

      <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((card) => (
          <ProjectCardSkeleton key={card} />
        ))}
      </div>
    </div>
  );
}

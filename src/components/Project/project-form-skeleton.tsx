import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// One field: label above a 40px input, as in ProjectForm.
function FieldSkeleton({ labelWidth }: { labelWidth: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton width={labelWidth} height={20} />
      <Skeleton height={40} />
    </div>
  );
}

// Shown while the edit page loads the project: the same layout as
// ProjectForm (container, centered column, fields, dates side by side, cover
// and button), so the form takes its place without jumping.
export function ProjectFormSkeleton() {
  return (
    <div
      role="status"
      className="flex w-full justify-center rounded border border-brand-border px-6 py-12"
    >
      <span className="sr-only">Carregando projeto...</span>
      <div aria-hidden className="flex w-full max-w-176 flex-col gap-8">
        <FieldSkeleton labelWidth={220} />
        <FieldSkeleton labelWidth={160} />
        <div className="grid grid-cols-2 gap-10">
          <FieldSkeleton labelWidth={200} />
          <FieldSkeleton labelWidth={180} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton width={140} height={20} />
          {/* Same proportion as the cover preview (aspect-video). */}
          <Skeleton
            containerClassName="block leading-none"
            className="aspect-video"
          />
        </div>
        <Skeleton height={48} borderRadius={9999} />
      </div>
    </div>
  );
}

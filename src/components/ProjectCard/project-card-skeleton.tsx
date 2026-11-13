import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Placeholder with the shape of ProjectCard (cover, name, customer, dates),
// shown while the projects load. Decorative: the list around it announces
// the loading to screen readers.
export function ProjectCardSkeleton() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-xl border border-brand-border bg-white"
    >
      {/* Same height as the card cover (h-58, with its bottom line). */}
      <Skeleton
        height={232}
        borderRadius={0}
        // Block container without line height, so no gap shows above it.
        containerClassName="block leading-none"
      />
      <div className="p-6">
        <Skeleton width="50%" height={28} />
        <Skeleton width="33%" height={20} className="mt-1" />
        <hr className="my-4 border-black/[0.075]" />
        <div className="flex flex-col gap-4">
          {[0, 1].map((row) => (
            <div key={row} className="flex items-center gap-4">
              <Skeleton width={24} height={24} />
              <Skeleton width={180} height={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

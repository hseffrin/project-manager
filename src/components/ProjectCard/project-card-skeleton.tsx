import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Placeholder with the shape of ProjectCard (cover, name, customer, dates),
// shown while the projects load. Decorative: the list around it announces
// the loading to screen readers.
export function ProjectCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-xl bg-white">
      {/* Same height as the card cover (231px); the body's top border is
          the line below it. */}
      <Skeleton
        height={231}
        borderRadius={0}
        // Block container without line height, so no gap shows above it.
        containerClassName="block leading-none"
      />
      <div className="rounded-b-xl border border-brand-border p-6 pb-5.5">
        <Skeleton width="50%" height={24} />
        <Skeleton width="33%" height={20} className="mt-2.5" />
        <hr className="mt-3 mb-4 border-black/[0.075]" />
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

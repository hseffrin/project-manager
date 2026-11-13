import Image from "next/image";
import {
  CalendarEndIcon,
  CalendarStartIcon,
} from "@/components/icons/calendar-icons";
import { Highlight } from "@/components/Highlight/highlight";
import type { Project } from "@/db/generated/prisma/browser";
import { formatLongDate, toIsoDate } from "@/utils/date-format";
import placeholderImage from "./icons/placeholder.png";
import { ProjectCardFavorite } from "./project-card-favorite";
import { ProjectCardMenu } from "./project-card-menu";

type ProjectCardProps = {
  project: Pick<
    Project,
    | "public_id"
    | "name"
    | "customer"
    | "date_start"
    | "date_end"
    | "cover_url"
    | "favorite"
  >;
  // Search text to highlight in the name and the customer (search results).
  highlight?: string;
};

export function ProjectCard({ project, highlight }: ProjectCardProps) {
  const {
    public_id,
    name,
    customer,
    date_start,
    date_end,
    cover_url,
    favorite,
  } = project;

  return (
    <article className="overflow-hidden rounded-xl bg-white">
      {/* As in the designs: the cover goes to the card's edge (no border
          around it), 231px tall plus the 1px line below it. */}
      <div className="relative h-58 border-b border-brand-border">
        <Image
          src={cover_url || placeholderImage}
          // The placeholder is decorative, so screen readers skip it.
          alt={cover_url ? `Capa do projeto ${name}` : ""}
          fill
          sizes="(min-width: 640px) 360px, 100vw"
          className="object-cover"
        />

        <div className="absolute right-4 bottom-4.5 flex items-center gap-4.5">
          <ProjectCardFavorite project={{ public_id, favorite }} />
          <ProjectCardMenu project={{ public_id, name }} />
        </div>
      </div>

      {/* The border only wraps the body. Spacing measured from the
          designs (title, customer, divider and dates line up with them). */}
      <div className="rounded-b-xl border-x border-b border-brand-border p-6 pb-5.5">
        <h2 className="text-xl leading-6 font-bold text-brand-card-title">
          <Highlight text={name} query={highlight} />
        </h2>
        <p className="mt-2.5 text-brand-card-label">
          <span className="font-bold">Cliente:</span>{" "}
          <Highlight text={customer} query={highlight} />
        </p>

        <hr className="mt-3 mb-4 border-black/[0.075]" />

        <ul className="flex flex-col gap-4 text-brand-card-label">
          <li className="flex items-center gap-4">
            <CalendarStartIcon title="Data de início" />
            <time dateTime={toIsoDate(date_start)}>
              {formatLongDate(date_start)}
            </time>
          </li>
          <li className="flex items-center gap-4">
            <CalendarEndIcon title="Data final" />
            <time dateTime={toIsoDate(date_end)}>
              {formatLongDate(date_end)}
            </time>
          </li>
        </ul>
      </div>
    </article>
  );
}

import Image from "next/image";
import { FavoriteButton } from "@/components/FavoriteButton/favorite-button";
import {
  MoreButton,
  type MoreButtonOption,
} from "@/components/MoreButton/more-button";
import type { Project } from "@/db/generated/prisma/browser";
import { formatLongDate, toIsoDate } from "@/utils/date-format";
import calendarEndIcon from "./icons/calendar-end.svg";
import calendarStartIcon from "./icons/calendar-start.svg";
import placeholderImage from "./icons/placeholder.png";

type ProjectCardProps = {
  project: Pick<
    Project,
    "name" | "customer" | "date_start" | "date_end" | "cover_url"
  >;
  // Items of the "…" popover. Actions must be Server Actions when the card
  // is rendered by a Server Component.
  options: Record<string, MoreButtonOption>;
};

export function ProjectCard({ project, options }: ProjectCardProps) {
  const { name, customer, date_start, date_end, cover_url } = project;

  return (
    <article className="overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="relative h-52">
        <Image
          src={cover_url || placeholderImage}
          // The placeholder is decorative, so screen readers skip it.
          alt={cover_url ? `Capa do projeto ${name}` : ""}
          fill
          sizes="(min-width: 768px) 320px, 100vw"
          className="object-cover"
        />

        <div className="absolute right-3 bottom-3 flex items-center gap-3">
          <FavoriteButton />
          <MoreButton options={options} />
        </div>
      </div>

      <div className="p-5">
        <h2 className="text-lg font-bold text-brand-card-title">{name}</h2>
        <p className="mt-1 text-brand-card-label">
          <span className="font-bold">Cliente:</span> {customer}
        </p>

        <hr className="my-4 border-black/10" />

        <ul className="flex flex-col gap-3 text-brand-card-label">
          <li className="flex items-center gap-4">
            <Image src={calendarStartIcon} alt="Data de início" />
            <time dateTime={toIsoDate(date_start)}>
              {formatLongDate(date_start)}
            </time>
          </li>
          <li className="flex items-center gap-4">
            <Image src={calendarEndIcon} alt="Data final" />
            <time dateTime={toIsoDate(date_end)}>
              {formatLongDate(date_end)}
            </time>
          </li>
        </ul>
      </div>
    </article>
  );
}

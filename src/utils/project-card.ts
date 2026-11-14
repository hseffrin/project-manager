import type { Prisma } from "@/db/generated/prisma/browser";

// The fields the project cards show. The pages select only these, so the
// numeric id never reaches the browser.
const PROJECT_CARD_SELECT = {
  public_id: true,
  name: true,
  customer: true,
  date_start: true,
  date_end: true,
  cover_url: true,
  favorite: true,
} satisfies Prisma.ProjectSelect;

// A project as the cards receive it.
type ProjectCardData = Prisma.ProjectGetPayload<{
  select: typeof PROJECT_CARD_SELECT;
}>;

export { PROJECT_CARD_SELECT };
export type { ProjectCardData };

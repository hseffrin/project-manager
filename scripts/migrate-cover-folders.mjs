// One-off migration: moves covers saved before per-project folders
// ("projects/<file>") to "projects/<public_id>/<file>" and updates the
// project. Dry run by default; pass --apply to change anything.
//
//   node --env-file=.env.local scripts/migrate-cover-folders.mjs [--apply]
//
// Each cover is copied, the project is pointed at the copy, and only then
// the old file is deleted, so a failure never leaves a project without its
// cover. Files outside projects/ (or test/projects/) are left alone.
import { createRequire } from "node:module";
import { copy, del } from "@vercel/blob";

// pg comes with @prisma/adapter-pg; the generated Prisma client is
// TypeScript and doesn't run in plain Node.
const require = createRequire(import.meta.url);
const pg = createRequire(require.resolve("@prisma/adapter-pg"))("pg");

const apply = process.argv.includes("--apply");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  'select public_id, name, cover_url from "Project" where cover_url is not null order by name',
);

let moved = 0;
for (const project of rows) {
  const pathname = new URL(project.cover_url).pathname.slice(1);
  // Only flat files right inside projects/ (or test/projects/).
  const match = pathname.match(/^((?:test\/)?projects\/)([^/]+)$/);
  if (!match) {
    console.log(`skip  ${project.name}: ${pathname}`);
    continue;
  }

  const target = `${match[1]}${project.public_id}/${match[2]}`;
  console.log(
    `${apply ? "move" : "plan"}  ${project.name}: ${pathname} -> ${target}`,
  );
  if (!apply) continue;

  try {
    const { url } = await copy(project.cover_url, target, { access: "public" });
    await client.query(
      'update "Project" set cover_url = $1 where public_id = $2',
      [url, project.public_id],
    );
    await del(project.cover_url);
    moved += 1;
  } catch (error) {
    console.error(
      `fail  ${project.name}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

await client.end();
console.log(
  apply
    ? `${moved} cover(s) moved.`
    : "Dry run: nothing changed. Run with --apply.",
);

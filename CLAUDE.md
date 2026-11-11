@AGENTS.md

# Convenções do projeto

Gerenciador de pacotes: **pnpm**. Não use npm nem yarn.

## Formatação (Prettier)

- O projeto usa o **estilo padrão do Prettier**: aspas duplas, ponto e vírgula, `trailingComma: "all"`, `printWidth` 80 e 2 espaços. Não mude essas opções no `.prettierrc` nem escreva código em outro estilo, como aspas simples.
- Plugins ativos no `.prettierrc`:
  - `prettier-plugin-tailwindcss`: ordena as classes do Tailwind. Não ordene as classes manualmente; deixe o Prettier fazer isso.
  - `prettier-plugin-prisma`: formata os arquivos `.prisma`.
- Comandos: `pnpm format` (formata tudo) e `pnpm format:check` (só confere).
- O VS Code formata ao salvar, configurado em `.vscode/settings.json`.

## Funções

- **Componentes, páginas e funções de nível superior** (helpers, handlers dentro de componentes): use a declaração `function`, por exemplo `export default function Page()` ou `function handleDrop(...)`. Ela permite hoisting, overloads no TypeScript e genéricos sem a vírgula do `.tsx`.
- **Callbacks** (`.map`, `.filter`, `useEffect`, `setState((prev) => ...)`, props inline como `onClick={() => ...}`): use arrow function. A regra `prefer-arrow-callback` do ESLint obriga isso e corrige sozinha com `--fix`.
- Não converta declarações `function` em `const` com arrow. Algumas dependem de hoisting, como o `handleDrop`, que é usado no `useDropzone` antes de ser definido.

## Checagens

- `pnpm lint`: ESLint (`eslint-config-next`). O `eslint-config-prettier` desliga as regras que conflitam com o Prettier.
- `pnpm typecheck`: `tsc --noEmit`.
- Antes de dar uma tarefa como concluída, rode `pnpm lint` e `pnpm typecheck`.

## Git hooks (husky)

- `pre-commit`: roda `pnpm lint-staged` (`eslint --fix` e `prettier --write` nos arquivos staged, configurado em `.lintstagedrc.js`) e depois `pnpm typecheck`. Erro de lint ou de tipo bloqueia o commit.
- **Nunca use `--no-verify`.** Se o hook falhar, corrija a causa e faça o commit de novo.
- `prepare-commit-msg`: abre o prompt do commitizen quando o commit é feito sem mensagem num terminal interativo. Com `-m`, num merge ou amend, ou sem terminal (agentes, CI), o prompt é pulado.

## Mensagens de commit (padrão do commitizen)

O projeto usa **Conventional Commits** no formato do `cz-conventional-changelog`, o adaptador configurado em `config.commitizen` no `package.json`. Como agentes fazem commit com `-m` e o prompt é pulado, escreva a mensagem já no formato que o commitizen geraria:

```
<tipo>(<escopo>): <assunto>

<corpo opcional>

<rodapé opcional>
```

- **Tipos permitidos:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Escopo:** opcional, em minúsculas, com o nome da área afetada. Exemplos já usados: `db`, `upload`, `projects`, `deps`.
- **Assunto:** no imperativo, começando com letra minúscula, sem ponto final. O cabeçalho inteiro (`tipo(escopo): assunto`) tem no máximo 100 caracteres.
- **Corpo:** explica o porquê da mudança, com linhas de até 100 caracteres.
- **Breaking change:** rodapé `BREAKING CHANGE: <descrição>`. Nesse caso o corpo é obrigatório.
- **Issues:** rodapé `Closes #123`.
- Escreva as mensagens em **inglês**, como no histórico existente. Exemplo: `feat(upload): add file upload with vercel blob and local fallback`.
- Faça um commit por assunto. Reformatação em massa (`pnpm format`) vai num commit separado, do tipo `style`.

"use client";

import { Form } from "radix-ui";
import { type FormEvent, startTransition, useActionState } from "react";
import { createProject, type CreateProjectState } from "@/app/new/actions";
import { FileDropzone } from "@/components/File/file-dropzone";
import { normalizeFileSize } from "@/utils/string-format";
import { MAX_UPLOAD_BYTES } from "@/utils/upload/uploads";

const fieldCls =
  "rounded-md border border-black/15 bg-transparent px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 data-invalid:border-red-500 dark:border-white/20";
const labelCls = "text-sm font-medium group-data-invalid:text-red-600";
const messageCls = "text-xs text-red-600";

const initialState: CreateProjectState = {};

export function ProjectForm() {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState,
  );
  const errors = state.errors ?? {};

  // Submit through onSubmit instead of <form action>: React resets the form
  // after an action runs, which would wipe what the user typed whenever the
  // server returns validation errors. The browser only fires submit once the
  // native validation (required fields, cover uploaded) passes.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <Form.Root
      onSubmit={handleSubmit}
      className="mx-auto mt-16 flex w-full max-w-md flex-col gap-5 rounded-xl border border-black/10 p-6 shadow-sm dark:border-white/15"
    >
      <Form.Field
        className="group flex flex-col gap-1.5"
        name="project-name"
        serverInvalid={Boolean(errors.name)}
      >
        <div className="flex items-baseline justify-between">
          <Form.Label className={labelCls}>
            Nome do projeto (obrigatório)
          </Form.Label>
          <Form.Message className={messageCls} match="valueMissing">
            Por favor digite ao menos duas palavras
          </Form.Message>
          {errors.name && (
            <Form.Message className={messageCls} forceMatch>
              {errors.name[0]}
            </Form.Message>
          )}
        </div>
        <Form.Control asChild>
          <input className={`h-10 ${fieldCls}`} type="text" required />
        </Form.Control>
      </Form.Field>

      <Form.Field
        className="group flex flex-col gap-1.5"
        name="customer"
        serverInvalid={Boolean(errors.customer)}
      >
        <div className="flex items-baseline justify-between">
          <Form.Label className={labelCls}>Cliente (obrigatório)</Form.Label>
          <Form.Message className={messageCls} match="valueMissing">
            Por favor, digite ao menos uma palavra
          </Form.Message>
          {errors.customer && (
            <Form.Message className={messageCls} forceMatch>
              {errors.customer[0]}
            </Form.Message>
          )}
        </div>
        <Form.Control asChild>
          <input className={`h-10 ${fieldCls}`} type="text" required />
        </Form.Control>
      </Form.Field>

      <Form.Field
        className="group flex flex-col gap-1.5"
        name="start-date"
        serverInvalid={Boolean(errors.startDate)}
      >
        <div className="flex items-baseline justify-between">
          <Form.Label className={labelCls}>
            Data de Início (Obrigatório)
          </Form.Label>
          <Form.Message className={messageCls} match="valueMissing">
            Selecione uma data válida
          </Form.Message>
          {errors.startDate && (
            <Form.Message className={messageCls} forceMatch>
              {errors.startDate[0]}
            </Form.Message>
          )}
        </div>
        <Form.Control asChild>
          <input className={`h-10 ${fieldCls}`} type="date" required />
        </Form.Control>
      </Form.Field>

      <Form.Field
        className="group flex flex-col gap-1.5"
        name="end-date"
        serverInvalid={Boolean(errors.endDate)}
      >
        <div className="flex items-baseline justify-between">
          <Form.Label className={labelCls}>
            Data de Final (Obrigatório)
          </Form.Label>
          <Form.Message className={messageCls} match="valueMissing">
            Selecione uma data válida
          </Form.Message>
          {errors.endDate && (
            <Form.Message className={messageCls} forceMatch>
              {errors.endDate[0]}
            </Form.Message>
          )}
        </div>
        <Form.Control asChild>
          <input className={`h-10 ${fieldCls}`} type="date" required />
        </Form.Control>
      </Form.Field>

      <FileDropzone
        name="cover"
        label="Capa (obrigatório)"
        accept={{ "image/*": [] }}
        hint={`Uma imagem, até ${normalizeFileSize(MAX_UPLOAD_BYTES)}`}
        multiple={false}
        required
        requiredMessage="Envie uma imagem de capa"
        error={errors.cover?.[0]}
      />

      {state.message && (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}

      <Form.Submit asChild>
        <button
          disabled={pending}
          className="mt-2 h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar Projeto"}
        </button>
      </Form.Submit>
    </Form.Root>
  );
}

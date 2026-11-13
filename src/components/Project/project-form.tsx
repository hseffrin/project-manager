"use client";

import { Form } from "radix-ui";
import {
  type FocusEvent,
  type FormEvent,
  type ReactNode,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createProject,
  type ProjectFormState,
  updateProject,
} from "@/actions/projects";
import { Button } from "@/components/Button/button";
import { FileDropzone } from "@/components/File/file-dropzone";
import { IconButton } from "@/components/IconButton/icon-button";
import {
  CalendarEndIcon,
  CalendarStartIcon,
} from "@/components/icons/calendar-icons";
import type { Project } from "@/db/generated/prisma/browser";
import { toIsoDate } from "@/utils/date-format";

const fieldCls = "group flex flex-col gap-1.5";
const labelCls =
  "text-base text-brand-label group-data-invalid:text-brand-error";
const inputCls =
  "h-10 rounded border border-brand-input-border bg-white px-4 text-brand-fg outline-none focus:ring-2 focus:ring-brand-label/30 group-data-invalid:border-brand-error group-data-invalid:text-brand-error";
const messageCls = "text-xs text-brand-error";

const initialState: ProjectFormState = {};

// Shows the field's error as soon as the user leaves it: checkValidity() fires
// the "invalid" event that Radix Form listens to.
function validateOnBlur(event: FocusEvent<HTMLInputElement>) {
  event.currentTarget.checkValidity();
}

type RequiredLabelProps = {
  children: ReactNode;
};

// Field label followed by the gray "(Obrigatório)"; both turn red on error.
function RequiredLabel({ children }: RequiredLabelProps) {
  return (
    <Form.Label className={labelCls}>
      {children}{" "}
      <span className="text-xs text-brand-label-required group-data-invalid:text-brand-error">
        (Obrigatório)
      </span>
    </Form.Label>
  );
}

type DateFieldProps = {
  name: string;
  label: string;
  icon: typeof CalendarStartIcon;
  serverError?: string;
  defaultValue?: string;
  min?: string;
  onValueChange?: (value: string) => void;
};

// Date input with the design's calendar icon instead of the browser's: the
// native indicator is hidden and the icon opens the native picker.
function DateField({
  name,
  label,
  icon: Icon,
  serverError,
  defaultValue,
  min,
  onValueChange,
}: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Form.Field
      className={fieldCls}
      name={name}
      serverInvalid={Boolean(serverError)}
    >
      <RequiredLabel>{label}</RequiredLabel>
      <div className="flex h-10 items-center gap-2 rounded border border-brand-input-border bg-white pr-1 pl-4 group-data-invalid:border-brand-error focus-within:ring-2 focus-within:ring-brand-label/30">
        {/* The browser's own calendar button is hidden: in Chrome/Safari with
            the pseudo-element; Firefox has none, so its input is 2rem wider
            than this clipping box and the button falls outside. */}
        <div className="flex h-full min-w-0 flex-1 overflow-hidden">
          <Form.Control asChild>
            <input
              ref={inputRef}
              type="date"
              required
              defaultValue={defaultValue}
              min={min}
              onBlur={validateOnBlur}
              onChange={(event) => onValueChange?.(event.target.value)}
              className="h-full w-full flex-none bg-transparent text-brand-fg outline-none group-data-invalid:text-brand-error supports-[-moz-appearance:none]:w-[calc(100%+2rem)] [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </Form.Control>
        </div>
        <IconButton
          label={`Abrir calendário: ${label}`}
          icon={
            <Icon className="text-brand-card-label group-data-invalid:text-brand-error" />
          }
          onClick={() => inputRef.current?.showPicker()}
        />
      </div>
      <Form.Message className={messageCls} match="valueMissing">
        Selecione uma data válida
      </Form.Message>
      <Form.Message className={messageCls} match="badInput">
        Selecione uma data válida
      </Form.Message>
      <Form.Message className={messageCls} match="rangeUnderflow">
        A data final não pode ser antes da data de início
      </Form.Message>
      {serverError && (
        <Form.Message className={messageCls} forceMatch>
          {serverError}
        </Form.Message>
      )}
    </Form.Field>
  );
}

type ProjectFormProps = {
  // Project being edited. Without it the form creates a new project.
  project?: Pick<
    Project,
    "public_id" | "name" | "customer" | "date_start" | "date_end" | "cover_url"
  >;
};

export function ProjectForm({ project }: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(
    project ? updateProject.bind(null, project.public_id) : createProject,
    initialState,
  );
  const defaultStart = project ? toIsoDate(project.date_start) : "";
  const defaultEnd = project ? toIsoDate(project.date_end) : "";
  const errors = state.errors ?? {};

  const formRef = useRef<HTMLFormElement>(null);
  const [startDate, setStartDate] = useState(defaultStart);
  const [fieldsValid, setFieldsValid] = useState(false);
  const [coverReady, setCoverReady] = useState(false);

  // The button stays disabled until every field is valid. Reading
  // validity.valid doesn't fire "invalid", so no error shows up early. The
  // cover is tracked apart because its picker is invalid until the upload ends.
  function updateFieldsValid() {
    const controls = [
      ...(formRef.current?.querySelectorAll<HTMLInputElement>(
        'input[type="text"], input[type="date"]',
      ) ?? []),
    ];
    setFieldsValid(
      controls.length > 0 &&
        controls.every((control) => control.validity.valid),
    );
  }

  // The end date's min follows the start date, which can make it invalid
  // without any event on the end date input.
  useEffect(updateFieldsValid, [startDate]);

  // Submit through onSubmit instead of <form action>: React resets the form
  // after an action runs, which would wipe what the user typed whenever the
  // server returns validation errors.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <Form.Root
      ref={formRef}
      onSubmit={handleSubmit}
      onInput={updateFieldsValid}
      className="flex w-full justify-center rounded border border-brand-border px-6 py-12"
    >
      <div className="flex w-full max-w-176 flex-col gap-8">
        <Form.Field
          className={fieldCls}
          name="project-name"
          serverInvalid={Boolean(errors.name)}
        >
          <RequiredLabel>Nome do projeto</RequiredLabel>
          <Form.Control asChild>
            <input
              className={inputCls}
              type="text"
              required
              defaultValue={project?.name}
              // At least two words.
              pattern="\s*\S+\s+\S+.*"
              onBlur={validateOnBlur}
            />
          </Form.Control>
          <Form.Message className={messageCls} match="valueMissing">
            Por favor, digite ao menos duas palavras
          </Form.Message>
          <Form.Message className={messageCls} match="patternMismatch">
            Por favor, digite ao menos duas palavras
          </Form.Message>
          {errors.name && (
            <Form.Message className={messageCls} forceMatch>
              {errors.name[0]}
            </Form.Message>
          )}
        </Form.Field>

        <Form.Field
          className={fieldCls}
          name="customer"
          serverInvalid={Boolean(errors.customer)}
        >
          <RequiredLabel>Cliente</RequiredLabel>
          <Form.Control asChild>
            <input
              className={inputCls}
              type="text"
              required
              defaultValue={project?.customer}
              // At least one word, not only spaces.
              pattern=".*\S.*"
              onBlur={validateOnBlur}
            />
          </Form.Control>
          <Form.Message className={messageCls} match="valueMissing">
            Por favor, digite ao menos uma palavra
          </Form.Message>
          <Form.Message className={messageCls} match="patternMismatch">
            Por favor, digite ao menos uma palavra
          </Form.Message>
          {errors.customer && (
            <Form.Message className={messageCls} forceMatch>
              {errors.customer[0]}
            </Form.Message>
          )}
        </Form.Field>

        <div className="grid grid-cols-2 gap-10">
          <DateField
            name="start-date"
            label="Data de Início"
            icon={CalendarStartIcon}
            serverError={errors.startDate?.[0]}
            defaultValue={defaultStart}
            onValueChange={setStartDate}
          />
          <DateField
            name="end-date"
            defaultValue={defaultEnd}
            label="Data Final"
            icon={CalendarEndIcon}
            serverError={errors.endDate?.[0]}
            min={startDate || undefined}
          />
        </div>

        <FileDropzone
          name="cover"
          label="Capa do projeto"
          accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
          hint="Escolha uma imagem .jpg ou .png no seu dispositivo"
          required
          requiredMessage="Envie uma imagem de capa"
          error={errors.cover?.[0]}
          onReadyChange={setCoverReady}
          defaultUrl={project?.cover_url}
        />

        {state.message && (
          <p className="text-sm text-brand-error" role="alert">
            {state.message}
          </p>
        )}

        <Form.Submit asChild>
          <Button
            label={pending ? "Salvando..." : "Salvar projeto"}
            fullWidth
            disabled={!fieldsValid || !coverReady || pending}
          />
        </Form.Submit>
      </div>
    </Form.Root>
  );
}

import { Form } from "radix-ui";
import { getUploadDriver } from "@/utils/upload/upload-driver";
import { FileDropzone } from "../../components/File/file-dropzone";

const fieldCls =
  "rounded-md border border-black/15 bg-transparent px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 data-invalid:border-red-500 dark:border-white/20";

export default function CreatePlan() {
  return (
    <Form.Root className="mx-auto mt-16 flex w-full max-w-md flex-col gap-5 rounded-xl border border-black/10 p-6 shadow-sm dark:border-white/15">
      <Form.Field className="group flex flex-col gap-1.5" name="project-name">
        <div className="flex items-baseline justify-between">
          <Form.Label className="text-sm font-medium group-data-invalid:text-red-600">
            Nome do projeto (obrigatório)
          </Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
            Por favor digite ao menos duas palavras
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className={`h-10 ${fieldCls}`} type="text" required />
        </Form.Control>
      </Form.Field>

      <Form.Field className="group flex flex-col gap-1.5" name="customer">
        <div className="flex items-baseline justify-between">
          <Form.Label className="text-sm font-medium group-data-invalid:text-red-600">
            Cliente (obrigatório)
          </Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
            Por favor, digite ao menos uma palavra
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className={`h-10 ${fieldCls}`} type="text" required />
        </Form.Control>
      </Form.Field>

      <Form.Field className="group flex flex-col gap-1.5" name="start-date">
        <div className="flex items-baseline justify-between">
          <Form.Label className="text-sm font-medium group-data-invalid:text-red-600">
            Data de Início (Obrigatório)
          </Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
            Selecione uma data válida
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className={`h-10 ${fieldCls}`} type="date" required />
        </Form.Control>
      </Form.Field>

      <Form.Field className="group flex flex-col gap-1.5" name="end-date">
        <div className="flex items-baseline justify-between">
          <Form.Label className="text-sm font-medium group-data-invalid:text-red-600">
            Data de Final (Obrigatório)
          </Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
            Selecione uma data válida
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className={`h-10 ${fieldCls}`} type="date" required />
        </Form.Control>
      </Form.Field>

      <FileDropzone driver={getUploadDriver()} />

      <Form.Submit asChild>
        <button className="mt-2 h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none disabled:opacity-50">
          Salvar Projeto
        </button>
      </Form.Submit>
    </Form.Root>
  );
}

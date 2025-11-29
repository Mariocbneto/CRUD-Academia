import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createTeacher, updateTeacher } from "../services/teachers";
import { classOptions, teacherSchema } from "../schemas/teacher";
import type { Teacher } from "../types/teacher";

type Props = {
  teacher?: Teacher | null;
  onCreated?: (teacher: Teacher) => void;
  onUpdated?: (teacher: Teacher) => void;
};

const emptyForm = {
  name: "",
  cpf: "",
  phone: "",
  email: "",
  classType: "MUSCULACAO",
  photo: "",
};

export function TeacherForm({ teacher, onCreated, onUpdated }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      setForm({
        name: teacher.name,
        cpf: teacher.cpf,
        phone: teacher.phone,
        email: teacher.email,
        classType: teacher.classType,
        photo: teacher.photo ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [teacher]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    if (name === "cpf") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 11);
      setForm((prev) => ({ ...prev, cpf: onlyDigits }));
      return;
    }
    if (name === "phone") {
      const onlyDigits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, phone: onlyDigits }));
      return;
    }
    if (name === "name") {
      const onlyLetters = value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
      setForm((prev) => ({ ...prev, name: onlyLetters }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: "Use PNG ou JPEG" }));
      return;
    }
    const base64 = await toBase64(file);
    setForm((prev) => ({ ...prev, photo: base64 }));
    setErrors((prev) => ({ ...prev, photo: "" }));
  }

  async function toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = teacherSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      if (teacher) {
        const updated = await updateTeacher(teacher.id, parsed.data);
        onUpdated?.(updated);
      } else {
        const created = await createTeacher(parsed.data);
        onCreated?.(created);
        setForm(emptyForm);
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        submit: "Erro ao salvar professor. Verifique os dados.",
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="student-form card" onSubmit={handleSubmit}>
      <h3>{teacher ? "Editar professor" : "Cadastrar professor"}</h3>
      <div className="form-grid">
        <label>
          Nome
          <input name="name" value={form.name} onChange={handleChange} />
          {errors.name && <span className="error">{errors.name}</span>}
        </label>
        <label>
          CPF
          <input name="cpf" value={form.cpf} onChange={handleChange} maxLength={11} />
          {errors.cpf && <span className="error">{errors.cpf}</span>}
        </label>
        <label>
          Telefone
          <input name="phone" value={form.phone} onChange={handleChange} />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </label>
        <label>
          E-mail
          <input name="email" value={form.email} onChange={handleChange} />
          {errors.email && <span className="error">{errors.email}</span>}
        </label>
        <label>
          Aula
          <select name="classType" value={form.classType} onChange={handleChange}>
            {classOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          Foto (PNG/JPEG)
          <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
          {errors.photo && <span className="error">{errors.photo}</span>}
        </label>
      </div>
      {errors.submit && <p className="error">{errors.submit}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Salvando..." : teacher ? "Salvar" : "Cadastrar"}
      </button>
    </form>
  );
}

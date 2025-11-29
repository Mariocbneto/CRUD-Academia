import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createStudent, updateStudent } from "../services/students";
import { studentSchema, planOptions } from "../schemas/student";
import type { Student } from "../types/student";

type Props = {
  onCreated?: (student: Student) => void;
  onUpdated?: (student: Student) => void;
  student?: Student | null;
};

const emptyForm = {
  name: "",
  cpf: "",
  phone: "",
  email: "",
  plan: "MENSAL",
  photo: "",
};

export function StudentForm({ onCreated, onUpdated, student }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        cpf: student.cpf,
        phone: student.phone,
        email: student.email,
        plan: student.plan,
        photo: student.photo ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [student]);

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
    const parsed = studentSchema.safeParse(form);
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
      if (student) {
        const updated = await updateStudent(student.id, parsed.data);
        onUpdated?.(updated);
      } else {
        const created = await createStudent(parsed.data);
        onCreated?.(created);
        setForm(emptyForm);
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        submit: "Erro ao salvar aluno. Verifique os dados.",
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="student-form card" onSubmit={handleSubmit}>
      <h3>{student ? "Editar aluno" : "Cadastrar aluno"}</h3>
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
          Plano
          <select name="plan" value={form.plan} onChange={handleChange}>
            {planOptions.map((p) => (
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
        {loading ? "Salvando..." : student ? "Salvar" : "Cadastrar"}
      </button>
    </form>
  );
}

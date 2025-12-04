import { useState } from "react";
import { Modal } from "../Modal";
import { createFinancialRecord } from "../../services/financial";
import type { FinancialRecord } from "../../types/financial";
import type { Student } from "../../types/student";
import type { Teacher } from "../../types/teacher";

type Props = {
  records: FinancialRecord[];
  students: Student[]; // <--- Novo: Precisa da lista para o dropdown
  teachers: Teacher[]; // <--- Novo: Precisa da lista para o dropdown
  onRefresh: () => void;
};

type TransactionCategory = "STUDENT" | "TEACHER" | "OTHER";

export function FinancialSection({ records, students, teachers, onRefresh }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<TransactionCategory>("STUDENT");
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    amount: "",
    description: "", // Usado apenas para "Outros"
    selectedId: "",  // ID do Aluno ou Professor
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    let payload: any = {
      amount: Number(formData.amount.replace(",", ".")),
    };

    // Lógica Inteligente de Preenchimento
    if (category === "STUDENT") {
      const student = students.find(s => s.id === Number(formData.selectedId));
      if (!student) return alert("Selecione um aluno");
      
      payload.type = "INCOME";
      payload.studentId = student.id;
      payload.description = `Mensalidade - ${student.name} (${student.plan})`; // Descrição Automática
    } 
    else if (category === "TEACHER") {
      const teacher = teachers.find(t => t.id === Number(formData.selectedId));
      if (!teacher) return alert("Selecione um professor");

      payload.type = "EXPENSE";
      payload.teacherId = teacher.id;
      payload.description = `Salário - ${teacher.name} (${teacher.classType})`; // Descrição Automática
    } 
    else {
      // Categoria "OUTROS"
      if (!formData.description) return alert("Digite uma descrição");
      // Aqui precisamos saber se é entrada ou saída. 
      // Por simplicidade, vou assumir EXPENSE (despesa) para "Outros", 
      // ou você pode adicionar um radio button "Entrada/Saída" só para essa aba.
      const isExpense = confirm("Isso é uma SAÍDA de dinheiro (Despesa)?\nOK = Sim (Saída)\nCancelar = Não (Entrada Extra)");
      payload.type = isExpense ? "EXPENSE" : "INCOME";
      payload.description = formData.description;
    }

    try {
      await createFinancialRecord(payload);
      setModalOpen(false);
      setFormData({ amount: "", description: "", selectedId: "" });
      onRefresh();
    } catch {
      alert("Erro ao salvar.");
    }
  }

  return (
    <div className="students-main">
      <header className="hub-header">
        <h1>Financeiro</h1>
        <button className="ghost" onClick={() => setModalOpen(true)}>+ Nova Transação</button>
      </header>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr><th>Data</th><th>Descrição</th><th>Origem/Destino</th><th>Tipo</th><th>Valor</th></tr>
          </thead>
          <tbody>
            {records.map(rec => (
              <tr key={rec.id}>
                <td>{new Date(rec.date).toLocaleDateString()}</td>
                <td>{rec.description}</td>
                <td>
                  {/* Mostra quem pagou ou recebeu automaticamente */}
                  {rec.student ? <span className="pill">Aluno: {rec.student.name}</span> : 
                   rec.teacher ? <span className="pill">Prof: {rec.teacher.name}</span> : 
                   "-"}
                </td>
                <td>
                  <span className={`pill ${rec.type === 'INCOME' ? 'success' : 'danger'}`}>
                    {rec.type === 'INCOME' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold', color: rec.type === 'INCOME' ? '#16a34a' : '#dc2626' }}>
                  R$ {Number(rec.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Nova Movimentação">
        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          
          {/* ABAS DE CATEGORIA */}
          <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
            <button type="button" className={`ghost ${category === 'STUDENT' ? 'active-tab' : ''}`} onClick={() => setCategory('STUDENT')} style={category === 'STUDENT' ? {background: '#e0f2fe', borderColor: '#0ea5e9'} : {}}>
              🎓 Receber de Aluno
            </button>
            <button type="button" className={`ghost ${category === 'TEACHER' ? 'active-tab' : ''}`} onClick={() => setCategory('TEACHER')} style={category === 'TEACHER' ? {background: '#fef9c3', borderColor: '#ca8a04'} : {}}>
              💼 Pagar Professor
            </button>
            <button type="button" className={`ghost ${category === 'OTHER' ? 'active-tab' : ''}`} onClick={() => setCategory('OTHER')} style={category === 'OTHER' ? {background: '#f3f4f6', borderColor: '#6b7280'} : {}}>
              ⚡ Outros
            </button>
          </div>

          {/* INPUTS DINÂMICOS */}
          {category === "STUDENT" && (
            <label>Selecione o Aluno
              <select required value={formData.selectedId} onChange={e => setFormData({...formData, selectedId: e.target.value})}>
                <option value="">Selecione...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - Plano {s.plan}</option>
                ))}
              </select>
            </label>
          )}

          {category === "TEACHER" && (
            <label>Selecione o Professor
              <select required value={formData.selectedId} onChange={e => setFormData({...formData, selectedId: e.target.value})}>
                <option value="">Selecione...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} - {t.classType}</option>
                ))}
              </select>
            </label>
          )}

          {category === "OTHER" && (
            <label>Descrição da Despesa/Receita
              <input required placeholder="Ex: Conta de Luz, Manutenção..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </label>
          )}

          <label>Valor (R$)
            <input required type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
              Confirmar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
import { useState } from "react";
import { WeeklyCalendar } from "../WeeklyCalendar"; // <--- SEU CALENDÁRIO
import { Modal } from "../Modal"; // <--- SEU MODAL
import { generateClasses, deleteClass } from "../../services/classes";
import type { GymClass } from "../../types/gymClass";
import type { Teacher } from "../../types/teacher";

type Props = {
  classes: GymClass[];
  teachers: Teacher[];
  onRefresh: () => void;
};

export function ClassesSection({ classes, teachers, onRefresh }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  
  // Estado local do formulário (saiu da DashboardPage)
  const [agendaForm, setAgendaForm] = useState({
    name: "",
    teacherId: "",
    timeStart: "08:00",
    timeEnd: "09:00",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    weekDays: [] as number[]
  });

  function toggleWeekDay(day: number) {
    setAgendaForm(prev => {
      const exists = prev.weekDays.includes(day);
      if (exists) return { ...prev, weekDays: prev.weekDays.filter(d => d !== day) };
      return { ...prev, weekDays: [...prev.weekDays, day] };
    });
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (agendaForm.weekDays.length === 0) return alert("Selecione dias.");
    
    try {
      await generateClasses({ ...agendaForm, teacherId: Number(agendaForm.teacherId) });
      alert("Agenda criada!");
      setModalOpen(false);
      onRefresh();
    } catch {
      alert("Erro ao gerar.");
    }
  }

  return (
    <>
      {/* Aqui usamos o seu componente WeeklyCalendar */}
      <WeeklyCalendar 
        classes={classes}
        onAddClass={() => setModalOpen(true)}
        onDeleteClass={(aula) => {
          if(confirm(`Excluir ${aula.name}?`)) {
             deleteClass(aula.id).then(onRefresh);
          }
        }}
      />

      {/* Modal de Geração de Agenda */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Gerar Agenda">
        <form onSubmit={handleGenerate} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              <label>Nome
                <input required value={agendaForm.name} onChange={e => setAgendaForm({...agendaForm, name: e.target.value})} />
              </label>
              <label>Professor
                <select required value={agendaForm.teacherId} onChange={e => setAgendaForm({...agendaForm, teacherId: e.target.value})}>
                  <option value="">Selecione...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
            </div>

            <label>Dias da Semana</label>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
                <button type="button" key={idx} onClick={() => toggleWeekDay(idx)}
                  style={{
                    padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc',
                    background: agendaForm.weekDays.includes(idx) ? '#2563eb' : 'transparent',
                    color: agendaForm.weekDays.includes(idx) ? '#fff' : 'inherit'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
            <div style={{display:'flex', gap:'10px'}}>
                <label style={{flex:1}}>Início <input type="time" value={agendaForm.timeStart} onChange={e => setAgendaForm({...agendaForm, timeStart: e.target.value})} /></label>
                <label style={{flex:1}}>Fim <input type="time" value={agendaForm.timeEnd} onChange={e => setAgendaForm({...agendaForm, timeEnd: e.target.value})} /></label>
            </div>
            <div style={{display:'flex', gap:'10px'}}>
                <label style={{flex:1}}>De <input type="date" value={agendaForm.startDate} onChange={e => setAgendaForm({...agendaForm, startDate: e.target.value})} /></label>
                <label style={{flex:1}}>Até <input type="date" value={agendaForm.endDate} onChange={e => setAgendaForm({...agendaForm, endDate: e.target.value})} /></label>
            </div>

            <div className="modal-actions">
              <button type="button" className="ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none' }}>Gerar</button>
            </div>
        </form>
      </Modal>
    </>
  );
}
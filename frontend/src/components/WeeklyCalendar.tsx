import { useState, useMemo } from "react";
import type { GymClass } from "../types/gymClass";

type Props = {
  classes: GymClass[];
  onDeleteClass: (gymClass: GymClass) => void;
  onAddClass: () => void;
};

export function WeeklyCalendar({ classes, onDeleteClass, onAddClass }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  function prevWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  }

  function nextWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  return (
    <div className="students-main">
      <header className="hub-header">
        <h1>Agenda Semanal</h1>
        <button className="ghost" onClick={onAddClass}>+ Gerar Agenda</button>
      </header>

      <div className="agenda-controls">
        <button className="icon-button" onClick={prevWeek} title="Semana Anterior">⬅️</button>
        
        <div style={{textAlign: 'center', cursor: 'pointer'}} onClick={goToday} title="Voltar para Hoje">
           <div className="label-strong" style={{fontSize: '1.1rem'}}>
             {weekDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
           </div>
           <small className="label-muted" style={{fontSize: '0.75rem'}}>
             Semana de {weekDays[0].getDate()} a {weekDays[6].getDate()}
           </small>
        </div>

        <button className="icon-button" onClick={nextWeek} title="Próxima Semana">➡️</button>
      </div>

      <div className="agenda-grid">
        {weekDays.map((dayDate, index) => {
          const dateStr = dayDate.toISOString().split('T')[0];
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          
          const classesForDay = classes
            .filter(c => {
               if(!c.date) return false;
               const cDateStr = new Date(c.date).toISOString().split('T')[0];
               return cDateStr === dateStr;
            })
            .sort((a, b) => a.timeStart.localeCompare(b.timeStart));

          return (
            <div key={index} className="agenda-day" style={isToday ? {border: '2px solid #2563eb', backgroundColor: '#f0f9ff'} : {}}>
              <div className="agenda-day-header">
                <div className="day-name">
                  {dayDate.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div className="day-number">{dayDate.getDate()}</div>
              </div>
              
              <div className="day-body">
                {classesForDay.map(aula => (
                  <div 
                    key={aula.id} 
                    className="class-mini-card" 
                    title="Clique para excluir"
                    onClick={() => onDeleteClass(aula)}
                  >
                    <div className="mini-time">
                      {aula.timeStart} - {aula.timeEnd}
                    </div>
                    
                    <div className="mini-title">{aula.name}</div>
                    <div className="mini-prof">{aula.teacher?.name}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
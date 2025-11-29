export type Teacher = {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  classType:
    | "MUSCULACAO"
    | "PILATES"
    | "FUNCIONAL"
    | "CROSS_TRAINING"
    | "YOGA"
    | "ZUMBA_DANCA"
    | "HIIT"
    | "SPINNING"
    | "ALONGAMENTO"
    | "FISIOTERAPIA_REABILITACAO";
  photo?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

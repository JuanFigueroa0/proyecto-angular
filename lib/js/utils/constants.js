// src/lib/js/utils/constants.js

export const TIPOS_DOCUMENTO = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "TI", label: "Tarjeta de Identidad" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PA", label: "Pasaporte" },
  { value: "RC", label: "Registro Civil" },
  { value: "sin_documento", label: "Sin documento" },
];

export const ESTADOS_CIVILES = [
  { value: "soltero", label: "Soltero/a" },
  { value: "casado", label: "Casado/a" },
  { value: "viudo", label: "Viudo/a" },
  { value: "divorciado", label: "Divorciado/a" },
  { value: "union_libre", label: "Unión libre" },
  { value: "anulado", label: "Anulado/a" },
];

export const TIPOS_EVENTO = [
  { value: "misa", label: "Misa" },
  { value: "retiro", label: "Retiro" },
  { value: "curso", label: "Curso" },
  { value: "reunion", label: "Reunión" },
  { value: "celebracion", label: "Celebración" },
  { value: "otro", label: "Otro" },
];

export const SUBTIPOS_MISA = [
  { value: "accion_gracias", label: "Acción de gracias" },
  { value: "difunto", label: "Por difunto" },
  { value: "cumpleanos", label: "Cumpleaños" },
  { value: "aniversario", label: "Aniversario" },
  { value: "sanacion", label: "Sanación" },
  { value: "especial", label: "Especial / Personalizada" },
];

export const ROLES_SACRAMENTO = [
  { value: "receptor", label: "Receptor" },
  { value: "padre", label: "Padre" },
  { value: "madre", label: "Madre" },
  { value: "padrino", label: "Padrino" },
  { value: "madrina", label: "Madrina" },
  { value: "contrayente", label: "Contrayente" },
  { value: "testigo", label: "Testigo" },
  { value: "tutor_legal", label: "Tutor legal" },
  { value: "solicitante", label: "Solicitante" },
  { value: "otro", label: "Otro" },
];

export const CATEGORIAS_DOCUMENTO = [
  { value: "documento_identidad", label: "Documento de identidad" },
  { value: "certificado_externo", label: "Certificado externo" },
  { value: "registro_civil", label: "Registro civil" },
  { value: "acta_defuncion", label: "Acta de defunción" },
  { value: "documento_anulacion", label: "Documento de anulación" },
  { value: "custodia_legal", label: "Custodia legal" },
  { value: "certificado_curso", label: "Certificado de curso" },
  { value: "certificado_sacramento", label: "Certificado sacramental" },
  { value: "foto_persona", label: "Foto" },
  { value: "otro", label: "Otro" },
];

export const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "cheque", label: "Cheque" },
  { value: "otro", label: "Otro" },
];

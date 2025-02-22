export interface BOEResponse {
  response: {
    status: {
      code: number;
      text: string;
    };
    data: {
      sumario: BOESumario;
    };
  };
}

export interface BOESumario {
  metadatos: {
    publicacion: string;
    fecha_publicacion: string;
  };
  diario: BOEDiario[];
}

export interface BOEDiario {
  numero: string;
  sumario_diario: {
    identificador: string;
    url_pdf: {
      szBytes: string;
      szKBytes: string;
      texto: string;
    };
  };
  seccion: BOESeccion[];
}

export interface BOESeccion {
  codigo: string;
  nombre: string;
  departamento: BOEDepartamento | BOEDepartamento[];
}

export interface BOEDepartamento {
  codigo: string;
  nombre: string;
  texto?: {
    epigrafe: BOEEpigrafe[];
  };
  epigrafe?: BOEEpigrafe[];
  item?: BOEItem | BOEItem[];
}

export interface BOEEpigrafe {
  nombre: string;
  item: BOEItem | BOEItem[];
}

export interface BOEItem {
  identificador: string;
  control: string;
  titulo: string;
  url_pdf: {
    szBytes: string;
    szKBytes: string;
    pagina_inicial: string;
    pagina_final: string;
    texto: string;
  };
  url_html: string;
  url_xml: string;
}
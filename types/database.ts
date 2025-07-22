export interface Database {
  public: {
    Tables: {
      auth_users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      usuario: {
        Row: {
          id: string
          nome: string
          email: string
          data_registro: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          data_registro?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          data_registro?: string
        }
      }
      bebe: {
        Row: {
          id: number
          usuario_id: string
          nome: string
          data_nascimento: string
          tipo_sanguineo: string
          local_nascimento: string
          nome_pai: string
          nome_mae: string
          nome_avo_paterno: string
          nome_avo_materno: string
        }
        Insert: {
          id?: number
          usuario_id: string
          nome: string
          data_nascimento: string
          tipo_sanguineo: string
          local_nascimento: string
          nome_pai: string
          nome_mae: string
          nome_avo_paterno: string
          nome_avo_materno: string
        }
        Update: {
          id?: number
          usuario_id?: string
          nome?: string
          data_nascimento?: string
          tipo_sanguineo?: string
          local_nascimento?: string
          nome_pai?: string
          nome_mae?: string
          nome_avo_paterno?: string
          nome_avo_materno?: string
        }
      }
      medico: {
        Row: {
          id: number
          usuario_id: string
          nome: string
          especialidade: string
          crm: string
          telefone: string
        }
        Insert: {
          id?: number
          usuario_id: string
          nome: string
          especialidade: string
          crm: string
          telefone: string
        }
        Update: {
          id?: number
          usuario_id?: string
          nome?: string
          especialidade?: string
          crm?: string
          telefone?: string
        }
      }
      conteudo_educativo: {
        Row: {
          id: number
          titulo: string
          categoria: string
          conteudo: string
          data_publicacao: string
        }
        Insert: {
          id?: number
          titulo: string
          categoria: string
          conteudo: string
          data_publicacao?: string
        }
        Update: {
          id?: number
          titulo?: string
          categoria?: string
          conteudo?: string
          data_publicacao?: string
        }
      }
      exame: {
        Row: {
          id: number
          bebe_id: number
          tipo_exame: string
          data_exame: string
          arquivo_url: string
          resumo_ia: string
        }
        Insert: {
          id?: number
          bebe_id: number
          tipo_exame: string
          data_exame: string
          arquivo_url: string
          resumo_ia?: string
        }
        Update: {
          id?: number
          bebe_id?: number
          tipo_exame?: string
          data_exame?: string
          arquivo_url?: string
          resumo_ia?: string
        }
      }
      album: {
        Row: {
          id: number
          bebe_id: number
          nome_album: string
          data_criacao: string
        }
        Insert: {
          id?: number
          bebe_id: number
          nome_album: string
          data_criacao?: string
        }
        Update: {
          id?: number
          bebe_id?: number
          nome_album?: string
          data_criacao?: string
        }
      }
      foto: {
        Row: {
          id: number
          album_id: number
          url_foto: string
          legenda: string
          data_foto: string
        }
        Insert: {
          id?: number
          album_id: number
          url_foto: string
          legenda: string
          data_foto: string
        }
        Update: {
          id?: number
          album_id?: number
          url_foto?: string
          legenda?: string
          data_foto?: string
        }
      }
      consulta: {
        Row: {
          id: number
          bebe_id: number
          medico_id: number
          data_consulta: string
          hora_consulta: string
          local: string
          anotacoes: string
        }
        Insert: {
          id?: number
          bebe_id: number
          medico_id: number
          data_consulta: string
          hora_consulta: string
          local: string
          anotacoes?: string
        }
        Update: {
          id?: number
          bebe_id?: number
          medico_id?: number
          data_consulta?: string
          hora_consulta?: string
          local?: string
          anotacoes?: string
        }
      }
    }
  }
} 
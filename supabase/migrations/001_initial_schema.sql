-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth_users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usuario table
CREATE TABLE IF NOT EXISTS usuario (
  id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bebe table
CREATE TABLE IF NOT EXISTS bebe (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  tipo_sanguineo TEXT NOT NULL,
  local_nascimento TEXT NOT NULL,
  nome_pai TEXT NOT NULL,
  nome_mae TEXT NOT NULL,
  nome_avo_paterno TEXT NOT NULL,
  nome_avo_materno TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medico table
CREATE TABLE IF NOT EXISTS medico (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  especialidade TEXT NOT NULL,
  crm TEXT NOT NULL,
  telefone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conteudo_educativo table
CREATE TABLE IF NOT EXISTS conteudo_educativo (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data_publicacao DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exame table
CREATE TABLE IF NOT EXISTS exame (
  id SERIAL PRIMARY KEY,
  bebe_id INTEGER NOT NULL REFERENCES bebe(id) ON DELETE CASCADE,
  tipo_exame TEXT NOT NULL,
  data_exame DATE NOT NULL,
  arquivo_url TEXT NOT NULL,
  resumo_ia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create album table
CREATE TABLE IF NOT EXISTS album (
  id SERIAL PRIMARY KEY,
  bebe_id INTEGER NOT NULL REFERENCES bebe(id) ON DELETE CASCADE,
  nome_album TEXT NOT NULL,
  data_criacao DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create foto table
CREATE TABLE IF NOT EXISTS foto (
  id SERIAL PRIMARY KEY,
  album_id INTEGER NOT NULL REFERENCES album(id) ON DELETE CASCADE,
  url_foto TEXT NOT NULL,
  legenda TEXT NOT NULL,
  data_foto DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consulta table
CREATE TABLE IF NOT EXISTS consulta (
  id SERIAL PRIMARY KEY,
  bebe_id INTEGER NOT NULL REFERENCES bebe(id) ON DELETE CASCADE,
  medico_id INTEGER NOT NULL REFERENCES medico(id) ON DELETE CASCADE,
  data_consulta DATE NOT NULL,
  hora_consulta TIME NOT NULL,
  local TEXT NOT NULL,
  anotacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bebe_usuario_id ON bebe(usuario_id);
CREATE INDEX IF NOT EXISTS idx_medico_usuario_id ON medico(usuario_id);
CREATE INDEX IF NOT EXISTS idx_exame_bebe_id ON exame(bebe_id);
CREATE INDEX IF NOT EXISTS idx_album_bebe_id ON album(bebe_id);
CREATE INDEX IF NOT EXISTS idx_foto_album_id ON foto(album_id);
CREATE INDEX IF NOT EXISTS idx_consulta_bebe_id ON consulta(bebe_id);
CREATE INDEX IF NOT EXISTS idx_consulta_medico_id ON consulta(medico_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_bebe_updated_at BEFORE UPDATE ON bebe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medico_updated_at BEFORE UPDATE ON medico FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exame_updated_at BEFORE UPDATE ON exame FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consulta_updated_at BEFORE UPDATE ON consulta FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
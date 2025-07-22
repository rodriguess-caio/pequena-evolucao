-- Enable Row Level Security on all tables
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE bebe ENABLE ROW LEVEL SECURITY;
ALTER TABLE medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE exame ENABLE ROW LEVEL SECURITY;
ALTER TABLE album ENABLE ROW LEVEL SECURITY;
ALTER TABLE foto ENABLE ROW LEVEL SECURITY;
ALTER TABLE consulta ENABLE ROW LEVEL SECURITY;
ALTER TABLE conteudo_educativo ENABLE ROW LEVEL SECURITY;

-- Usuario policies
CREATE POLICY "Usuários podem ver apenas seus próprios dados" ON usuario
FOR ALL USING (auth.uid() = id);

-- Bebe policies
CREATE POLICY "Usuários podem ver apenas bebês de sua família" ON bebe
FOR ALL USING (auth.uid() = usuario_id);

-- Medico policies
CREATE POLICY "Usuários podem ver apenas médicos que cadastraram" ON medico
FOR ALL USING (auth.uid() = usuario_id);

-- Exame policies
CREATE POLICY "Usuários podem ver apenas exames de seus bebês" ON exame
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM bebe 
    WHERE bebe.id = exame.bebe_id 
    AND bebe.usuario_id = auth.uid()
  )
);

-- Album policies
CREATE POLICY "Usuários podem ver apenas álbuns de seus bebês" ON album
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM bebe 
    WHERE bebe.id = album.bebe_id 
    AND bebe.usuario_id = auth.uid()
  )
);

-- Foto policies
CREATE POLICY "Usuários podem ver apenas fotos de seus álbuns" ON foto
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM album 
    JOIN bebe ON bebe.id = album.bebe_id
    WHERE album.id = foto.album_id 
    AND bebe.usuario_id = auth.uid()
  )
);

-- Consulta policies
CREATE POLICY "Usuários podem ver apenas consultas de seus bebês" ON consulta
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM bebe 
    WHERE bebe.id = consulta.bebe_id 
    AND bebe.usuario_id = auth.uid()
  )
);

-- Conteudo educativo policies (read-only for all authenticated users)
CREATE POLICY "Usuários autenticados podem ler conteúdo educativo" ON conteudo_educativo
FOR SELECT USING (auth.role() = 'authenticated'); 
# Sistema de Autenticação - Migrations e Arquitetura

## 📋 Visão Geral

Este documento descreve as migrations criadas para implementar o sistema de autenticação seguindo a arquitetura proposta: **Next.js + Supabase com NextAPI** para mascarar o acesso direto ao Supabase.

## 🏗️ Arquitetura Implementada

### Fluxo de Dados
```
Frontend (Next.js) → NextAPI Routes → Supabase Auth/Database
```

### Benefícios da Arquitetura
- ✅ **Segurança**: Credenciais do Supabase não expostas no frontend
- ✅ **Controle**: Validação e lógica de negócio centralizada nas APIs
- ✅ **Flexibilidade**: Fácil modificação de regras sem alterar frontend
- ✅ **Monitoramento**: Logs centralizados nas APIs
- ✅ **Cache**: Possibilidade de implementar cache nas APIs

## 📊 Migrations Criadas

### Migration 003: Sistema de Autenticação (`003_auth_system.sql`)

#### Tabelas Criadas

##### 1. **profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Propósito**: Armazena informações do perfil do usuário, estendendo o Supabase Auth.

##### 2. **Atualização da tabela usuario**
```sql
ALTER TABLE usuario ADD CONSTRAINT usuario_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

**Propósito**: Conecta a tabela `usuario` diretamente ao Supabase Auth.

#### Triggers e Funções

##### 1. **handle_new_user()**
- **Trigger**: `on_auth_user_created`
- **Propósito**: Cria automaticamente registros em `profiles` e `usuario` quando um novo usuário se registra
- **Execução**: Após INSERT em `auth.users`

##### 2. **handle_user_update()**
- **Trigger**: `on_auth_user_updated`
- **Propósito**: Atualiza registros em `profiles` e `usuario` quando dados do usuário são modificados
- **Execução**: Após UPDATE em `auth.users`

##### 3. **handle_user_deletion()**
- **Trigger**: `on_auth_user_deleted`
- **Propósito**: Remove registros relacionados quando um usuário é deletado
- **Execução**: Após DELETE em `auth.users`

#### Funções de Aplicação

##### 1. **get_user_profile()**
```sql
CREATE FUNCTION get_user_profile()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
```

**Propósito**: Retorna dados do perfil do usuário atual.

##### 2. **update_user_profile()**
```sql
CREATE FUNCTION update_user_profile(
  new_name TEXT DEFAULT NULL,
  new_avatar_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN
```

**Propósito**: Atualiza dados do perfil do usuário atual.

#### View Criada

##### **user_data**
```sql
CREATE VIEW user_data AS
SELECT 
  u.id,
  u.nome,
  u.email,
  u.data_registro,
  p.avatar_url,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at
FROM usuario u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.id = auth.uid();
```

**Propósito**: View unificada para acesso aos dados do usuário.

## 🔐 Row Level Security (RLS)

### Políticas Implementadas

#### **profiles**
```sql
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON profiles
FOR ALL USING (auth.uid() = id);
```

#### **usuario** (já existente)
```sql
CREATE POLICY "Usuários podem ver apenas seus próprios dados" ON usuario
FOR ALL USING (auth.uid() = id);
```

## 🚀 APIs Next.js Criadas

### 1. **POST /api/auth/register**
- **Função**: Registro de novos usuários
- **Validação**: Schema Zod para dados de entrada
- **Fluxo**: 
  1. Valida dados
  2. Registra no Supabase Auth
  3. Triggers criam automaticamente `profiles` e `usuario`
  4. Retorna confirmação

### 2. **POST /api/auth/login**
- **Função**: Autenticação de usuários
- **Validação**: Schema Zod para credenciais
- **Fluxo**:
  1. Valida credenciais
  2. Autentica no Supabase Auth
  3. Verifica confirmação de e-mail
  4. Retorna dados do usuário e sessão

### 3. **POST /api/auth/logout**
- **Função**: Logout de usuários
- **Fluxo**: Remove sessão do Supabase Auth

### 4. **POST /api/auth/forgot-password**
- **Função**: Solicitação de reset de senha
- **Fluxo**:
  1. Valida e-mail
  2. Envia e-mail de recuperação via Supabase
  3. Redireciona para página de reset

### 5. **GET /api/auth/profile**
- **Função**: Obter dados do perfil atual
- **Fluxo**: Retorna dados do usuário autenticado

### 6. **PUT /api/auth/profile**
- **Função**: Atualizar dados do perfil
- **Fluxo**:
  1. Valida dados
  2. Atualiza via função `update_user_profile()`
  3. Retorna dados atualizados

### 7. **POST /api/auth/resend-confirmation**
- **Função**: Reenvio de e-mail de confirmação
- **Fluxo**: Reenvia e-mail de confirmação via Supabase

## 🔧 Funções de Cliente Atualizadas

### **lib/auth/register.ts**
- ✅ Usa `/api/auth/register` em vez de Supabase direto
- ✅ Usa `/api/auth/resend-confirmation` para reenvio

### **lib/auth/login.ts**
- ✅ Usa `/api/auth/login` em vez de Supabase direto
- ✅ Usa `/api/auth/logout` para logout
- ✅ Usa `/api/auth/profile` para obter usuário atual

### **lib/auth/reset-password.ts**
- ✅ Usa `/api/auth/forgot-password` para solicitar reset
- ⚠️ Mantém acesso direto ao Supabase para `updatePassword` e `verifyResetToken` (necessário para sessão)

## 🎯 Hook Personalizado

### **hooks/useAuth.ts**
- ✅ Gerencia estado de autenticação
- ✅ Fornece métodos para login, registro, logout e reset de senha
- ✅ Atualiza automaticamente estado do usuário
- ✅ Redireciona após operações de autenticação

## 🔄 Fluxo de Autenticação

### Registro
1. Usuário preenche formulário
2. Frontend chama `/api/auth/register`
3. API valida dados e registra no Supabase Auth
4. Trigger cria automaticamente `profiles` e `usuario`
5. E-mail de confirmação é enviado
6. Usuário confirma e-mail

### Login
1. Usuário preenche credenciais
2. Frontend chama `/api/auth/login`
3. API valida credenciais no Supabase Auth
4. Verifica confirmação de e-mail
5. Retorna dados do usuário e sessão
6. Frontend redireciona para dashboard

### Logout
1. Usuário clica em logout
2. Frontend chama `/api/auth/logout`
3. API remove sessão do Supabase Auth
4. Frontend redireciona para login

## 🛡️ Segurança

### Implementada
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Validação de entrada com Zod
- ✅ Triggers para sincronização automática
- ✅ Funções seguras com `SECURITY DEFINER`
- ✅ APIs mascarando acesso direto ao Supabase

### Benefícios
- ✅ Dados isolados por usuário
- ✅ Validação centralizada
- ✅ Sincronização automática de dados
- ✅ Controle de acesso granular

## 📈 Próximos Passos

1. **Testes**: Implementar testes unitários e de integração
2. **Monitoramento**: Adicionar logs e métricas nas APIs
3. **Cache**: Implementar cache para dados de perfil
4. **Rate Limiting**: Adicionar limitação de taxa nas APIs
5. **Auditoria**: Implementar logs de auditoria para ações sensíveis

## 🔗 Arquivos Relacionados

- `supabase/migrations/003_auth_system.sql` - Migration principal
- `app/api/auth/*` - APIs Next.js
- `lib/auth/*` - Funções de cliente
- `hooks/useAuth.ts` - Hook de autenticação
- `lib/validations/auth.ts` - Schemas de validação 
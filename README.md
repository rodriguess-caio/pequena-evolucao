# Pequena Evolução - MVP

Aplicação para acompanhamento do desenvolvimento de bebês, com sistema completo de autenticação e gerenciamento de usuários.

## 🎨 Design System

### Paleta de Cores
- **Azul claro** (`#A5D8F3`) - Cor primária
- **Amarelo suave** (`#FDE9A9`) - Cor secundária  
- **Verde menta** (`#8FDDB8`) - Sucesso/positivo
- **Lavanda** (`#D3B7E7`) - Cor de acento

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Autenticação (80% Concluído)
- **Registro de usuário** com confirmação por e-mail
- **Login** com e-mail e senha
- **Recuperação de senha** via e-mail
- **Proteção de rotas** com middleware
- **Dashboard** funcional com informações do usuário
- **Logout** seguro

### 📱 Páginas Disponíveis
- `/auth/login` - Página de login
- `/auth/register` - Página de registro
- `/auth/forgot-password` - Recuperação de senha
- `/auth/reset-password` - Redefinição de senha
- `/dashboard` - Dashboard principal

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Backend e autenticação
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de dados

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd pequena-evolucao
```

2. **Instale as dependências**
```bash
yarn install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. **Execute o projeto**
```bash
yarn dev
```

5. **Acesse a aplicação**
```
http://localhost:3000
```

## 🔧 Como Usar

### 1. Registro de Usuário
1. Acesse `/auth/register`
2. Preencha nome, e-mail e senha
3. Confirme o e-mail recebido
4. Faça login na aplicação

### 2. Login
1. Acesse `/auth/login`
2. Digite e-mail e senha
3. Será redirecionado para o dashboard

### 3. Recuperação de Senha
1. Acesse `/auth/forgot-password`
2. Digite seu e-mail
3. Clique no link recebido
4. Defina uma nova senha

### 4. Dashboard
- Visualize informações da conta
- Acesse funcionalidades principais
- Faça logout da aplicação

## 📁 Estrutura do Projeto

```
pequena-evolucao/
├── app/                    # Páginas Next.js 14
│   ├── auth/              # Páginas de autenticação
│   └── dashboard/         # Dashboard principal
├── components/            # Componentes React
│   ├── auth/             # Componentes de autenticação
│   └── ui/               # Componentes de interface
├── lib/                  # Utilitários e configurações
│   ├── auth/             # Funções de autenticação
│   ├── supabase/         # Configuração do Supabase
│   └── validations/      # Schemas de validação
├── hooks/                # Hooks personalizados
├── docs/                 # Documentação
└── public/               # Arquivos estáticos
```

## 🎯 Próximos Passos

### Sprint Atual
- [ ] Página de perfil do usuário
- [ ] Atualização de dados pessoais
- [ ] Testes de integração

### Próximas Funcionalidades
- [ ] Cadastro de bebês
- [ ] Acompanhamento de desenvolvimento
- [ ] Upload de exames
- [ ] Relatórios e gráficos

## 📊 Status do Projeto

- **Épico 1 - Autenticação**: 80% concluído ✅
- **Épico 2 - Gerenciamento de Bebês**: Pendente
- **Épico 3 - Exames**: Pendente

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos canais oficiais do projeto.

---

**Pequena Evolução** - Acompanhando cada pequeno passo do desenvolvimento infantil. 👶✨ 
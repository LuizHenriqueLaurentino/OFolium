# OFolium

O OFolium é uma aplicação desenvolvida para auxiliar microempreendedores na organização das informações de seus funcionários. O sistema busca substituir anotações em papel, mensagens dispersas e planilhas complexas por uma solução simples e centralizada.

## Situação atual

O OFolium encontra-se na Fase 02 de desenvolvimento, com integração funcional entre frontend e backend nas principais operações do sistema. A aplicação utiliza Supabase para autenticação, gerenciamento de sessões e persistência de dados em PostgreSQL. Atualmente, as contas reais permitem gerenciar funcionários e registrar movimentações de horas extras, faltas, vales, adicionais e descontos, enquanto o modo demonstração utiliza dados locais.

A versão web está publicada na Vercel e disponível para acesso e testes. 

Acesse a versão web:
https://o-folium.vercel.app/login

Funcionalidades

Cadastro, login, recuperação de senha e gerenciamento de sessão;

Cadastro e atualização dos dados da empresa;

Cadastro, consulta, edição, ativação e desativação de funcionários;

Registro de horas extras e faltas;

Registro de vales, adicionais e descontos;

Consulta ao histórico de movimentações cadastradas;

Visualização de indicadores e estimativas gerenciais;

Demonstrativo gerencial em PDF, com download disponível na versão web;

Modo demonstração com dados locais, separado das contas reais.

Funcionalidades em desenvolvimento ou parcialmente implementadas:

Fechamento mensal persistente;

Revisão e reabertura de competências;

Notificações e alertas com persistência;

Histórico salarial na interface;

Edição e exclusão de movimentações pela interface;

Exportação em Excel e CSV.

OFolium Pro

O OFolium Pro é uma proposta de plano para negócios que necessitam gerenciar equipes maiores e utilizar funcionalidades complementares. O sistema já possui estrutura para identificar o plano associado ao negócio.

Entre os recursos previstos para o plano Pro estão:

Gerenciamento de até 20 funcionários;

Histórico ampliado de movimentações;

Revisão mensal por funcionário;

Comparação de informações entre meses;

Relatórios gerenciais para apoio ao contador;

Alertas de pendências.

A disponibilidade desses recursos depende da conclusão das respectivas implementações.

Tecnologias utilizadas

React Native;

Expo;

Expo Router;

TypeScript;

Supabase Auth;

Supabase JavaScript Client;

PostgreSQL;

Row Level Security (RLS);

jsPDF;

jsPDF-AutoTable;

Git e GitHub;

Vercel.

Executando o projeto

Pré-requisitos

Node.js;

npm.

O Expo usado pelo projeto é instalado pelas dependências. Não é preciso instalá-lo à parte.

1. Clone o repositório e entre na pasta.

```bash
git clone https://github.com/rafaelhenriquelc-prog/OFolium.git
cd OFolium
```

2. Instale as dependências a partir do `package-lock.json`.

```bash
npm ci
```

3. Crie o `.env` a partir do exemplo.

No Windows, PowerShell:

```powershell
Copy-Item .env.example .env
```

No macOS ou Linux:

```bash
cp .env.example .env
```

4. Preencha as variáveis que `src/lib/supabase.ts` lê. Os nomes abaixo são os do `.env.example`. Os valores são só um exemplo: use o projeto Supabase em que a aplicação deve gravar.

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```

`EXPO_PUBLIC_SUPABASE_URL` é o Project URL, em Project Settings → API.

`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` é a chave publicável desse projeto, também chamada de chave anon. Não coloque a chave secreta `service_role` nesse arquivo. O `.env` fica só na máquina local e não entra no Git.

Conta real: abra a aplicação e use Criar conta, ou entre com um usuário já cadastrado no Auth desse mesmo projeto. Funcionários, movimentações e dados do negócio dessa conta são gravados no Supabase.

Demonstração: o acesso depende de uma conta de demonstração cadastrada no Supabase Auth do projeto configurado. Esse login ainda precisa ser validado.

5. Inicie a versão web.

```bash
npm run web
```

Esse script executa `expo start --web`. O terminal mostra o endereço local, em geral `http://localhost:8081`.

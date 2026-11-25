# UlifeConecta

Aplicação web acadêmica mobile-first para conectar estudantes, compartilhar materiais e acompanhar a comunidade.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Firebase Authentication (email e senha)
- Cloud Firestore

## Requisitos

- Node.js 18 ou superior
- npm
- Um projeto Firebase com Authentication (Email/Senha) e Firestore ativados

## Desenvolvimento local

1. Instale as dependências:

   ```sh
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha as configurações do app Web Firebase. Consulte [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).
3. Inicie o servidor local:

   ```sh
   npm run dev
   ```

4. Verifique a compilação de produção:

   ```sh
   npm run build
   ```

## Estado da integração

- Cadastro, login e redefinição de senha usam Firebase Authentication.
- Comentários são lidos e gravados em `posts/{postId}/comments`.
- A tela Conteúdo lê materiais publicados na coleção `contents`.
- O feed, curtidas, salvos e notificações ainda usam dados locais de demonstração.
- Publicar as regras de [firestore.rules](./firestore.rules) no Firebase antes de usar comentários e materiais.

Não versionamos `.env.local`, credenciais de serviço, `node_modules` ou `dist`.

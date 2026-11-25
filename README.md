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

## Publicação no GitHub Pages

O deploy é feito automaticamente pelo GitHub Actions a cada push na branch `main`.

1. No GitHub, abra **Settings → Secrets and variables → Actions → Variables** e crie as seis variáveis abaixo com os valores do app Web Firebase (use os mesmos valores de `.env.local`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
2. Em **Settings → Pages**, selecione **GitHub Actions** como fonte de publicação.
3. Aguarde o workflow **Deploy to GitHub Pages** terminar. O site ficará disponível em `https://gpossobon.github.io/UlifeConecta/`.
4. No Firebase Console, adicione `gpossobon.github.io` em **Authentication → Settings → Authorized domains** para permitir login e cadastro no domínio publicado.

As variáveis do Firebase Web são incorporadas ao JavaScript do site e ficam públicas para os visitantes, como em qualquer app Firebase cliente. Não use credenciais de Admin SDK, chaves de conta de serviço ou outros segredos nessas variáveis.

## Estado da integração

- Cadastro, login e redefinição de senha usam Firebase Authentication.
- Comentários são lidos e gravados em `posts/{postId}/comments`.
- A tela Conteúdo lê materiais publicados na coleção `contents`.
- O feed, curtidas, salvos e notificações ainda usam dados locais de demonstração.
- Publique as regras de [firestore.rules](./firestore.rules) no Firebase antes de usar comentários e materiais.

Não versionamos `.env.local`, credenciais de serviço, `node_modules` ou `dist`.

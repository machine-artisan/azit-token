## token-azit

Next.js (App Router) + TypeScript + Tailwind CSS + ESLint + Prettier + `framer-motion`.

## Local setup

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful scripts

- **Lint**:

```bash
npm run lint
```

- **Format**:

```bash
npm run format
```

## Docker

Build the image:

```bash
docker build -t token-azit .
```

Run the container:

```bash
docker run --rm -p 3000:3000 token-azit
```

Then open `http://localhost:3000`.

## Notes

- This project is configured with `output: "standalone"` for smaller Docker images.

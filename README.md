# React + TypeScript + Vite

### tree
pro-dev-notes
│   .gitignore
│   eslint.config.js
│   index.html
│   package-lock.json
│   package.json
│   README.md
│   RoadMap.md
│   tsconfig.app.json
│   tsconfig.json
│   tsconfig.node.json
│   vite.config.ts
│
└───src
    │   index.css
    │   main.tsx
    │
    ├───app
    │       App.tsx
    │
    ├───db
    │   │   database.ts
    │   │   schema.ts
    │   │
    │   └───migrations
    ├───features
    │   ├───folders
    │   ├───notes
    │   │   ├───components
    │   │   │       NoteManager.tsx
    │   │   │
    │   │   ├───domain
    │   │   │       Note.ts
    │   │   │
    │   │   ├───repositories
    │   │   │       note.repository.ts
    │   │   │
    │   │   └───services
    │   │           note.service.ts
    │   │
    │   └───tags
    └───shared
        ├───constants
        ├───types
        └───utils


---
:root {
  /* --- PALETA DE GRISES CLAROS --- */
  --bg: #999999;           /* Fondo principal: Gris slate muy claro */
  --text: #353535;         /* Texto cuerpo: Gris slate oscuro legible */
  --text-h: #f3f3f3;       /* Títulos: Gris slate casi negro */
  --border: #e2e8f0;       /* Bordes y líneas sutiles */
  --code-bg: #e2e8f0;      /* Fondo de bloques de código */
  --accent: #64748b;       /* Color de acento neutro (Gris medio) */
  --accent-bg: #f1f5f9;    /* Fondo suave para resaltar elementos */
  --shadow: 
    rgba(15, 23, 42, 0.05) 0px 4px 6px -1px, 
    rgba(15, 23, 42, 0.03) 0px 2px 4px -1px;

  /* --- TIPOGRAFÍAS --- */
  --sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* --- CONFIGURACIÓN BASE --- */
  font: 18px/150% var(--sans);
  letter-spacing: -0.01em;
  color: var(--text);
  background: var(--bg);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;

  @media (max-width: 824px) {
    font-size: 16px;
  }
}

body {
  margin: 0;
  background-color: var(--bg);
}

/* --- CONTENEDOR CENTRAL DE PRUEBAS --- */
#root {
  width: 1000px;
  max-width: 100%;
  margin: 0 auto;
  padding: 40px 24px;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* --- TIPOGRAFÍA Y ENCABEZADOS --- */
h1, h2, h3 {
  font-family: var(--sans);
  font-weight: 600;
  color: var(--text-h);
  margin: 0;
}

h1 {
  font-size: 48px;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
  @media (max-width: 824px) {
    font-size: 32px;
  }
}

h2 {
  font-size: 24px;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
  @media (max-width: 824px) {
    font-size: 20px;
  }
}

p {
  margin: 0 0 16px 0;
}

button,
input,
textarea {
  font: inherit;
}

input,
textarea {
  padding: 8px;
}

button {
  padding: 6px 10px;
  cursor: pointer;
}



/* --- ELEMENTOS DE CÓDIGO Y ETIQUETAS --- */
code {
  font-family: var(--mono);
  font-size: 14px;
  color: var(--text-h);
  background: var(--code-bg);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

/* --- CAJA DE PRUEBAS EXTRA (OPCIONAL) --- */
.card-prueba {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
  margin-top: 20px;
}

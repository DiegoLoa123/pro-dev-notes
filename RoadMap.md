# GOALS

## Fase 1 - Editor básico

☑ Crear DB
☑ Crear nota
☑ Editar nota
☑ Autosave
☑ Listar notas
☑ Abrir nota
☑ Borrar nota
☑ Papelera

**COMPLETADO**

---

# Fase 2 - Editor enriquecido

☑ Instalar Tiptap
☑ Sustituir textarea por editor

☑ Bold
☑ Italic
☑ Underline

☑ Heading 1
☑ Heading 2
☑ Heading 3

☑ Bullet List
☑ Ordered List

☑ Blockquote

☑ Code
☑ CodeBlock

☑ Text color
☑ Highlight

☑ Undo
☑ Redo

☑ Persistir contenido Tiptap
☑ Migración DB v1 → v2

**COMPLETADO**

---

# Fase 3 - Carpetas

## 3.1 Modelo y persistencia
☑ Crear entidad Folder
☑ Crear tabla folders
☑ Añadir folderId a Note
☑ Migración DB v2 → v3

## 3.2 CRUD
☑ Crear carpeta
☑ Listar carpetas
☑ Renombrar carpeta
☑ Eliminar carpeta

## 3.3 Notas y carpetas
☑ Mover nota a carpeta
☑ Mover nota a "Sin carpeta"
☑ Filtrar notas por carpeta

## 3.4 Jerarquía
☑ Añadir parentId
☑ Crear subcarpetas
☑ Mostrar árbol de carpetas
☑ Mover carpetas
☑ Evitar ciclos entre carpetas

---

# Fase 4 - Tags
☑ Crear Tag
☑ Editar Tag
☑ Eliminar Tag

☑ Asociar múltiples tags a nota
☑ Quitar tag
☑ Filtrar notas por tag

---

# Fase 5 - InterLinks

## 5.1 Persistencia
☑ Crear NoteLink
☑ Crear tabla noteLinks
☑ Migración DB v4 → v5
☑ Repository
☑ Service

## 5.2 Sintaxis
☑ Detectar [[Nota]]
☑ Buscar nota por título
☑ Convertir referencia a noteId
☑ Mostrar enlace dentro de Tiptap

## 5.3 Navegación
☑ Click en link
☑ Abrir nota destino
☑ Mantener link al mover nota
☑ Mantener link al renombrar nota
☑ Modo lectura

## 5.4 Relaciones
☑ Nextlink / Adelante
☑ Backlink / Atrás
☑ Detectar enlaces rotos

---

# Fase 6 - UI/UX
☐ 6.0 React Router
☐ 6.1 Refactor UI
☐ 6.2 Sidebar
☐ 6.3 Header
☐ 6.4 Toolbar
☐ 6.5 iconos
☐ 6.6 Responsive
☐ 6.7 Dark Mode
☐ 6.8 Read Mode

---

# Fase 7 - Graph View
☐ Backlinks reales
☐ Graph Service
☐ Graph View
☐ Graph Filters

---

# Fase 8 - Búsqueda
☐ Search Service
☐ Global Search
☐ Ctrl + K
☐ [[Suggestions]]

---

# Fase 9 - PWA	Instalación
☐ Manifest
☐ Service Worker
☐ Install
☐ Mobile/offline tests

---

# Fase 10 - Asegurar Data
☐ DB v6
☐ Revision History
☐ Local Backup
☐ Restore
☐ Encryption
☐ Cloud Backup

---
# Fase extra
⭐ favoritos
📌 notas fijadas
🗑 papelera
📦 archivo
📜 historial de cambios
🔗 backlinks
🏷 tags
📂 carpetas anidadas
🔒 carpetas privadas
🔎 búsqueda global
🔍 búsqueda dentro de nota
🔁 buscar/reemplazar
📝 contador de palabras
📊 contador de caracteres
📅 createdAt / updatedAt
↩ undo/redo
📤 exportar Markdown
📥 importar Markdown
💾 exportar backup
☁ backup Drive
🔐 backup cifrado
📴 modo completamente offline

# FileVault — Frontend

A Next.js 16 (App Router) frontend for the FileVault secure file storage service. Features a fully dark, premium UI with drag-and-drop upload, animated file cards, real-time status feedback, and live file listing.

---

## Tech Stack

| Layer        | Technology                            |
|--------------|---------------------------------------|
| Framework    | Next.js 16 (App Router, Turbopack)    |
| Language     | TypeScript                            |
| Styling      | Tailwind CSS v4 + custom CSS vars     |
| Animation    | Framer Motion                         |
| Icons        | Lucide React                          |
| Utilities    | clsx + tailwind-merge                 |
| Font         | Inter (Google Fonts, via CSS import)  |

---

## Project Structure

```
frontend/
├── app/
│   ├── globals.css     # Design system: CSS variables, aurora bg, glass, buttons
│   ├── layout.tsx      # Root layout with metadata
│   └── page.tsx        # Main page: upload zone, file vault, animations
├── public/             # Static assets
├── next.config.ts      # Next.js config (React Compiler enabled)
├── tailwind.config.js  # Tailwind config
└── package.json
```

---

## Environment

The API base URL is hardcoded in `app/page.tsx`:

```ts
const API_BASE = "https://filevaulttask.onrender.com";
```

To point at a local backend, change this to `http://localhost:5000`.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

Development server runs at `http://localhost:3000`.

---

## Design System — `globals.css`

All design tokens are CSS custom properties on `:root`:

| Variable          | Value                            | Usage                        |
|-------------------|----------------------------------|------------------------------|
| `--bg`            | `#06060f`                        | Page background              |
| `--surface`       | `rgba(255,255,255,0.04)`         | Card backgrounds             |
| `--surface-hover` | `rgba(255,255,255,0.07)`         | Hovered card/button          |
| `--border`        | `rgba(255,255,255,0.08)`         | Subtle borders               |
| `--border-strong` | `rgba(255,255,255,0.14)`         | Emphasized borders           |
| `--text`          | `#f0f0ff`                        | Primary text                 |
| `--text-muted`    | `rgba(200,200,230,0.5)`          | Secondary text               |
| `--text-subtle`   | `rgba(200,200,230,0.3)`          | Placeholder / metadata text  |
| `--primary`       | `#8b5cf6`                        | Violet accent                |
| `--primary-glow`  | `rgba(139,92,246,0.4)`           | Button / logo glow           |
| `--primary-dim`   | `rgba(139,92,246,0.12)`          | Badge / chip backgrounds     |
| `--accent`        | `#06b6d4`                        | Cyan gradient accent         |
| `--danger`        | `#f43f5e`                        | Delete / error               |
| `--success`       | `#10b981`                        | Success state                |

### Utility classes

| Class            | Description                                      |
|------------------|--------------------------------------------------|
| `.aurora`        | Fixed full-screen animated gradient background   |
| `.noise`         | Fixed SVG noise texture overlay                  |
| `.glass`         | Glassmorphism card (low opacity bg + blur)       |
| `.glass-strong`  | Heavier glass card                               |
| `.glow-primary`  | Violet box-shadow glow                           |
| `.badge`         | Pill label with primary tint                     |
| `.stat-pill`     | Compact stat chip (icon + text)                  |
| `.btn-primary`   | Gradient CTA button with glow                    |
| `.btn-ghost`     | Subtle secondary button                          |
| `.btn-danger`    | Icon-only destructive button                     |
| `.progress-track`| Thin progress bar track                          |
| `.progress-fill` | Animated gradient progress fill                  |
| `.icon-image`    | Pink tint for image file icons                   |
| `.icon-video`    | Orange tint for video icons                      |
| `.icon-audio`    | Violet tint for audio icons                      |
| `.icon-pdf`      | Red tint for PDF icons                           |
| `.icon-doc`      | Blue tint for document icons                     |
| `.icon-zip`      | Yellow tint for archive icons                    |
| `.icon-code`     | Green tint for code file icons                   |
| `.icon-other`    | Slate tint for unrecognized types                |

---

## Page Component — `app/page.tsx`

### State

| State           | Type              | Description                                        |
|-----------------|-------------------|----------------------------------------------------|
| `files`         | `FileItem[]`      | All files fetched from the API                     |
| `selectedFile`  | `File \| null`    | File staged for upload                             |
| `status`        | `string`          | Success / progress message shown to user           |
| `error`         | `string`          | Error message shown in the status bar              |
| `loading`       | `boolean`         | True while fetching the file list                  |
| `uploading`     | `boolean`         | True during an active upload                       |
| `isDragging`    | `boolean`         | True when a file is dragged over the drop zone     |
| `deletingId`    | `string \| null`  | The `_id` of the file currently being deleted      |
| `uploadProgress`| `number`          | 0–100, drives the upload progress bar              |

### Key functions

| Function       | Description                                                              |
|----------------|--------------------------------------------------------------------------|
| `loadFiles()`  | `GET /files` — populates the file list. Called on mount and after writes.|
| `handleUpload` | `POST /files` with `multipart/form-data`. Fakes progress ticks for UX.  |
| `handleDelete` | `DELETE /files/:id` — removes a file optimistically from state.          |
| `onDragEnter/Leave/Over/Drop` | Manages the drag-and-drop state with a ref counter to prevent flickering on child element re-entry. |

### Helper functions

| Function          | Description                                      |
|-------------------|--------------------------------------------------|
| `formatSize(bytes)` | Converts bytes → human-readable KB/MB string   |
| `getFileIcon(mimetype)` | Returns `{ Icon, cls }` for color-coded file type icons |
| `timeAgo(dateStr)`  | Converts ISO date → relative string ("3h ago") |

---

## Deployment

The app is a standard Next.js project and can be deployed to:

- **Vercel** — zero-config, just connect the repo
- **Render** — add a Web Service with `npm run build && npm start`
- **Any Node host** — `npm run build` then `npm start`

Make sure to update `API_BASE` in `page.tsx` (or move it to an env variable) before deploying to production:

```ts
// app/page.tsx
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://filevaulttask.onrender.com";
```

And in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://filevaulttask.onrender.com
```

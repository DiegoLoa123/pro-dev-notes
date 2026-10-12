import { NavLink } from 'react-router-dom';

interface NotesHeaderProps {
  onNewNote: () => void;
}

export function NotesHeader({
  onNewNote,
}: NotesHeaderProps) {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    [ 'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'border-violet-300 bg-violet-100 text-violet-800'
        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100',
    ].join(' ');

  return (
    <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-bold sm:text-2xl">
        Pro Dev Notes
      </h1>
      <nav
        aria-label="Navegación principal"
        className="flex flex-wrap items-center gap-2"
      >
        <NavLink to="/notes" className={navClass}>
          Notas
        </NavLink>
        <NavLink to="/trash" className={navClass}>
          Papelera
        </NavLink>

        <button
          type="button"
          onClick={onNewNote}
          className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          + Nueva nota
        </button>
      </nav>
    </header>
  );
}
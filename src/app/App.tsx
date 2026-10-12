import { Route, Routes } from 'react-router-dom';
import { NoteManager } from "../features/notes/components/NoteManager";

function App() {
  return (
    <Routes>
      <Route path="*" element="Page not found" />
      <Route path="/notes" element={<NoteManager />} />
    </Routes>
  );
}

export default App
import { Routes, Route } from 'react-router-dom';
import AllTodos from './pages/AllTodos';
import ListsManagementPage from './pages/ListsManagementPage';
import ListTodosPage from './pages/ListTodosPage';
import MainLayout from './layouts/MainLayout';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

function App() {
  return (
    <>
      <CssBaseline />
      <MainLayout>
        <Routes>
          <Route path="/" element={<AllTodos />} />
          <Route path="/lists" element={<ListsManagementPage />} />
          <Route path="/lists/:listId" element={<ListTodosPage />} />
        </Routes>
      </MainLayout>
    </>
  );
}

export default App;
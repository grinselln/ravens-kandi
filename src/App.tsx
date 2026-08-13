import { Route, Routes } from 'react-router-dom'
import Home from "./pages";
import Creations from "./pages/Creations";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin"
import AdminPhotos from "./pages/Admin/AdminPhotos";
import RequireAuth from './components/RequireAuth';
import AdminCategories from './pages/Admin/AdminCategories';
import AdminTypes from './pages/Admin/AdminTypes';
import { useEffect } from 'react';
import Login from './pages/Login/Login';
import Layout from './components/Layout/Layout';

function App() {
  useEffect(() => {
    let openModals = 0;

    const handleOpen = () => {
      openModals++;
      document.body.classList.add("modal-open");
    };

    const handleClose = () => {
      openModals = Math.max(openModals - 1, 0);

      if (openModals === 0) {
        document.body.classList.remove("modal-open");
      }
    };

    window.addEventListener("modal:open", handleOpen);
    window.addEventListener("modal:close", handleClose);

    return () => {
      window.removeEventListener("modal:open", handleOpen);
      window.removeEventListener("modal:close", handleClose);
    };
  }, []);
  
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/creations" element={<Creations />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        <Route path="/admin/photos" element={<RequireAuth><AdminPhotos /></RequireAuth>} />
        <Route path="/admin/categories" element={<RequireAuth><AdminCategories /></RequireAuth>} />
        <Route path="/admin/types" element={<RequireAuth><AdminTypes /></RequireAuth>} />
      </Route>
    </Routes>
  );
}

export default App;
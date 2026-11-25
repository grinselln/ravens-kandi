import { Route, Routes } from 'react-router-dom'
import Home from "./pages";
import Creations from "./pages/Creations";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin"
import AdminPhotos from "./pages/Admin/AdminPhotos";
import AdminCategories from './pages/Admin/AdminCategories';
import AdminTypes from './pages/Admin/AdminTypes';
import { useEffect } from 'react';
import Login from './pages/Login/Login';
import AdminInventory from './pages/Admin/AdminInventory';
import AdminToDo from './pages/Admin/AdminToDo';
import { RequireRole } from './components/RequireRole';
import { AdminAuthLayout } from './components/AdminAuthLayout';

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
      {/*public*/}
      <Route path="/" element={<Home />} />
      <Route path="/creations" element={<Creations />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />

      {/*user*/}
      <Route element={<AdminAuthLayout />}>
        <Route element={<RequireRole />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route element={<RequireRole />}>
          <Route path="/admin/photos" element={<AdminPhotos />} />
        </Route>
        <Route element={<RequireRole />}>
          <Route path="/admin/todo" element={<AdminToDo />} />
        </Route>

        {/*admin*/}
        <Route element={<RequireRole admin />}>
          <Route path="/admin/inventory" element={<AdminInventory />} />
        </Route>
        <Route element={<RequireRole admin />}>
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Route>
        <Route element={<RequireRole admin />}>
          <Route path="/admin/types" element={<AdminTypes />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
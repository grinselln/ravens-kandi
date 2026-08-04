import { Link, NavLink, useNavigate } from 'react-router-dom'
import styles from './Layout.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import { faArrowRightFromBracket, faDiamond } from '@fortawesome/free-solid-svg-icons'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useRef, useState } from 'react'
import { useSessionStore } from '../Admin/Providers/SessionProvider'
import Modal from '../Modal/Modal'
import Button from '../Input/Button/Button'
import { useAuth } from '@/hooks/useAuth'
import ActionButton from '../Admin/Rows/ActionElements/ActionButton/ActionButton'
import { getMe, logout } from '@/api/auth';

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_ORIGIN = new URL(API_URL).origin;

interface LayoutProps {
  children: React.ReactNode
  darkNav?: boolean
  isAdmin?: boolean;
}

function Layout({ children, darkNav = false, isAdmin = false }: LayoutProps) {
  const navigate = useNavigate();
  const {isSessionExpired, dismissSessionExpired} = useSessionStore();
  const { user } = useAuth();
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolvedRef = useRef(false);

  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const openAuthPopup = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    clearPoll();
    resolvedRef.current = false;

    popupRef.current = window.open(
      `${API_URL}/auth/google?popup=true`,
      'googleAuth',
      `width=500,height=600,left=${left},top=${top}`
    );

    pollRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        clearPoll();
        if (!resolvedRef.current) {
          //decide if error message
        }
      }
    }, 500);
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== API_URL_ORIGIN) return;
      if (event.data === 'auth-success') {
        resolvedRef.current = true;
        clearPoll();
        popupRef.current?.close();

        getMe().then(user => {
          if (user) dismissSessionExpired();
        });  
      } else if (event.data === 'auth-failure') {
        resolvedRef.current = true;
        clearPoll();
        popupRef.current?.close();
      }
    };

    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
      clearPoll();
    }
  }, []);

  return (
    <div className={`${styles.layout} ${darkNav ? styles['nav-dark'] : ''} ${isAdmin ? styles['admin'] : ''}`}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>Raven's<FontAwesomeIcon icon={faDiamond} />Kandi</Link>
        <button className={styles.open} onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}><FontAwesomeIcon icon={faBars} /></button>
        {!darkNav && !isAdmin && (
          <div className={`${styles['nav-links-wrapper']}${isMobileNavOpen ? ` ${styles.open}` : ""}`}>
            <button className={styles.close} onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}><FontAwesomeIcon icon={faClose} /></button>
            <ul className={styles['nav-links']}>
              <li><NavLink to="/">Home</NavLink></li>
              <li><NavLink to="/creations">Creations</NavLink></li>
              <li><NavLink to="/about">About</NavLink></li>
              <li><NavLink to="/contact">Contact</NavLink></li>
              <li><a href="https://www.instagram.com/ravenskandi" className={styles['social-media']} target="_blank"><FontAwesomeIcon icon={faInstagram} /></a></li>
            </ul>
          </div>
        )}
        {isAdmin && user?.username && (
          <div className={styles.account}>
            <span>Welcome, {user.username}</span>
            <ActionButton variant="default" icon={faArrowRightFromBracket} isDisabled={false} onAction={async () => {
              try {
                await logout();
                navigate("/login");
              } catch (err) {
                // error message
              }
            }} />
          </div>
        )}
      </nav>
      <main>{children}</main>
      <Modal
        visibility={isSessionExpired}
        title='Session Expired'
        modalButtons={
          <>
            <Button additionalClass="default" onClick={() => openAuthPopup()} isDisabled={false}>Authenticate</Button>
          </>
        }
      >
        <p>Your session has timed out. Please reauthenticate to continue.</p>
      </Modal>
    </div>
  )
}

export default Layout
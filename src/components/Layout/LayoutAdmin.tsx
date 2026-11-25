import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './LayoutAdmin.module.scss'
import { faArrowRightFromBracket, faBoxesStacked, faDiamond, faHouse, faImage, faListCheck, faTableCellsLarge, faTag } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import Button from '../Input/Button/Button';
import { useDeleteConfirmation } from '../Admin/Providers/DeleteModalContext';
import { useAuth } from '../Admin/Providers/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '../Admin/Providers/SessionContext';

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_ORIGIN = new URL(API_URL).origin;

import { useEffect, useRef } from 'react';
import { getMe, logout } from '@/api/auth';
import ActionButton from '../Admin/Rows/ActionElements/ActionButton/ActionButton';

interface ILayoutAdmin {
  children: React.ReactNode;
}

const LayoutAdmin = ({children}: ILayoutAdmin) => {
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolvedRef = useRef(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient()
  const {isSessionExpired, dismissSessionExpired} = useSessionStore();
  const { user, isAdmin } = useAuth();
  const {recordType, warningMessage, onDismissWarningMessage, onConfirmWarning} = useDeleteConfirmation();

  const links = {
    DASHBOARD: "",
    PHOTOS: "photos",
    INVENTORY: "inventory",
    TODO: "todo",
    CATEGORIES: "categories",
    TYPES: "types"
  }

  const currentPage = window.location.pathname.replace("/admin", "").replace("/", "");

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
  }, [dismissSessionExpired]);
  
  return (
    <div className={`${styles.admin}`}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>Raven's<FontAwesomeIcon icon={faDiamond} />Kandi</Link>
          <div className={styles.account}>
            <span>Welcome{user?.username ? `, ${user.username}` : ""}</span>
            <ActionButton variant="default" icon={faArrowRightFromBracket} isDisabled={false} onAction={async () => {
              try {
                await logout();
                queryClient.setQueryData(["me"], null);
                navigate("/login");
              } catch (err) {
                console.log("[logout error]: ", err);
              }
            }} />
          </div>
      </nav>
      <main>
        <div className={styles.sidebar}>
          <ul>
            <li>
              <Link to="/admin" className={currentPage === links.DASHBOARD ? styles.active : ""}>
                <span><FontAwesomeIcon icon={faHouse} /> <span>Dashboard</span></span>
              </Link>
            </li>
            <li>
              <Link to="/admin/photos" className={currentPage === links.PHOTOS ? styles.active : ""}>
                <FontAwesomeIcon icon={faImage} /> Photos
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin/inventory" className={currentPage === links.INVENTORY ? styles.active : ""}>
                  <FontAwesomeIcon icon={faBoxesStacked} /> Inventory
                </Link>
              </li>
            )}
            <li>
              <Link to="/admin/todo" className={currentPage === links.TODO ? styles.active : ""}>
                <FontAwesomeIcon icon={faListCheck} /> To Do
              </Link>
            </li>
            {isAdmin && (
              <>
                <li>
                  <Link to="/admin/types" className={currentPage === links.TYPES ? styles.active : ""}>
                    <FontAwesomeIcon icon={faTag} /> Types
                  </Link>
                </li>
                <li>
                  <Link to="/admin/categories" className={currentPage === links.CATEGORIES ? styles.active : ""}>
                    <FontAwesomeIcon icon={faTableCellsLarge} /> Categories
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </main>
      <Modal
          visibility={warningMessage !== null}
          setVisibility={() => onDismissWarningMessage()}
          additionalClass={['delete-confirm']}
          title={`Confirm ${recordType} Deletion`}
          modalButtons={
            <>
              <Button additionalClass={["outline-muted"]} onClick={() => onDismissWarningMessage()} isDisabled={false}>Cancel</Button>
              <Button additionalClass={["alert"]} onClick={() => onConfirmWarning ? onConfirmWarning() : null} isDisabled={false}>Delete</Button>
            </>
          }
        >
          <p>{warningMessage}</p>
      </Modal>
      <Modal
        additionalClass={["session"]}
        visibility={isSessionExpired}
        title='Session Expired'
        modalButtons={
          <>
            <Button additionalClass={["default"]} onClick={() => openAuthPopup()} isDisabled={false}>Authenticate</Button>
          </>
        }
      >
        <p>Your session has timed out. Please reauthenticate to continue.</p>
      </Modal>
    </div>
  );
};

export default LayoutAdmin;


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './LayoutAdmin.module.scss'
import Layout from "@/components/Layout/Layout";
import { faHouse, faImage, faTableCellsLarge, faTableList, faTag } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Input/Button/Button';
import { useDeleteConfirmation } from '../Admin/Providers/DeleteModalProvider';

interface ILayoutAdmin {
  children: React.ReactNode;
}

const LayoutAdmin = ({children}: ILayoutAdmin) => {
  const {recordType, warningMessage, onDismissWarningMessage, onConfirmWarning} = useDeleteConfirmation();

  const links = {
    DASHBOARD: "dashboard",
    PHOTOS: "photos",
    CATEGORIES: "categories",
    TYPES: "types"
  }

  const currentPage = window.location.href;
  
  return (
    <Layout isAdmin={true}>
        <div className={styles.sidebar}>
          <ul>
            <li>
              <Link to="/admin" className={currentPage.includes(links.DASHBOARD) ? styles.active : ""}>
                <FontAwesomeIcon icon={faHouse} /> <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/photos" className={currentPage.includes(links.PHOTOS) ? styles.active : ""}>
                <FontAwesomeIcon icon={faImage} /> Photos
              </Link>
            </li>
            <li>
              <Link to="/admin/types" className={currentPage.includes(links.TYPES) ? styles.active : ""}>
                <FontAwesomeIcon icon={faTag} /> Types
              </Link>
            </li>
            <li>
              <Link to="/admin/categories" className={currentPage.includes(links.CATEGORIES) ? styles.active : ""}>
                <FontAwesomeIcon icon={faTableCellsLarge} /> Categories
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.body}>
          {children}
        </div>
        <Modal
          visibility={warningMessage !== null}
          setVisibility={() => onDismissWarningMessage()}
          additionalClass='delete-confirm'
          title={`Confirm ${recordType} Deletion`}
          modalButtons={
            <>
              <Button additionalClass="outline-muted" onClick={() => onDismissWarningMessage()} isDisabled={false}>Cancel</Button>
              <Button additionalClass="alert" onClick={() => onConfirmWarning ? onConfirmWarning() : null} isDisabled={false}>Delete</Button>
            </>
          }
        >
          <p>{warningMessage}</p>
      </Modal>
    </Layout>
  );
};

export default LayoutAdmin;
function useSatate<T>(DASHBOARD: string): [any, any] {
  throw new Error('Function not implemented.');
}


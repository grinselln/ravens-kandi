import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './RowLink.module.scss';
import { faLink } from '@fortawesome/free-solid-svg-icons';

interface IRowLink {
  title: string;
}

const RowLink = ({ title } : IRowLink) => {
  return (
    <div className={styles.trigger}>
      <FontAwesomeIcon icon={faLink} />
      <span>{title}</span>
    </div>
  );
};

export default RowLink;

import styles from './RowsWrapper.module.scss';

interface IRowsWrapper {
  additionalClass?:string;
  children: React.ReactNode;
  ref?: any;
}

const RowsWrapper = ({ additionalClass, children, ref } : IRowsWrapper) => {
  return (
    <div ref={ref} className={`${styles['item-rows']}${additionalClass ? ` ${styles[additionalClass]}` : ""}`}>
      {children}
    </div>
  );
};

export default RowsWrapper;

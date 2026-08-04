import styles from './PageHeader.module.scss'

interface PageHeaderProps {
  title: string;
  subtitle: string;
  secondarySubtitle: string;
}

function PageHeader({ title, subtitle, secondarySubtitle }: PageHeaderProps) {
  return (
    <div className={styles['page-header']}>
      <h1>{title}</h1>
      <div className={styles.subtitle}>
        <p>{subtitle}</p>
        <p>{secondarySubtitle}</p>
      </div>
    </div>
  )
}

export default PageHeader
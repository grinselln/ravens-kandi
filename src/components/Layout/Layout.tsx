import { Link, NavLink } from 'react-router-dom'
import styles from './Layout.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import { faDiamond } from '@fortawesome/free-solid-svg-icons'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  darkNav?: boolean
}

function Layout({ children, darkNav = false }: LayoutProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  return (
    <div className={`${styles.layout} ${darkNav ? styles['nav-dark'] : ''}`}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>Raven's<FontAwesomeIcon icon={faDiamond} />Kandi</Link>
        {!darkNav && (
          <>
            <button className={styles.open} onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}><FontAwesomeIcon icon={faBars} /></button>
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
          </>
        )}
      </nav>
      <main>{children}</main>
    </div>
  )
}

export default Layout
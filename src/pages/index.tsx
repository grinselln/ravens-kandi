import styles from './Home.module.scss'
import { Link } from "react-router-dom";


const Home = () => {
  return (
    <div className={`${styles['hero-content-wrapper']} grid`}>
      <div className={`${styles['hero-content']} col col-md-9 col-lg-7`}>
        <p>I'm Raven, and (surprise) I make Kandi. What started at EDC Orlando in 2021 became something I couldn't stop — bracelets for festivals, concerts, theme parks, and every chance encounter in between.</p>
        <h1>This is my <span>art of connection.</span></h1>
        <div className={styles['hero-button-wrapper']}>
          <Link className={styles['hero-button']} to="/creations">
            view creations
          </Link>
          <Link className={styles['hero-button']} to="/about">
            about me
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

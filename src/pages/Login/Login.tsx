
import styles from "./Login.module.scss";
import { faDiamond } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useSearchParams } from "react-router-dom";
import { useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const errorMessage = useMemo(() => {
    if(error) {
      let errorMessage = null;

      switch (error) {
        case "authentication":
          errorMessage = "User is not authorized."
          break;
        case "connection":
          errorMessage = "Login connection error."
          break;
        default:
          break;
      }

      return errorMessage;
    }
  }, [error]);
  
  return (
    <div className={styles['login-wrapper']}>
      <div className={styles.login}>
        <h1><span>Raven's<FontAwesomeIcon icon={faDiamond} />Kandi</span>&nbsp;Admin Panel</h1>
        <div className={styles.actions}>
          <Link to={`${API_URL}/auth/google`} className={styles.primary}>Login</Link>
          {errorMessage && (
            <p>{errorMessage}</p>
          )}
          <Link to="/" className={styles.muted}>Back to Raven's Kandi</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

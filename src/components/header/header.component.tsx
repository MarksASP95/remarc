"use client";

import Link from "next/link";
import "./header.styles.scss";
import { useAuth } from '../../app/hooks/auth.hooks';

export default function Header() {
  
  const { signOut } = useAuth();

  return (
    <header className="header-component">
      <div className="row">
        <div className="column">
          <Link href="/" className="title">
            Remarc
          </Link>
        </div>

        <div className="column column-50 column-offset-25">
          <div className="header-options">
            <Link href="/entities" className="header-options__item">
              Entities
            </Link>
          </div>

        </div>
        <div className="column header-auth-options">
          <button onClick={signOut} className="button-clear">
            Logout
          </button>
        </div>

      </div>
  </header>
  );
}
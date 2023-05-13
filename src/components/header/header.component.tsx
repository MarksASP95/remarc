import Link from "next/link";
import "./header.styles.scss";

export default function Header() {
  

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

      </div>
  </header>
  );
}
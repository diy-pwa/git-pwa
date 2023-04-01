import React, { useState } from 'react';
import './Nav.css';
import '@fortawesome/fontawesome-free/css/all.css';

export default function (props) {
  const [sClassName, setsClassName] = useState("w3-sidebar w3-bar-block w3-black w3-card w3-animate-left w3-hide-medium w3-hide-large hidden");
  function toggle() {
    if (sClassName.includes("hidden")) {
      setsClassName(sClassName.replace(" hidden", ""));
    } else {
      setsClassName(sClassName + " hidden");
    }
  }

  return (
    <nav>
      {/*<!-- Navbar (sit on top) -->*/}
      <div role="navigation" aria-label='topNav'>
        <a href={props.navData.to} aria-label='home'>
          {props.navData.text}
        </a>
        {/*<!-- Right-sided navbar links -->*/}
        <div>
          {props.navData.items.map((item, key) => (
            <a key={key} href={item.to}>
              {item.text}
            </a>
          ))}
        </div>
        {/*<!-- Hide right-floated links on small screens and replace them with a menu icon -->*/}

        <a
          href="#"
          aria-label="openSideNav"
          onClick={toggle}
        >
          <i className="fa fa-bars"></i>
        </a>
      </div>

      {/*<!-- Sidebar on small screens when clicking the menu icon -->*/}
      <div role="navigation" aria-label='sideNav'
        className={sClassName}
      >
        <a
          href="#"
          onClick={toggle}
          aria-label="close"
        >
          Close &times;
        </a>
        {props.navData.items.map((item,key) => (
          <a key={key}
            href={item.to}
            onClick={toggle}
          >
            {item.text}
          </a>
        ))}
      </div>
    </nav>
  );
}

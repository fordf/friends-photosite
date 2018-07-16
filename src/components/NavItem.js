import React from 'react';
import { Link } from 'react-router-dom';


function NavItem(props) {
  return (
    <div>
        <Link {...props}>
          <div className={props.className || 'nav-item' + (props.selected ? ' selected-nav' : '')}>
            {props.children}
          </div>
        </Link>
    </div>
  );
}

export default NavItem;
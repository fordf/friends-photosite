import React from 'react';
import { range } from 'lodash';
import { Link } from 'react-router-dom';
import LazyLoad from 'react-lazy-load';

import Single from './Single';

function Gallery(props) {
  const images = props.images || props.photos[props.match.params.category];
  return (
    <div className="col">
      <div style={{width: props.mobile ? "100%" : "50%"}}>
        {range(0, images.length, 2).map((i) =>
          <LazyLoad offsetBottom={300} className="lazy-figure" key={i}>
            <Link to={`/gallery/${images[i].category}/${images[i].id}`}>
              <Single image={images[i]}/>
            </Link>
          </LazyLoad>
        )}
      </div>
      <div style={{width: props.mobile ? "100%" : "50%"}}>
        {range(1, images.length, 2).map((i) =>
          <LazyLoad offsetBottom={300} className="lazy-figure" key={i}>
            <Link to={`/gallery/${images[i].category}/${images[i].id}`}>
              <Single image={images[i]}/>
            </Link>
          </LazyLoad>
        )}
      </div>
    </div>
  );
}

export default Gallery;

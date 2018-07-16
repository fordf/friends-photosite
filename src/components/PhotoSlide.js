import React from 'react';
import { Carousel } from 'react-responsive-carousel';

function CarouselItem(props) {
  return (
    <div>
      <img className="middle" src={props.img.src} alt={props.img.caption}/>
      <span className="helper" style={{height: "100%"}}></span>
      <p className="legend">{props.img.caption}</p>
    </div>
  );
}

class PhotoSlide extends React.Component {
  render() {
    const {images} = this.props;
    if (!images.length) return <div/>;
    return (
      <Carousel
        showThumbs={false}
        autoPlay={true}
        interval={12000}
        infiniteLoop={true}
        showArrows={false}
        stopOnHover={false}
        showIndicators={false}
        showStatus={false}>
        {
            images.map(img => <CarouselItem key={img.src} img={img} />)
        }
      </Carousel>
    );
  }
}

export default PhotoSlide;
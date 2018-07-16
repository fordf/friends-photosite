import React from 'react';

class Single extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hover: props.match !== undefined };
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        if (this.props.image !== undefined) {
            this.setState({
                hover: !this.state.hover
            });
        }
    }

    render() {
        let image;
        if (this.props.image) {
            image = this.props.image
        } else {
            const category = this.props.match.params.category;
            const id = this.props.match.params.id;
            image = this.props.photos[category][id];
        }

        if (!image) return <div />;

        return (
            <figure onMouseEnter={this.toggle} onMouseLeave={this.toggle}>
                <img src={image.src} alt=""/>
                <figcaption
                    style={{visibility: this.state.hover ? 'visible' : 'hidden' }}
                    className="image-caption">
                    {image.caption}
                </figcaption>
            </figure>
        );
    }
};

export default Single;

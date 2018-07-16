import React from 'react';
import { Route } from 'react-router';
import s3Bucket from '../Bucket.js'

import NavBar from "./NavBar";
import About from "./About";
import Gallery from "./Gallery";
import PhotoSlide from "./PhotoSlide";
import Single from "./Single";

const reducer = (accumulator, currentValue) => accumulator.concat(currentValue);

const PropRoute = ({path, component, ...rest}) => {
    const Component = component;
    return <Route exact path={path} render={props => <Component {...rest} {...props} />} />;
};

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.state = {
            photos: {
                nature: [],
                wedding: [],
                portrait: [],
            },
            allPhotos: [],
            mobile: false
        }
    }

    updateDimensions() {
        const currentlyMobile = window.matchMedia("(max-width: 768px)").matches;
        if (this.state.mobile !== currentlyMobile) {
            this.setState({mobile: currentlyMobile});
        }
    }

    componentDidMount() {
        const {photos} = this.state;
        const bucket = process.env.REACT_APP_AWS_BUCKET_NAME;
        s3Bucket.getObject({
            Key: 'assets/captions.json'
        }).promise()
            .then((captionsData) => {
                const captions = JSON.parse(captionsData.Body.toString('utf-8'));
                const promises = Object.keys(photos).map((category) => new Promise((resolve, reject) => {
                    s3Bucket.listObjectsV2({
                        Prefix: `assets/${category.toLowerCase()}/`,
                    }).promise().then((data) => {
                        photos[category] = data.Contents
                            .filter((item) => item.Size)
                            .map((item, id) => {
                                const [_, category, picName] = item.Key.split('/');
                                return {
                                    src: `http://${bucket}.s3.amazonaws.com/${item.Key}`,
                                    caption: captions[picName] || '',
                                    category: category,
                                    id: id
                                }
                            });
                        resolve();
                    })
                }));
                Promise.all(promises).then(() => {
                    this.setState({
                        photos: photos,
                        allPhotos: shuffle(Object.keys(photos).map((key) => photos[key]).reduce(reducer, []))
                    });
                });
            })
            .catch((err) => console.log(err));
        window.addEventListener("resize", this.updateDimensions);
    }

    componentWillMount() {
        this.updateDimensions();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    render() {
        const {photos, mobile, allPhotos} = this.state;
        return (
            <div>
            <div className="nav-col">
                <NavBar />
            </div>
            <div className="main-col">
                <PropRoute path="/" component={mobile ? Gallery : PhotoSlide} images={allPhotos} mobile={mobile} />
                <PropRoute path="/gallery/:category" component={Gallery} photos={photos} mobile={mobile} />
                <PropRoute path="/gallery/:category/:id" component={Single} photos={photos} />
                <PropRoute path="/about" component={About} mobile={mobile} />
            </div>
            </div>
        );
    }
}

export default Main;

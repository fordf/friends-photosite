import React from 'react';
import NavItem from './NavItem';
import s3Bucket from '../Bucket.js'

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

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.nextQuote = this.nextQuote.bind(this);
    this.state = {
      selected: null,
      quotes: [[]],
      quoteIndex: 0,
    };
  }

  handleClick(x) {
    this.setState({
      selected: x
    });
  }

  nextQuote() {
    const {quotes, quoteIndex} = this.state;
    this.setState({
        quoteIndex: quoteIndex === quotes.length - 1 ? 0 : quoteIndex + 1
    });
  }

  componentDidMount() {
    s3Bucket.getObject({
      Key: 'assets/quotes.json'
    }).promise()
      .then(quotesData => {
        this.setState({
          quotes: shuffle(JSON.parse(quotesData.Body.toString('utf-8')))
        });
        window.setInterval(this.nextQuote, 60000);
      })
      .catch(err => console.log(err));
  }

  render () {
    const categories = ['Nature', 'Wedding', 'Portrait'];
    const {selected, quotes, quoteIndex, blurbState} = this.state;
    const [quote, author] = quotes[quoteIndex];
    return (
      <nav className="navbar">
        <NavItem
          to='/'
          className='brand'
          onClick={() => this.handleClick(null)}>
          <img src="/logo.gif" alt='Taze'/>
        </NavItem>
        <div className="social-links">
          <a href="https://www.instagram.com/hendersontaze/">
            <img src="/if_social-instagram-new-circle_1164349.png" alt='Instagram'/>
          </a>
          <a href="https://www.facebook.com/jaggedmountains/">
            <img src="/iconmonstr-facebook-4-48.png" alt='Facebook'/>
          </a>
        </div>
        <div className={'about-blurb ' + blurbState}>
          {quote}{author ? <div><br/>- {author}</div> : ''}
        </div>
        <span className="nav-items">
        {categories.map((category) =>
        <NavItem
          to={`/gallery/${category.toLowerCase()}`}
          onClick={() => this.handleClick(category)}
          selected={selected === category}
          key={category}>
          {category}
        </NavItem>
        )}
        <NavItem
          to="/about"
          onClick={() => this.handleClick("About")}
          selected={selected === "About"}>
          About
        </NavItem>
        </span>
      </nav>
    );
  }
}

export default NavBar;
import React from 'react';

function About(props) {
    return (
        <div className="container about">
            {props.mobile ? '' : <h2>About the photographer</h2>}
            <div className="container">
                <img className="selfie" src="/DSC_6208.jpg" alt=""/>
                <div className="col bio">
                    My name is Taze Henderson and I am a professional landscape, wedding, and portrait photographer.
                    <p>
                        Photography is my passion and a dream come true. Early in my career in 2010, I worked with a team of
    22 talented photographers for a large corporate studio taking engagement, wedding, family portraits,
    and ski action shots in Colorado. I’ve taken pictures of vacationing families from across the country
     and people such as Don Henley, Larry David, and Olympian Billy Kid.
                    </p>
                    <p>
                        Since then, I’ve moved to Seattle and I’m starting my business completely from scratch. My secret to
    success is to have fun. Successful photography is all about real emotion and bringing people together for
    lasting memories and friendships.
                    </p>
                    <p>
                        Tazehenderson@gmail.com
                    </p>
                    <p>
                        (970)-819- 1084
                    </p>
                </div>
            </div>
        </div>
    )
}

export default About;
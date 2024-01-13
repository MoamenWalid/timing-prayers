import React from 'react';

const Card = (props) => {
  return (
    <div className="card align-items-center p-2 text-light">
      <img src= {props.src} className="card-img-top" alt="img" style={{width: '50px'}} />
      <div className="card-body text-center">
        <h5 className="card-title">{props.title}</h5>
        <p className="card-text time">{props.time}</p>
      </div>
    </div>
  );
}

export default Card;

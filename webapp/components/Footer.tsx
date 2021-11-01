import React from 'react';

const Footer = (): JSX.Element => (
  <div
    style={{
      textAlign: 'center',
      width: '100%',
      fontSize: '15px',
      marginTop: '50px',
    }}
  >
    Originalt av og for <strong>Abakus</strong> | Adoptert av{' '}
    <strong>itDAGENE</strong> |{' '}
    <a
      style={{
        textDecoration: 'none',
        color: '#0778BC',
      }}
      href="https://github.com/webkom/kvittering"
      target="blank"
    >
      Bidra her
    </a>
  </div>
);

export default Footer;

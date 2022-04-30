const Footer = (): JSX.Element => (
  <div
    style={{
      textAlign: 'center',
      width: '100%',
      fontSize: '15px',
      marginTop: '50px',
    }}
  >
    Med ☕ av Webkom | for <strong>Abakus</strong> |{' '}
    <a
      style={{
        textDecoration: 'none',
        color: '#BC1818',
      }}
      href="https://github.com/webkom/kvittering"
      target="blank"
    >
      Bidra her
    </a>
  </div>
);

export default Footer;

'use client';

import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const ok = localStorage.getItem('cookieAccepted');
    if (!ok) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookieAccepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p>
        Wir verwenden Cookies, um unsere Website zu verbessern. Mehr Infos in unserer{' '}
        <a href="/datenschutz" target="_blank">Datenschutzerklärung</a>.
      </p>

      <button onClick={accept} className="cookie-btn">
        Akzeptieren
      </button>
    </div>
  );
}

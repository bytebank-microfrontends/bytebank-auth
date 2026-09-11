import { useEffect, useRef, useState } from "react";

export const COOKIE_CONSENT_STORAGE_KEY = "bytebank-cookie-consent";

export interface CookieConsentPreferences {
  necessary: true;
  analytics: boolean;
  personalization: boolean;
}

export const DEFAULT_COOKIE_CONSENT_PREFERENCES: CookieConsentPreferences = {
  necessary: true,
  analytics: false,
  personalization: false,
};

export const ALL_COOKIE_CONSENT_PREFERENCES: CookieConsentPreferences = {
  necessary: true,
  analytics: true,
  personalization: true,
};

const COOKIE_CONSENT_TEXT =
  "Usamos cookies para segurança, funcionamento do portal e melhoria da experiência. Você pode revisar suas preferências na Definição de Cookies.";

const parseStoredPreferences = (
  storedPreferences: string | null
): CookieConsentPreferences | undefined => {
  if (!storedPreferences) {
    return undefined;
  }

  try {
    const parsedPreferences = JSON.parse(storedPreferences) as Partial<
      Record<keyof CookieConsentPreferences, unknown>
    >;

    if (parsedPreferences.necessary !== true) {
      return undefined;
    }

    return {
      necessary: true,
      analytics: parsedPreferences.analytics === true,
      personalization: parsedPreferences.personalization === true,
    };
  } catch (_error) {
    return undefined;
  }
};

const hasSavedCookieConsentDecision = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    parseStoredPreferences(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    )
  );
};

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(
    () => !hasSavedCookieConsentDecision()
  );
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(
    DEFAULT_COOKIE_CONSENT_PREFERENCES
  );
  const closeDialogButtonRef = useRef<HTMLButtonElement>(null);
  const preferencesButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isPreferencesDialogOpen) {
      closeDialogButtonRef.current?.focus();
    }
  }, [isPreferencesDialogOpen]);

  const persistPreferences = (
    nextPreferences: CookieConsentPreferences
  ): void => {
    // Cookies estritamente necessários não dependem de consentimento.
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(nextPreferences)
    );
    setIsVisible(false);
    setIsPreferencesDialogOpen(false);
  };

  const handleAcceptAll = () => {
    persistPreferences(ALL_COOKIE_CONSENT_PREFERENCES);
  };

  const handleSavePreferences = () => {
    persistPreferences({
      necessary: true,
      analytics: preferences.analytics,
      personalization: preferences.personalization,
    });
  };

  const handleClosePreferences = () => {
    setIsPreferencesDialogOpen(false);
    preferencesButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isPreferencesDialogOpen) {
      return undefined;
    }

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClosePreferences();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isPreferencesDialogOpen]);

  if (!isVisible) {
    return null;
  }

  return (
    <section
      className="bb-cookie-consent"
      aria-labelledby="bb-cookie-consent-title"
    >
      <div className="bb-cookie-consent__content">
        <div className="bb-cookie-consent__copy">
          <h2 id="bb-cookie-consent-title" className="visually-hidden">
            Consentimento de cookies
          </h2>
          <p className="bb-cookie-consent__text">{COOKIE_CONSENT_TEXT}</p>
        </div>

        <div className="bb-cookie-consent__actions">
          <button
            ref={preferencesButtonRef}
            type="button"
            className="bb-cookie-consent__secondary"
            onClick={() => setIsPreferencesDialogOpen(true)}
          >
            Definição de Cookies
          </button>
          <button
            type="button"
            className="bb-cookie-consent__accept"
            onClick={handleAcceptAll}
          >
            Aceitar todos
          </button>
        </div>
      </div>

      {isPreferencesDialogOpen ? (
        <div
          className="bb-cookie-consent-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bb-cookie-preferences-title"
        >
          <div className="bb-cookie-consent-modal__panel">
            <div className="bb-cookie-consent-modal__header">
              <div>
                <h2
                  id="bb-cookie-preferences-title"
                  className="bb-cookie-consent-modal__title"
                >
                  Definição de Cookies
                </h2>
                <p className="bb-cookie-consent-modal__description">
                  Ajuste suas preferências para este portal.
                </p>
              </div>
              <button
                ref={closeDialogButtonRef}
                type="button"
                className="bb-cookie-consent-modal__close"
                onClick={handleClosePreferences}
                aria-label="Fechar definição de cookies"
              >
                ×
              </button>
            </div>

            <div className="bb-cookie-consent-modal__options">
              <div className="bb-cookie-consent-option">
                <div className="bb-cookie-consent-option__copy">
                  <h3 className="bb-cookie-consent-option__title">
                    Necessários
                  </h3>
                  <p className="bb-cookie-consent-option__description">
                    Necessários para funcionamento e segurança do portal.
                  </p>
                </div>
                <label className="bb-cookie-consent-toggle">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    aria-describedby="bb-cookie-necessary-status"
                  />
                  <span className="bb-cookie-consent-toggle__control" />
                  <span
                    id="bb-cookie-necessary-status"
                    className="bb-cookie-consent-toggle__label"
                  >
                    Sempre ativos
                  </span>
                </label>
              </div>

              <div className="bb-cookie-consent-option">
                <div className="bb-cookie-consent-option__copy">
                  <h3 className="bb-cookie-consent-option__title">
                    Analíticos
                  </h3>
                  <p className="bb-cookie-consent-option__description">
                    Ajudam a entender como o portal é utilizado.
                  </p>
                </div>
                <label className="bb-cookie-consent-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(event) =>
                      setPreferences((currentPreferences) => ({
                        ...currentPreferences,
                        analytics: event.target.checked,
                      }))
                    }
                  />
                  <span className="bb-cookie-consent-toggle__control" />
                  <span className="bb-cookie-consent-toggle__label">
                    Analíticos
                  </span>
                </label>
              </div>

              <div className="bb-cookie-consent-option">
                <div className="bb-cookie-consent-option__copy">
                  <h3 className="bb-cookie-consent-option__title">
                    Personalização
                  </h3>
                  <p className="bb-cookie-consent-option__description">
                    Permitem lembrar preferências de experiência.
                  </p>
                </div>
                <label className="bb-cookie-consent-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.personalization}
                    onChange={(event) =>
                      setPreferences((currentPreferences) => ({
                        ...currentPreferences,
                        personalization: event.target.checked,
                      }))
                    }
                  />
                  <span className="bb-cookie-consent-toggle__control" />
                  <span className="bb-cookie-consent-toggle__label">
                    Personalização
                  </span>
                </label>
              </div>
            </div>

            <div className="bb-cookie-consent-modal__actions">
              <button
                type="button"
                className="bb-cookie-consent__secondary"
                onClick={handleSavePreferences}
              >
                Salvar preferências
              </button>
              <button
                type="button"
                className="bb-cookie-consent__accept"
                onClick={handleAcceptAll}
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

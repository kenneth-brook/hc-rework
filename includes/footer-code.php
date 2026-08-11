<script type="text/javascript" src="js/clock.js"></script>
<script type="text/javascript" src="js/functions.js"></script>





<script>
  (function() {
    var s = document.createElement('script');
    var h = document.querySelector('head') || document.body;
    s.src = 'https://acsbapp.com/apps/app/dist/js/app.js';
    s.async = true;
    s.onload = function() {
      acsbJS.init({
        statementLink: '',
        footerHtml: '',
        hideMobile: false,
        hideTrigger: false,
        disableBgProcess: false,
        language: 'en',
        position: 'left',
        leadColor: '#1268BD',
        triggerColor: '#1268BD',
        triggerRadius: '50%',
        triggerPositionX: 'left',
        triggerPositionY: 'bottom',
        triggerIcon: 'people',
        triggerSize: 'bottom',
        triggerOffsetX: 20,
        triggerOffsetY: 20,
        mobile: {
          triggerSize: 'small',
          triggerPositionX: 'left',
          triggerPositionY: 'bottom',
          triggerOffsetX: 10,
          triggerOffsetY: 10,
          triggerRadius: '20'
        }
      });
    };
    h.appendChild(s);
  })();
</script>





    <!-- Aurelian Chat Widget Script -->
 <script async id="aurelian-chat-widget-script" src="https://help.aurelian.io/chat-widget/latest/client.js" data-embed-id="3567dbcd-4176-4b6c-acff-05c22f024788" data-position="bottom-left" data-offset-y="80" data-phone-number="+14233960096"></script>
  


 <!-- Klaro Cookie Consent + Google Consent Mode v2 + GA4 + Google Ads -->

<link
  rel="stylesheet"
  href="https://cdn.kiprotect.com/klaro/latest/klaro.min.css"
>

<script>
  /*
   * Google Consent Mode must be initialized
   * before loading the Google tag.
   */
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  /*
   * Deny optional storage until the visitor gives consent.
   */
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  /*
   * Klaro configuration.
   */
  window.klaroConfig = {
    elementID: 'klaro',
    storageMethod: 'cookie',
    cookieName: 'klaro-consent',
    cookieExpiresAfterDays: 180,

    mustConsent: false,
    acceptAll: true,
    hideDeclineAll: false,

    translations: {
      en: {
        consentNotice: {
          description:
            'This website uses cookies for essential functionality, analytics and advertising. You can accept all cookies or manage your preferences.'
        },
        consentModal: {
          title: 'Cookie Preferences',
          description:
            'Choose which services you want to allow. You can change your preferences at any time.'
        },
        purposes: {
          analytics: 'Analytics',
          marketing: 'Marketing'
        }
      }
    },

    services: [
      {
        name: 'googleAnalytics',
        title: 'Google Analytics',
        purposes: ['analytics'],

        cookies: [
          /^_ga/,
          /^_gid/,
          /^_gat/,
          /^_gac_/,
          /^_gcl_/
        ],

        required: false,
        default: false
      },

      {
        name: 'googleAds',
        title: 'Google Ads',
        purposes: ['marketing'],

        cookies: [
          /^_gcl_/,
          /^_gac_/,
          /^IDE$/,
          /^DSID$/,
          /^NID$/,
          /^ANID$/,
          /^FLC$/,
          /^AID$/,
          /^TAID$/,
          /^RUL$/,
          /^__Secure-/
        ],

        required: false,
        default: false
      }
    ]
  };
</script>

<!-- Load the Google tag only once -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-FW7KZS2FJS">
</script>

<script>
  gtag('js', new Date());

  /*
   * Google Analytics 4.
   */
  gtag('config', 'G-FW7KZS2FJS', {
    anonymize_ip: true
  });

  /*
   * Google Ads.
   * Conversion events require their own conversion event snippets.
   */
  gtag('config', 'AW-16524757548');

  /*
   * Update Google Consent Mode based on Klaro selections.
   */
  function updateGoogleConsent(manager) {
    var consents =
      manager && manager.consents
        ? manager.consents
        : {};

    var analyticsAllowed =
      consents.googleAnalytics === true;

    var marketingAllowed =
      consents.googleAds === true;

    gtag('consent', 'update', {
      analytics_storage:
        analyticsAllowed ? 'granted' : 'denied',

      ad_storage:
        marketingAllowed ? 'granted' : 'denied',

      ad_user_data:
        marketingAllowed ? 'granted' : 'denied',

      ad_personalization:
        marketingAllowed ? 'granted' : 'denied'
    });
  }

  /*
   * Wait until Klaro is available, then apply saved consent
   * and watch for future preference changes.
   */
  window.addEventListener('load', function () {
    var attempts = 0;

    var checkKlaro = setInterval(function () {
      attempts++;

      if (
        window.klaro &&
        typeof window.klaro.getManager === 'function'
      ) {
        clearInterval(checkKlaro);

        var manager = window.klaro.getManager();

        /*
         * Apply previously saved consent immediately.
         */
        updateGoogleConsent(manager);

        /*
         * Update Google whenever consent changes.
         */
        manager.watch({
          update: function (updatedManager) {
            updateGoogleConsent(
              updatedManager || manager
            );
          }
        });
      }

      /*
       * Stop checking after approximately 15 seconds.
       */
      if (attempts >= 50) {
        clearInterval(checkKlaro);
      }
    }, 300);
  });
</script>

<!-- Load Klaro -->
<script
  defer
  src="https://cdn.kiprotect.com/klaro/latest/klaro.js">
</script>

<style>
  /* Klaro neutral black-and-white theme */

  .klaro .cookie-notice,
  .klaro .cookie-modal {
    color: #111 !important;
  }

  .klaro .cookie-notice,
  .klaro .cm-modal {
    background: #fff !important;
    border: 1px solid #ddd !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18) !important;
  }

  .klaro .cm-btn,
  .klaro .cn-ok button {
    background: #111 !important;
    color: #fff !important;
    border: 1px solid #111 !important;
  }

  .klaro .cm-btn-danger,
  .klaro .cm-btn-decline {
    background: #fff !important;
    color: #111 !important;
    border: 1px solid #111 !important;
  }

  .klaro input[type="checkbox"]:checked
    + .cm-list-input::before,
  .klaro .cm-list-input:checked {
    background-color: #111 !important;
  }

  .klaro,
  .klaro p,
  .klaro span,
  .klaro label,
  .klaro li,
  .klaro strong,
  .klaro h1,
  .klaro h2,
  .klaro h3,
  .klaro h4,
  .klaro .title,
  .klaro .description {
    color: #111 !important;
  }

  .klaro a {
    color: #111 !important;
    text-decoration: underline !important;
  }
</style>
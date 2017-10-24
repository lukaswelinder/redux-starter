import next from 'next';
import path from 'path';
import compression from 'compression';
import express from 'express';
import favicon from 'serve-favicon';
import {} from './env';
import createSSR from './SSR/createSSR';
import config from './../app/config';
import i18n from './../helpers/i18n';
import langs from './../helpers/langs';

const i18nextMiddleware = require('i18next-express-middleware');
const Backend = require('i18next-node-fs-backend');

const { host, port } = config.server;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });

export default function (parameters) {
  const langsArray = langs.map(c => c.value);
  i18n
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
      preload: langsArray, // preload all langages
      whitelist: langsArray,
      appendNamespaceToCIMode: false,
      ns: ['common'], // need to preload all the namespaces
      backend: {
        loadPath: path.join(__dirname, '..', '/locales/{{lng}}/{{ns}}.json')
      },
      detection: {
        order: ['cookie'],
        lookupCookie: 'i18next',
        caches: ['cookie']
      }
    }, () => {
      // loaded translations we can bootstrap our routes
      app.prepare()
        .then(() => {
          const server = express();

          // enable middleware for i18next
          server.use(i18nextMiddleware.handle(i18n));

          // serve locales for client
          server.use('/locales', express.static(path.join(__dirname, '..', 'locales')));

          if (config.isProd) {
            server.use(compression());
          }
          server.disable('etag');
          server.disable('x-powered-by');
          server.use('/', express.static('static', { etag: false }));
          server.use(favicon(path.join(__dirname, '..', 'favicons', 'favicon.ico')));

          server.get('/api/users', (req, res) => {
            res.json({
              records: [
                { id: 1, name: 'Justin Timberlake' },
                { id: 2, name: 'Kanye West' }
              ]
            });
          });

          server.use((req, res, _next) => {
            if (config.ssl) {
              if (req.headers['x-forwarded-proto'] !== 'https') {
                res.redirect(302, 'https://' + req.hostname + req.originalUrl);
              } else {
                _next();
              }
            } else {
              _next();
            }
          });

          server.get('*', (req, res, _next) => { // eslint-disable-line
            const lng = req.url.split('/');
            const locale = (lng && lng[1]) || req.language.split('-')[0];
            const isLang = langsArray.indexOf(locale) > -1;

            if (isLang) {
              req.i18n.changeLanguage(locale);
            }

            if (!isLang) {
              res.status(302);
              return res.redirect(`/${req.language}`);
            } else if (req.url === '/') {
              return res.redirect(`/${locale}`);
            } else if (req.url.slice(-1) === '/') {
              return res.redirect(req.url.slice(0, -1));
            }
            return _next();
          });

          server.get('*', createSSR(parameters.chunks()));

          server.listen(port, (err) => { // eslint-disable-line
            if (err) {
              return console.error(err);
            }
            console.info(`Listening at ${host}:${port}`);
          });
        });
    });
}

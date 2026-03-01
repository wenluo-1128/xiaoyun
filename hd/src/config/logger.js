const path = require('path');
const { createLogger, format, transports } = require('winston');

const redact = (obj) => {
  const s = JSON.stringify(obj);
  return s.replace(/(PG_PASSWORD|password|secret|token|auth|key)"\s*:\s*"[^"]+/gi, '$1":"***"')
          .replace(/(user_id|userid)"\s*:\s*"?\d+"?/gi, '$1":"***"');
};

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf((info) => {
      const base = { 
        level: info.level, 
        message: info.message, 
        timestamp: info.timestamp,
        request_id: info.request_id || 'N/A',
        response_time: info.response_time || 'N/A'
      };
      const rest = Object.assign({}, info);
      delete rest.level;
      delete rest.message;
      delete rest.timestamp;
      delete rest.request_id;
      delete rest.response_time;
      return `${redact(Object.assign(base, rest))}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join('logs', 'app.log') }),
    new transports.File({ 
      filename: path.join('logs', 'error.log'),
      level: 'error'
    }),
    new transports.File({ 
      filename: path.join('logs', 'performance.log'),
      level: 'warn',
      filter: (info) => info.message && (info.message.includes('Slow API') || info.message.includes('performance'))
    })
  ]
});

module.exports = logger;

const crypto = require('crypto');

function encryptSensitiveData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['phone', 'email', 'address', 'credit_card', 'password'];
  const encryptedData = { ...data };
  
  sensitiveFields.forEach(field => {
    if (encryptedData[field]) {
      const hashedValue = crypto.createHash('sha256').update(String(encryptedData[field])).digest('hex').substring(0, 16);
      encryptedData[field] = `***${hashedValue}***`;
    }
  });
  
  return encryptedData;
}

module.exports = { encryptSensitiveData };

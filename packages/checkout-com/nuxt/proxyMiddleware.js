import axios from 'axios';

const processPost = (req) => {
  return new Promise(resolve => {
    let jsonString = '';
    if (req.method === 'POST') {
      req.on('data', data => {
        jsonString += data;
      });

      req.on('end', () => {
        resolve(JSON.parse(jsonString));
      });
    }
  });
};

const wait = (time) => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};

const sendJsonResponse = (res, json) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(json);
};
const notFound = next => next({ statusCode: 404, message: 'Not found' });
const badRequest = next => next({ statusCode: 400, message: 'Bad request or server error' });

const apiRequestHeaders = (secretKey) => ({
  headers: {
    authorization: secretKey,
    'Content-Type': 'application/json'
  }
});

const getStoredMethods = async ({ publicKey, secretKey, customerId }) => {
  try {
    const { data } = await axios.get(`https://play-commercetools.cko-playground.ckotech.co/merchants/${publicKey}/customers/${customerId}`, apiRequestHeaders(secretKey));
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const removeStoredMethod = async ({ publicKey, secretKey, customerId, paymentInstrumentId }) => {
  try {
    const response = await axios.delete(`https://play-commercetools.cko-playground.ckotech.co/merchants/${publicKey}/customers/${customerId}/payment-instruments/${paymentInstrumentId}`, apiRequestHeaders(secretKey));
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
};

/**
 * POST /cko-api/payment-instruments
 *  Method: getStoredMethods
 *  Body:
 *    customer_id: Required
 *
 * DELETE /cko-api/payment-instruments/{customerId}/{paymentInstrumentId}
 *  Method: removeStoredMethod
 */

export default ({ publicKey, secretKey }) => async (req, res, next) => {
  switch (req.method) {
    case 'POST':
      if (req.url !== '/') {
        return notFound(next);
      }
      const body = await Promise.race([
        processPost(req),
        wait(5000)
      ]);
      if (!body || !body.customer_id) {
        return badRequest(next);
      }
      const data = await getStoredMethods({ publicKey, secretKey, customerId: body.customer_id });
      if (data) {
        return sendJsonResponse(res, JSON.stringify(data));
      }
      return badRequest(next);
    case 'DELETE':
      const urlParams = req.url.substr(1).split('/');
      if (urlParams.length > 2) {
        return badRequest(next);
      }
      const response = await removeStoredMethod({
        publicKey,
        secretKey,
        customerId: urlParams[0],
        paymentInstrumentId: urlParams[1]
      });
      if (response) {
        return sendJsonResponse(res, JSON.stringify({}));
      }
      return badRequest(next);
    default:
      return notFound(next);
  }
};

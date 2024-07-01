export function createMessage(data) {
  return { action: 'message', data: { statusCode: 200,  body: data }};
}

export function createError(error) {
  const statusCode = error.statusCode ?? 500;
  const message = error.message ?? error;
  const code = error.code ?? 'ERROR';
  return { action: 'error', data: { statusCode, body: { message: message, code }}};
}



export default {
  createMessage,
  createError
}

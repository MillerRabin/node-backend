import { telegram } from './config.mjs';

export const sendMessage = async (message) => {
    const { url, token, chat_id } = telegram;
    const res = await fetch(`${url}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ chat_id, text: message }),
        redirect: 'follow',
    });
    return res.text();
}

export default {
    sendMessage,
}
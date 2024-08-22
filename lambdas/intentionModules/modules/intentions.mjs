export const intentions = [{
  id: "fd164e94-a011-4c15-91db-e2ace0d78c41",
  input: "AuthService", 
  output: "Token",
  title: { en: "Provides auth service", ru: "Сервис аутентификации" },
  description: { 
    en: "Can register and login user by voice", 
    ru: "Могу зарегистрировать и авторизовать по голосу пользователя" 
  },
  onData: "users.auth", 
  interface: { register: { 
    result: "Token", 
    arguments: { voiceData: "B64Audio", deviceId: "uuid" }}, 
    login: { 
    result: "Token", 
    arguments: { 
      voiceData: "B64Audio", 
      deviceId: "uuid" 
    }
  }}
}];

export default {
  intentions
}
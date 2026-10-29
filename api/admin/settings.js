import settingsHandler from '../settings.js';

export default async function handler(req, res) {
  return settingsHandler(req, res);
}

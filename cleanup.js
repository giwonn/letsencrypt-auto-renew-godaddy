import api from "./api.js";

export default async function cleanUp() {
    const txtRecords = await api.getWithoutChallenge();
    await api.update(txtRecords);
    console.log('_acme-challenge record deleted')
}
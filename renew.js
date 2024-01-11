import api from "./api.js";

export default async function renew() {
  const txtRecords = await api.getWithoutChallenge();

  const acmeChallengeRecord = {
      name: '_acme-challenge',
      data: process.env.CERTBOT_VALIDATION,
      type: 'TXT',
      ttl: 600,
  };

  await api.update([...txtRecords, acmeChallengeRecord]);
  console.log('_acme-challenge record updated');
  
  // godaddy의 경우 TTL이 가장 짧아도 10분임
  // 체감상 15분이 넘어가야 record가 전파가 되었음
  // 넉넉하게 20분 delay
  await new Promise(resolve => setTimeout(resolve, 1200000));
}

import fetch from 'node-fetch';

function getUrl() {
    return  `https://api.godaddy.com/v1/domains/${process.env.DOMAIN}/records/TXT`;
}

function getHeaders() {
    return {
        'Authorization': `sso-key ${process.env.API_KEY}:${process.env.API_SECRET}`,
        'Content-Type': 'application/json'
    };
}

async function getWithoutChallenge() {
    return await fetch(getUrl(), { headers: getHeaders() })
        .then(res => res.json())
        .then(res => res.filter(record => record.name !== '_acme-challenge'));
}

async function update(txtRecords) {
    return await fetch(getUrl(), { method: 'PUT', headers: getHeaders(), body: JSON.stringify(txtRecords) })
}

export default {
    getWithoutChallenge,
    update
}